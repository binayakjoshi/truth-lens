import os
import random
from dataclasses import dataclass
from datetime import datetime

import cv2
import numpy as np
import torch
from facenet_pytorch import MTCNN
from tqdm import tqdm

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_DATASET_DIR = os.path.join(CURRENT_DIR, "FaceForensics++_C23")
OUTPUT_ROOT = os.path.join(CURRENT_DIR, "data", "truthlens_dataset")

OUTPUT_FRAME_SIZE = (224, 224)
FRAMES_PER_VIDEO = 10  # Same count for real and fake; set to 8 if preferred

MIN_FACE_SIZE = 80  # Min bbox width/height in pixels before resize
MIN_BLUR_VARIANCE = 100.0  # Laplacian variance; lower = blurrier
MTCNN_CONFIDENCE_THRESHOLD = 0.85

FAKE_SUBFOLDERS = {
    "DeepFakeDetection",
    "Deepfakes",
    "Face2Face",
    "FaceShifter",
    "FaceSwap",
    "NeuralTextures",
}
REAL_SUBFOLDER = "original"
RANDOM_SEED = 42

_detector = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


@dataclass
class ExtractionStats:
    """Tracks frame counts at each filtering stage."""

    videos_total: int = 0
    videos_failed_open: int = 0
    frames_sampled: int = 0
    rejected_no_face: int = 0
    rejected_low_confidence: int = 0
    rejected_small_crop: int = 0
    rejected_blurry: int = 0
    rejected_duplicate: int = 0
    frames_saved: int = 0

    def merge(self, other: "ExtractionStats") -> None:
        for name in (
            "videos_total",
            "videos_failed_open",
            "frames_sampled",
            "rejected_no_face",
            "rejected_low_confidence",
            "rejected_small_crop",
            "rejected_blurry",
            "rejected_duplicate",
            "frames_saved",
        ):
            setattr(self, name, getattr(self, name) + getattr(other, name))

    @property
    def passed_all_filters(self) -> int:
        return self.frames_saved

    @property
    def after_deduction(self) -> int:
        return (
            self.frames_sampled
            - self.rejected_no_face
            - self.rejected_low_confidence
            - self.rejected_small_crop
            - self.rejected_blurry
            - self.rejected_duplicate
        )

    def log_summary(self, label: str) -> None:
        print(f"\n{'=' * 60}")
        print(f"  {label} — Extraction Funnel")
        print(f"{'=' * 60}")
        print(f"  Videos processed       : {self.videos_total}")
        print(f"  Videos failed to open  : {self.videos_failed_open}")
        print(f"  Frames sampled         : {self.frames_sampled}")
        print("  ── Rejections ──")
        print(f"    No face detected     : {self.rejected_no_face}")
        print(
            f"    Low MTCNN confidence : {self.rejected_low_confidence}"
            f"  (< {MTCNN_CONFIDENCE_THRESHOLD:.0%})"
        )
        print(
            f"    Face too small       : {self.rejected_small_crop}"
            f"  (< {MIN_FACE_SIZE}px)"
        )
        print(
            f"    Blurry face          : {self.rejected_blurry}"
            f"  (var < {MIN_BLUR_VARIANCE})"
        )
        print(f"    Duplicate hash       : {self.rejected_duplicate}")
        print("  ── Result ──")
        print(f"  Frames saved           : {self.frames_saved}")
        if self.frames_sampled:
            keep_rate = 100.0 * self.frames_saved / self.frames_sampled
            print(f"  Keep rate              : {keep_rate:.1f}%")
        print(f"{'=' * 60}")


class DuplicateFilter:
    """Filters exact duplicate crops using average perceptual hash."""

    def __init__(self) -> None:
        self._seen: set[int] = set()

    def is_duplicate(self, image: np.ndarray) -> bool:
        image_hash = compute_average_hash(image)
        if image_hash in self._seen:
            return True
        self._seen.add(image_hash)
        return False


def get_detector() -> MTCNN:
    global _detector
    if _detector is None:
        _detector = MTCNN(keep_all=False, device=device, post_process=False)
    return _detector


def compute_average_hash(image: np.ndarray, hash_size: int = 8) -> int:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (hash_size, hash_size), interpolation=cv2.INTER_AREA)
    avg = resized.mean()
    bits = (resized > avg).astype(np.uint8).flatten()
    value = 0
    for bit in bits:
        value = (value << 1) | int(bit)
    return value


def is_blurry(image: np.ndarray) -> bool:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    return variance < MIN_BLUR_VARIANCE


def discover_local_videos() -> tuple[list[str], list[str]]:
    real_paths: list[str] = []
    fake_paths: list[str] = []

    for root, _, files in os.walk(INPUT_DATASET_DIR):
        for f in files:
            if f.lower().endswith((".mp4", ".avi", ".mkv", ".mov")):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, INPUT_DATASET_DIR)
                parts = rel_path.replace("\\", "/").split("/")

                if not parts:
                    continue

                category = parts[0]
                if category == REAL_SUBFOLDER:
                    real_paths.append(full_path)
                elif category in FAKE_SUBFOLDERS:
                    fake_paths.append(full_path)

    return real_paths, fake_paths


def detect_face_crop(frame: np.ndarray, stats: ExtractionStats) -> np.ndarray | None:
    if frame is None or frame.size == 0:
        stats.rejected_no_face += 1
        return None

    try:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        boxes, probs = get_detector().detect(frame_rgb)

        if boxes is None or len(boxes) == 0:
            stats.rejected_no_face += 1
            return None

        confidence = float(probs[0])
        if confidence < MTCNN_CONFIDENCE_THRESHOLD:
            stats.rejected_low_confidence += 1
            return None

        x1, y1, x2, y2 = map(int, boxes[0])
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(frame.shape[1], x2), min(frame.shape[0], y2)

        face_w, face_h = x2 - x1, y2 - y1
        if face_w < MIN_FACE_SIZE or face_h < MIN_FACE_SIZE:
            stats.rejected_small_crop += 1
            return None

        face_crop = frame[y1:y2, x1:x2]
        if face_crop.size == 0:
            stats.rejected_no_face += 1
            return None

        if is_blurry(face_crop):
            stats.rejected_blurry += 1
            return None

        return cv2.resize(face_crop, OUTPUT_FRAME_SIZE)
    except Exception:
        stats.rejected_no_face += 1
        return None


def extract_frames_from_video(
    video_path: str,
    frames_to_extract: int,
    stats: ExtractionStats,
    duplicate_filter: DuplicateFilter,
) -> list[np.ndarray]:
    frames: list[np.ndarray] = []
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        stats.videos_failed_open += 1
        return frames

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        stats.videos_failed_open += 1
        return frames

    step = max(total_frames // (frames_to_extract + 1), 1)
    current_attempt = 1

    while len(frames) < frames_to_extract:
        frame_idx = step * current_attempt
        if frame_idx >= total_frames:
            break

        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        current_attempt += 1

        if not ret or frame is None:
            continue

        stats.frames_sampled += 1
        face_img = detect_face_crop(frame, stats)
        if face_img is None:
            continue

        if duplicate_filter.is_duplicate(face_img):
            stats.rejected_duplicate += 1
            continue

        frames.append(face_img)

    cap.release()
    return frames


def process_videos(
    video_paths: list[str],
    output_dir: str,
    label: str,
    duplicate_filter: DuplicateFilter,
) -> ExtractionStats:
    stats = ExtractionStats(videos_total=len(video_paths))
    os.makedirs(output_dir, exist_ok=True)

    for path in tqdm(video_paths, desc=f"Extracting {label}"):
        face_frames = extract_frames_from_video(
            path, FRAMES_PER_VIDEO, stats, duplicate_filter
        )

        video_name = os.path.splitext(os.path.basename(path))[0]
        for idx, img in enumerate(face_frames):
            out_path = os.path.join(output_dir, f"{video_name}_fr{idx}.jpg")
            cv2.imwrite(out_path, img)
            stats.frames_saved += 1

    stats.log_summary(label)
    return stats


def write_run_log(
    total: ExtractionStats, real: ExtractionStats, fake: ExtractionStats
) -> None:
    log_path = os.path.join(OUTPUT_ROOT, "extraction_log.txt")
    os.makedirs(OUTPUT_ROOT, exist_ok=True)

    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"Extraction run: {datetime.now().isoformat(timespec='seconds')}\n\n")
        f.write("Configuration\n")
        f.write(f"  frames_per_video          : {FRAMES_PER_VIDEO}\n")
        f.write(f"  mtcnn_confidence_threshold: {MTCNN_CONFIDENCE_THRESHOLD}\n")
        f.write(f"  min_face_size_px          : {MIN_FACE_SIZE}\n")
        f.write(f"  min_blur_variance         : {MIN_BLUR_VARIANCE}\n")
        f.write(f"  output_frame_size         : {OUTPUT_FRAME_SIZE}\n\n")

        for label, s in [("REAL", real), ("FAKE", fake), ("TOTAL", total)]:
            f.write(f"[{label}]\n")
            f.write(f"  videos_total           : {s.videos_total}\n")
            f.write(f"  frames_sampled         : {s.frames_sampled}\n")
            f.write(f"  rejected_no_face       : {s.rejected_no_face}\n")
            f.write(f"  rejected_low_confidence: {s.rejected_low_confidence}\n")
            f.write(f"  rejected_small_crop    : {s.rejected_small_crop}\n")
            f.write(f"  rejected_blurry        : {s.rejected_blurry}\n")
            f.write(f"  rejected_duplicate     : {s.rejected_duplicate}\n")
            f.write(f"  frames_saved           : {s.frames_saved}\n\n")

    print(f"\nRun log written to: {log_path}")


def run_extraction() -> None:
    random.seed(RANDOM_SEED)

    print(f"Device: {device.type.upper()}")
    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    else:
        print("WARNING: CUDA unavailable — using CPU.")

    print("\nConfiguration:")
    print(f"  Frames per video (real & fake) : {FRAMES_PER_VIDEO}")
    print(f"  MTCNN confidence threshold     : {MTCNN_CONFIDENCE_THRESHOLD:.0%}")
    print(f"  Min face bbox size             : {MIN_FACE_SIZE}px")
    print(f"  Min blur variance (Laplacian)  : {MIN_BLUR_VARIANCE}")
    print(f"  Output size                    : {OUTPUT_FRAME_SIZE}")

    print(f"\nScanning: {INPUT_DATASET_DIR}")
    if not os.path.exists(INPUT_DATASET_DIR):
        raise FileNotFoundError(f"Input directory not found: {INPUT_DATASET_DIR}")

    real_paths, fake_paths = discover_local_videos()
    print(f"Found -> Real: {len(real_paths)} videos | Fake: {len(fake_paths)} videos")

    if not real_paths and not fake_paths:
        raise ValueError("No valid video files found.")

    duplicate_filter = DuplicateFilter()
    real_stats = ExtractionStats()
    fake_stats = ExtractionStats()

    if real_paths:
        real_stats = process_videos(
            real_paths,
            os.path.join(OUTPUT_ROOT, "real"),
            "Real",
            duplicate_filter,
        )

    if fake_paths:
        fake_stats = process_videos(
            fake_paths,
            os.path.join(OUTPUT_ROOT, "fake"),
            "Fake",
            duplicate_filter,
        )

    total_stats = ExtractionStats()
    total_stats.merge(real_stats)
    total_stats.merge(fake_stats)
    total_stats.log_summary("Combined Total")

    write_run_log(total_stats, real_stats, fake_stats)
    print(f"\nDone. Extracted faces saved to: {OUTPUT_ROOT}")


if __name__ == "__main__":
    run_extraction()
