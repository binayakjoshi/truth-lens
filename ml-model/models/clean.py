import os
from dataclasses import dataclass
from datetime import datetime

import cv2
import numpy as np
from tqdm import tqdm

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_ROOT = os.path.join(CURRENT_DIR, "data", "stage2_faces")
OUTPUT_ROOT = os.path.join(CURRENT_DIR, "data", "truthlens_dataset")

OUTPUT_FRAME_SIZE = (224, 224)
MIN_FACE_SIZE = 80
MIN_BLUR_VARIANCE = 85.0

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff", ".tif"}


@dataclass
class CleanStats:
    """Tracks quality filtering and final output."""

    crops_received: int = 0
    images_failed_read: int = 0
    rejected_small_crop: int = 0
    rejected_blurry: int = 0
    rejected_duplicate: int = 0
    frames_saved: int = 0

    def merge(self, other: "CleanStats") -> None:
        for name in (
            "crops_received",
            "images_failed_read",
            "rejected_small_crop",
            "rejected_blurry",
            "rejected_duplicate",
            "frames_saved",
        ):
            setattr(self, name, getattr(self, name) + getattr(other, name))

    def log_summary(self, label: str) -> None:
        print(f"\n{'=' * 60}")
        print(f"  {label} — Quality Filter & Resize")
        print(f"{'=' * 60}")
        print(f"  Crops received         : {self.crops_received}")
        print(f"  Images failed to read  : {self.images_failed_read}")
        print("  ── Rejections ──")
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
        if self.crops_received:
            keep_rate = 100.0 * self.frames_saved / self.crops_received
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


def list_images(directory: str) -> list[str]:
    paths: list[str] = []
    if not os.path.isdir(directory):
        return paths
    for f in os.listdir(directory):
        if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS:
            paths.append(os.path.join(directory, f))
    return sorted(paths)


def clean_face_crop(crop: np.ndarray, stats: CleanStats) -> np.ndarray | None:
    if crop is None or crop.size == 0:
        stats.images_failed_read += 1
        return None

    face_h, face_w = crop.shape[:2]
    if face_w < MIN_FACE_SIZE or face_h < MIN_FACE_SIZE:
        stats.rejected_small_crop += 1
        return None

    if is_blurry(crop):
        stats.rejected_blurry += 1
        return None

    return cv2.resize(crop, OUTPUT_FRAME_SIZE)


def process_images(
    image_paths: list[str],
    output_dir: str,
    label: str,
    duplicate_filter: DuplicateFilter,
) -> CleanStats:
    stats = CleanStats()
    os.makedirs(output_dir, exist_ok=True)

    for path in tqdm(image_paths, desc=f"Cleaning ({label})"):
        stats.crops_received += 1
        crop = cv2.imread(path)
        if crop is None:
            stats.images_failed_read += 1
            continue

        cleaned = clean_face_crop(crop, stats)
        if cleaned is None:
            continue

        if duplicate_filter.is_duplicate(cleaned):
            stats.rejected_duplicate += 1
            continue

        stem = os.path.basename(path)
        if stem.endswith("_face.jpg"):
            stem = stem[: -len("_face.jpg")]
        else:
            stem = os.path.splitext(stem)[0]

        out_path = os.path.join(output_dir, f"{stem}.jpg")
        if cv2.imwrite(out_path, cleaned):
            stats.frames_saved += 1

    stats.log_summary(label)
    return stats


def write_run_log(total: CleanStats, real: CleanStats, fake: CleanStats) -> None:
    log_path = os.path.join(OUTPUT_ROOT, "clean_log.txt")
    os.makedirs(OUTPUT_ROOT, exist_ok=True)

    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"Clean run: {datetime.now().isoformat(timespec='seconds')}\n\n")
        f.write("Configuration\n")
        f.write(f"  input_root         : {INPUT_ROOT}\n")
        f.write(f"  output_root        : {OUTPUT_ROOT}\n")
        f.write(f"  min_face_size_px   : {MIN_FACE_SIZE}\n")
        f.write(f"  min_blur_variance  : {MIN_BLUR_VARIANCE}\n")
        f.write(f"  output_frame_size  : {OUTPUT_FRAME_SIZE}\n")
        f.write("  duplicate_filter   : average perceptual hash (global)\n\n")

        for label, s in [("REAL", real), ("FAKE", fake), ("TOTAL", total)]:
            f.write(f"[{label}]\n")
            f.write(f"  crops_received      : {s.crops_received}\n")
            f.write(f"  images_failed_read  : {s.images_failed_read}\n")
            f.write(f"  rejected_small_crop : {s.rejected_small_crop}\n")
            f.write(f"  rejected_blurry     : {s.rejected_blurry}\n")
            f.write(f"  rejected_duplicate  : {s.rejected_duplicate}\n")
            f.write(f"  frames_saved        : {s.frames_saved}\n\n")

    print(f"\nRun log written to: {log_path}")


def run_cleaning() -> None:
    print("Stage 3 — Quality filter, resize, deduplication")
    print("\nConfiguration:")
    print(f"  Input directory            : {INPUT_ROOT}")
    print(f"  Output directory           : {OUTPUT_ROOT}")
    print(f"  Min face bbox size         : {MIN_FACE_SIZE}px")
    print(f"  Min blur variance          : {MIN_BLUR_VARIANCE}")
    print(f"  Output size                : {OUTPUT_FRAME_SIZE}")

    if not os.path.exists(INPUT_ROOT):
        raise FileNotFoundError(
            f"Input directory not found: {INPUT_ROOT}\nRun face.py first."
        )

    real_paths = list_images(os.path.join(INPUT_ROOT, "real"))
    fake_paths = list_images(os.path.join(INPUT_ROOT, "fake"))
    print(f"\nFound -> Real: {len(real_paths)} crops | Fake: {len(fake_paths)} crops")

    if not real_paths and not fake_paths:
        raise ValueError("No face crops found in stage2_faces. Run face.py first.")

    duplicate_filter = DuplicateFilter()
    real_stats = CleanStats()
    fake_stats = CleanStats()

    if real_paths:
        real_stats = process_images(
            real_paths,
            os.path.join(OUTPUT_ROOT, "real"),
            "Real",
            duplicate_filter,
        )
    if fake_paths:
        fake_stats = process_images(
            fake_paths,
            os.path.join(OUTPUT_ROOT, "fake"),
            "Fake",
            duplicate_filter,
        )

    total_stats = CleanStats()
    total_stats.merge(real_stats)
    total_stats.merge(fake_stats)
    total_stats.log_summary("Combined Total")

    write_run_log(total_stats, real_stats, fake_stats)
    print(f"\nDone. Final dataset saved to: {OUTPUT_ROOT}")


if __name__ == "__main__":
    run_cleaning()
