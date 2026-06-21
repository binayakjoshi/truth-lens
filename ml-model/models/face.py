import os
from dataclasses import dataclass
from datetime import datetime

import cv2
import numpy as np
import torch
from facenet_pytorch import MTCNN
from tqdm import tqdm

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_ROOT = os.path.join(CURRENT_DIR, "data", "stage1_raw")
OUTPUT_ROOT = os.path.join(CURRENT_DIR, "data", "stage2_faces")

MTCNN_CONFIDENCE_THRESHOLD = 0.85

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff", ".tif"}

_detector = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


@dataclass
class FaceStats:
    """Tracks MTCNN detection only."""

    images_received: int = 0
    images_failed_read: int = 0
    rejected_no_face: int = 0
    rejected_low_confidence: int = 0
    rejected_empty_crop: int = 0
    faces_saved: int = 0

    def merge(self, other: "FaceStats") -> None:
        for name in (
            "images_received",
            "images_failed_read",
            "rejected_no_face",
            "rejected_low_confidence",
            "rejected_empty_crop",
            "faces_saved",
        ):
            setattr(self, name, getattr(self, name) + getattr(other, name))

    def log_summary(self, label: str) -> None:
        print(f"\n{'=' * 60}")
        print(f"  {label} — Face Detection (MTCNN)")
        print(f"{'=' * 60}")
        print(f"  Images received        : {self.images_received}")
        print(f"  Images failed to read  : {self.images_failed_read}")
        print("  ── Rejections ──")
        print(f"    No face detected     : {self.rejected_no_face}")
        print(
            f"    Low MTCNN confidence : {self.rejected_low_confidence}"
            f"  (< {MTCNN_CONFIDENCE_THRESHOLD:.0%})"
        )
        print(f"    Empty face crop      : {self.rejected_empty_crop}")
        print("  ── Result ──")
        print(f"  Face crops saved       : {self.faces_saved}")
        if self.images_received:
            keep_rate = 100.0 * self.faces_saved / self.images_received
            print(f"  Detection rate         : {keep_rate:.1f}%")
        print(f"{'=' * 60}")


def get_detector() -> MTCNN:
    global _detector
    if _detector is None:
        _detector = MTCNN(keep_all=False, device=device, post_process=False)
    return _detector


def list_images(directory: str) -> list[str]:
    paths: list[str] = []
    if not os.path.isdir(directory):
        return paths
    for f in os.listdir(directory):
        if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS:
            paths.append(os.path.join(directory, f))
    return sorted(paths)


def detect_face_crop(frame: np.ndarray, stats: FaceStats) -> np.ndarray | None:
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

        face_crop = frame[y1:y2, x1:x2]
        if face_crop.size == 0:
            stats.rejected_empty_crop += 1
            return None

        return face_crop
    except Exception:
        stats.rejected_no_face += 1
        return None


def process_images(image_paths: list[str], output_dir: str, label: str) -> FaceStats:
    stats = FaceStats()
    os.makedirs(output_dir, exist_ok=True)

    for path in tqdm(image_paths, desc=f"Detecting faces ({label})"):
        stats.images_received += 1
        frame = cv2.imread(path)
        if frame is None:
            stats.images_failed_read += 1
            continue

        face_crop = detect_face_crop(frame, stats)
        if face_crop is None:
            continue

        stem = os.path.splitext(os.path.basename(path))[0]
        out_path = os.path.join(output_dir, f"{stem}_face.jpg")
        if cv2.imwrite(out_path, face_crop):
            stats.faces_saved += 1

    stats.log_summary(label)
    return stats


def write_run_log(
    total: FaceStats, real: FaceStats, fake: FaceStats
) -> None:
    log_path = os.path.join(OUTPUT_ROOT, "face_log.txt")
    os.makedirs(OUTPUT_ROOT, exist_ok=True)

    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"Face detection run: {datetime.now().isoformat(timespec='seconds')}\n\n")
        f.write("Configuration\n")
        f.write(f"  input_root                : {INPUT_ROOT}\n")
        f.write(f"  output_root               : {OUTPUT_ROOT}\n")
        f.write(f"  mtcnn_confidence_threshold: {MTCNN_CONFIDENCE_THRESHOLD}\n")
        f.write(f"  device                    : {device.type}\n")
        f.write("  size/blur/resize_filtering: none (handled by clean.py)\n\n")

        for label, s in [("REAL", real), ("FAKE", fake), ("TOTAL", total)]:
            f.write(f"[{label}]\n")
            f.write(f"  images_received        : {s.images_received}\n")
            f.write(f"  images_failed_read     : {s.images_failed_read}\n")
            f.write(f"  rejected_no_face       : {s.rejected_no_face}\n")
            f.write(f"  rejected_low_confidence: {s.rejected_low_confidence}\n")
            f.write(f"  rejected_empty_crop    : {s.rejected_empty_crop}\n")
            f.write(f"  faces_saved            : {s.faces_saved}\n\n")

    print(f"\nRun log written to: {log_path}")


def run_face_detection() -> None:
    print(f"Device: {device.type.upper()}")
    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    else:
        print("WARNING: CUDA unavailable — using CPU.")

    print("\nStage 2 — MTCNN face detection")
    print("\nConfiguration:")
    print(f"  Input directory              : {INPUT_ROOT}")
    print(f"  Output directory             : {OUTPUT_ROOT}")
    print(f"  MTCNN confidence threshold   : {MTCNN_CONFIDENCE_THRESHOLD:.0%}")

    if not os.path.exists(INPUT_ROOT):
        raise FileNotFoundError(
            f"Input directory not found: {INPUT_ROOT}\nRun extract.py first."
        )

    real_paths = list_images(os.path.join(INPUT_ROOT, "real"))
    fake_paths = list_images(os.path.join(INPUT_ROOT, "fake"))
    print(f"\nFound -> Real: {len(real_paths)} images | Fake: {len(fake_paths)} images")

    if not real_paths and not fake_paths:
        raise ValueError("No images found in stage1_raw. Run extract.py first.")

    real_stats = FaceStats()
    fake_stats = FaceStats()

    if real_paths:
        real_stats = process_images(
            real_paths, os.path.join(OUTPUT_ROOT, "real"), "Real"
        )
    if fake_paths:
        fake_stats = process_images(
            fake_paths, os.path.join(OUTPUT_ROOT, "fake"), "Fake"
        )

    total_stats = FaceStats()
    total_stats.merge(real_stats)
    total_stats.merge(fake_stats)
    total_stats.log_summary("Combined Total")

    write_run_log(total_stats, real_stats, fake_stats)
    print(f"\nDone. Face crops saved to: {OUTPUT_ROOT}")
    print("Next step: python clean.py")


if __name__ == "__main__":
    run_face_detection()
