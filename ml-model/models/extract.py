import os
import random
from dataclasses import dataclass
from datetime import datetime

import cv2
import numpy as np
from tqdm import tqdm

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_DATASET_DIR = os.path.join(CURRENT_DIR, "FaceForensics++_C23")
OUTPUT_ROOT = os.path.join(CURRENT_DIR, "data", "stage1_raw")

FRAMES_PER_VIDEO = 10
RANDOM_SEED = 42

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff", ".tif"}

FAKE_SUBFOLDERS = {
    "DeepFakeDetection",
    "Deepfakes",
    "Face2Face",
    "FaceShifter",
    "FaceSwap",
    "NeuralTextures",
}
REAL_SUBFOLDER = "original"


@dataclass
class ExtractStats:
    """Tracks raw intake — no quality judgments."""

    videos_total: int = 0
    videos_failed_open: int = 0
    frames_sampled: int = 0
    frames_saved: int = 0
    images_found: int = 0
    images_failed_read: int = 0
    images_saved: int = 0

    def merge(self, other: "ExtractStats") -> None:
        for name in (
            "videos_total",
            "videos_failed_open",
            "frames_sampled",
            "frames_saved",
            "images_found",
            "images_failed_read",
            "images_saved",
        ):
            setattr(self, name, getattr(self, name) + getattr(other, name))

    @property
    def total_saved(self) -> int:
        return self.frames_saved + self.images_saved

    def log_summary(self, label: str) -> None:
        print(f"\n{'=' * 60}")
        print(f"  {label} — Raw Intake")
        print(f"{'=' * 60}")
        print(f"  Videos processed       : {self.videos_total}")
        print(f"  Videos failed to open  : {self.videos_failed_open}")
        print(f"  Frames sampled         : {self.frames_sampled}")
        print(f"  Frames saved           : {self.frames_saved}")
        print(f"  Images found           : {self.images_found}")
        print(f"  Images failed to read  : {self.images_failed_read}")
        print(f"  Images saved           : {self.images_saved}")
        print("  ── Result ──")
        print(f"  Total raw files saved  : {self.total_saved}")
        print(f"{'=' * 60}")


def classify_path(rel_path: str) -> str | None:
    parts = rel_path.replace("\\", "/").split("/")
    if not parts:
        return None
    category = parts[0]
    if category == REAL_SUBFOLDER:
        return "real"
    if category in FAKE_SUBFOLDERS:
        return "fake"
    return None


def discover_media() -> tuple[list[str], list[str], list[tuple[str, str]]]:
    """Return (real_videos, fake_videos, labeled_images) where images are (path, label)."""
    real_videos: list[str] = []
    fake_videos: list[str] = []
    labeled_images: list[tuple[str, str]] = []

    for root, _, files in os.walk(INPUT_DATASET_DIR):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, INPUT_DATASET_DIR)
            ext = os.path.splitext(f)[1].lower()

            if ext in (".mp4", ".avi", ".mkv", ".mov"):
                label = classify_path(rel_path)
                if label == "real":
                    real_videos.append(full_path)
                elif label == "fake":
                    fake_videos.append(full_path)
            elif ext in IMAGE_EXTENSIONS:
                label = classify_path(rel_path)
                if label:
                    labeled_images.append((full_path, label))

    return real_videos, fake_videos, labeled_images


def extract_frames_from_video(
    video_path: str, frames_to_extract: int, stats: ExtractStats
) -> list[tuple[str, np.ndarray]]:
    frames: list[tuple[str, np.ndarray]] = []
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        stats.videos_failed_open += 1
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        stats.videos_failed_open += 1
        return []

    step = max(total_frames // (frames_to_extract + 1), 1)
    video_name = os.path.splitext(os.path.basename(video_path))[0]
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
        out_name = f"{video_name}_fr{len(frames)}.jpg"
        frames.append((out_name, frame))

    cap.release()
    return frames


def process_videos(video_paths: list[str], output_dir: str, label: str) -> ExtractStats:
    stats = ExtractStats(videos_total=len(video_paths))
    os.makedirs(output_dir, exist_ok=True)

    for path in tqdm(video_paths, desc=f"Sampling {label} videos"):
        for out_name, frame in extract_frames_from_video(path, FRAMES_PER_VIDEO, stats):
            out_path = os.path.join(output_dir, out_name)
            if cv2.imwrite(out_path, frame):
                stats.frames_saved += 1

    stats.log_summary(label)
    return stats


def process_images(
    labeled_images: list[tuple[str, str]], output_dirs: dict[str, str]
) -> tuple[ExtractStats, ExtractStats]:
    real_stats = ExtractStats()
    fake_stats = ExtractStats()

    for src_path, label in tqdm(labeled_images, desc="Copying raw images"):
        stats = real_stats if label == "real" else fake_stats
        stats.images_found += 1

        img = cv2.imread(src_path)
        if img is None:
            stats.images_failed_read += 1
            continue

        rel = os.path.relpath(src_path, INPUT_DATASET_DIR)
        safe_name = rel.replace("\\", "_").replace("/", "_")
        base, ext = os.path.splitext(safe_name)
        if not ext:
            ext = ".jpg"
        out_path = os.path.join(output_dirs[label], f"{base}{ext}")

        if os.path.abspath(src_path) != os.path.abspath(out_path):
            if cv2.imwrite(out_path, img):
                stats.images_saved += 1
            else:
                stats.images_failed_read += 1
        else:
            stats.images_saved += 1

    return real_stats, fake_stats


def write_run_log(
    total: ExtractStats, real: ExtractStats, fake: ExtractStats
) -> None:
    log_path = os.path.join(OUTPUT_ROOT, "extract_log.txt")
    os.makedirs(OUTPUT_ROOT, exist_ok=True)

    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"Extract run: {datetime.now().isoformat(timespec='seconds')}\n\n")
        f.write("Configuration\n")
        f.write(f"  input_dataset_dir : {INPUT_DATASET_DIR}\n")
        f.write(f"  output_root       : {OUTPUT_ROOT}\n")
        f.write(f"  frames_per_video  : {FRAMES_PER_VIDEO}\n")
        f.write("  quality_filtering : none (raw intake only)\n\n")

        for label, s in [("REAL", real), ("FAKE", fake), ("TOTAL", total)]:
            f.write(f"[{label}]\n")
            f.write(f"  videos_total          : {s.videos_total}\n")
            f.write(f"  videos_failed_open    : {s.videos_failed_open}\n")
            f.write(f"  frames_sampled        : {s.frames_sampled}\n")
            f.write(f"  frames_saved          : {s.frames_saved}\n")
            f.write(f"  images_found          : {s.images_found}\n")
            f.write(f"  images_failed_read    : {s.images_failed_read}\n")
            f.write(f"  images_saved          : {s.images_saved}\n")
            f.write(f"  total_raw_saved       : {s.total_saved}\n\n")

    print(f"\nRun log written to: {log_path}")


def run_extraction() -> None:
    random.seed(RANDOM_SEED)

    print("Stage 1 — Raw image / frame intake (no quality checks)")
    print("\nConfiguration:")
    print(f"  Input directory    : {INPUT_DATASET_DIR}")
    print(f"  Output directory   : {OUTPUT_ROOT}")
    print(f"  Frames per video   : {FRAMES_PER_VIDEO}")

    if not os.path.exists(INPUT_DATASET_DIR):
        raise FileNotFoundError(f"Input directory not found: {INPUT_DATASET_DIR}")

    real_videos, fake_videos, labeled_images = discover_media()
    real_images = [(p, l) for p, l in labeled_images if l == "real"]
    fake_images = [(p, l) for p, l in labeled_images if l == "fake"]

    print(
        f"\nFound -> Real: {len(real_videos)} videos, {len(real_images)} images | "
        f"Fake: {len(fake_videos)} videos, {len(fake_images)} images"
    )

    if not real_videos and not fake_videos and not labeled_images:
        raise ValueError("No valid video or image files found.")

    real_out = os.path.join(OUTPUT_ROOT, "real")
    fake_out = os.path.join(OUTPUT_ROOT, "fake")
    os.makedirs(real_out, exist_ok=True)
    os.makedirs(fake_out, exist_ok=True)

    real_stats = ExtractStats()
    fake_stats = ExtractStats()

    if real_videos:
        real_stats = process_videos(real_videos, real_out, "Real")
    if fake_videos:
        fake_stats = process_videos(fake_videos, fake_out, "Fake")

    img_real, img_fake = process_images(labeled_images, {"real": real_out, "fake": fake_out})
    real_stats.merge(img_real)
    fake_stats.merge(img_fake)

    if real_stats.videos_total or real_stats.images_found:
        real_stats.log_summary("Real (combined)")
    if fake_stats.videos_total or fake_stats.images_found:
        fake_stats.log_summary("Fake (combined)")

    total_stats = ExtractStats()
    total_stats.merge(real_stats)
    total_stats.merge(fake_stats)
    total_stats.log_summary("Combined Total")

    write_run_log(total_stats, real_stats, fake_stats)
    print(f"\nDone. Raw files saved to: {OUTPUT_ROOT}")
    print("Next step: python face.py")


if __name__ == "__main__":
    run_extraction()
