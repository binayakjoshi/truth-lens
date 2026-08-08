#!/usr/bin/env python3
"""
Reorganize existing frames using the official FaceForensics++ split.

This script takes the current flat train/valid dataset and reorganizes it
into train/valid/test splits using the official FF++ split protocol.

Key guarantee: ZERO video ID overlap between splits.

Usage:
    python split_dataset.py [--dry-run]

The script will:
1. Load official FF++ split files (ffpp_train.json, ffpp_val.json, ffpp_test.json)
2. Match each frame's video ID to the official split
3. Move frames to train/valid/test directories
4. Handle DeepFakeDetection frames separately (video-level split)
5. Write split_manifest.json for reproducibility
6. Verify zero overlap
"""

import argparse
import json
import os
import random
import shutil
from collections import defaultdict
from pathlib import Path

SEED = 42
REPO_ROOT = Path(__file__).resolve().parents[3]
FFPP_SPLITS_DIR = REPO_ROOT / "ml-model" / "training" / "ffpp_splits"
SOURCE_DIR = REPO_ROOT / "ml-model" / "datasets" / "truthlens_dataset"
OUTPUT_DIR = REPO_ROOT / "ml-model" / "datasets" / "truthlens_dataset_v2"


def load_ffpp_splits() -> dict[str, set[tuple[str, str]]]:
    """Load official FF++ split files."""
    splits = {}
    for name in ["train", "val", "test"]:
        path = FFPP_SPLITS_DIR / f"ffpp_{name}.json"
        with open(path) as f:
            pairs = [tuple(p) for p in json.load(f)]
        splits[name] = set(pairs)
    return splits


def build_pair_to_split(splits: dict[str, set[tuple[str, str]]]) -> dict[tuple[str, str], str]:
    """Map each (target, source) pair to its split name.

    Handles both forward and reversed pairs.
    """
    pair_to_split = {}
    for name, pairs in splits.items():
        for t, s in pairs:
            pair_to_split[(t, s)] = name
            pair_to_split[(s, t)] = name
    return pair_to_split


def build_id_to_split(splits: dict[str, set[tuple[str, str]]]) -> dict[str, str]:
    """Map each video ID to its split based on the official split.

    If a video ID appears in multiple pairs across different splits,
    this would be a problem. But the official split guarantees no overlap.
    """
    id_to_split = {}
    for name, pairs in splits.items():
        for t, s in pairs:
            if t in id_to_split and id_to_split[t] != name:
                print(f"WARNING: Video {t} appears in multiple splits!")
            id_to_split[t] = name
            if s in id_to_split and id_to_split[s] != name:
                print(f"WARNING: Video {s} appears in multiple splits!")
            id_to_split[s] = name
    return id_to_split


def extract_video_id(filename: str) -> str:
    """Extract video ID from filename.

    Handles:
    - Short numeric: 000_003_fr0.jpg -> 000_003
    - Long descriptive: 01_02__outside_talking_still_laughing__YVGY8LOK_fr0.jpg -> 01_02__outside_...
    """
    stem = filename.replace(".jpg", "").replace(".jpeg", "").replace(".png", "")
    if "_fr" in stem:
        stem = stem.rsplit("_fr", 1)[0]
    return stem


def is_short_numeric_id(vid: str) -> bool:
    """Check if video ID is short numeric format (target_source)."""
    parts = vid.split("_")
    return len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit()


def get_pair_from_id(vid: str) -> tuple[str, str]:
    """Extract (target, source) pair from short numeric video ID."""
    parts = vid.split("_")
    return (parts[0], parts[1])


def classify_frames(dataset_dir: Path) -> tuple[dict[str, dict[str, list[str]]], dict[str, list[str]]]:
    """Classify all frames by their split assignment.

    Returns:
        ({split: {class: [filenames]}}, deepfake_frames)
    """
    splits = load_ffpp_splits()
    pair_to_split = build_pair_to_split(splits)
    id_to_split = build_id_to_split(splits)

    result = {"train": {"real": [], "fake": []}, "valid": {"real": [], "fake": []}, "test": {"real": [], "fake": []}}
    deepfake_frames = {"real": [], "fake": []}

    for split_name in ["train", "valid"]:
        for cls in ["real", "fake"]:
            split_dir = dataset_dir / split_name / cls
            if not split_dir.exists():
                continue

            for fname in sorted(os.listdir(split_dir)):
                if not fname.lower().endswith((".jpg", ".jpeg", ".png")):
                    continue

                vid = extract_video_id(fname)

                if cls == "real":
                    if vid in id_to_split:
                        target_split = id_to_split[vid]
                        dir_split = "valid" if target_split == "val" else target_split
                        result[dir_split][cls].append(fname)
                    else:
                        print(f"WARNING: Real video {vid} not in any split")
                        deepfake_frames[cls].append(fname)

                elif cls == "fake":
                    if is_short_numeric_id(vid):
                        pair = get_pair_from_id(vid)
                        if pair in pair_to_split:
                            target_split = pair_to_split[pair]
                            dir_split = "valid" if target_split == "val" else target_split
                            result[dir_split][cls].append(fname)
                        else:
                            print(f"WARNING: Pair {pair} not in any split")
                            deepfake_frames[cls].append(fname)
                    else:
                        deepfake_frames[cls].append(fname)

    return result, deepfake_frames


def split_deepfake_frames(frames: list[str], seed: int = SEED) -> dict[str, list[str]]:
    """Split DeepFakeDetection frames at the video level.

    Extracts the video prefix (everything before _frN) and splits
    unique video prefixes into train/valid/test.
    """
    rng = random.Random(seed)

    video_to_frames = defaultdict(list)
    for fname in frames:
        vid = extract_video_id(fname)
        video_to_frames[vid].append(fname)

    video_ids = list(video_to_frames.keys())
    rng.shuffle(video_ids)

    n = len(video_ids)
    n_train = int(n * 0.70)
    n_val = int(n * 0.15)

    train_videos = video_ids[:n_train]
    val_videos = video_ids[n_train:n_train + n_val]
    test_videos = video_ids[n_train + n_val:]

    result = {"train": [], "valid": [], "test": []}
    for vid in train_videos:
        result["train"].extend(video_to_frames[vid])
    for vid in val_videos:
        result["valid"].extend(video_to_frames[vid])
    for vid in test_videos:
        result["test"].extend(video_to_frames[vid])

    return result


def move_files(source_dir: Path, output_dir: Path, classification: dict, dry_run: bool = False):
    """Move files to their new locations."""
    for split in ["train", "valid", "test"]:
        for cls in ["real", "fake"]:
            files = classification[split][cls]
            target_dir = output_dir / split / cls

            if dry_run:
                print(f"  {target_dir}: {len(files)} files")
                continue

            target_dir.mkdir(parents=True, exist_ok=True)
            for fname in files:
                src = source_dir / "train" / cls / fname
                if not src.exists():
                    src = source_dir / "valid" / cls / fname
                if src.exists():
                    shutil.copy2(src, target_dir / fname)
                else:
                    print(f"WARNING: Source not found: {src}")


def write_manifest(output_dir: Path, classification: dict, deepfake_classification: dict):
    """Write split_manifest.json for reproducibility."""
    manifest = {
        "seed": SEED,
        "source": "FaceForensics++ C23",
        "split_protocol": "Official FF++ split (dataset/splits/)",
        "ffpp_split_sizes": {"train": 360, "val": 70, "test": 70},
        "splits": {},
    }

    for split in ["train", "valid", "test"]:
        all_files = classification[split]["real"] + classification[split]["fake"]
        real_files = classification[split]["real"]
        fake_files = classification[split]["fake"]

        real_vids = set(extract_video_id(f) for f in real_files)
        fake_vids = set(extract_video_id(f) for f in fake_files)

        manifest["splits"][split] = {
            "total_frames": len(all_files),
            "real_frames": len(real_files),
            "fake_frames": len(fake_files),
            "real_video_ids": len(real_vids),
            "fake_video_ids": len(fake_vids),
        }

    deepfake_total = sum(len(v) for v in deepfake_classification.values())
    manifest["deepfakedetection_frames"] = deepfake_total

    manifest_path = output_dir / "split_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nManifest written to: {manifest_path}")


def verify_zero_overlap(output_dir: Path):
    """Verify zero video ID overlap between splits."""
    print("\n--- Verification ---")
    splits = {}
    for split in ["train", "valid", "test"]:
        vids = set()
        for cls in ["real", "fake"]:
            split_dir = output_dir / split / cls
            if split_dir.exists():
                for f in os.listdir(split_dir):
                    vids.add(extract_video_id(f))
        splits[split] = vids

    for s1, s2 in [("train", "valid"), ("train", "test"), ("valid", "test")]:
        overlap = splits[s1] & splits[s2]
        status = "PASS" if len(overlap) == 0 else "FAIL"
        print(f"  {s1}-{s2} overlap: {len(overlap)} [{status}]")
        if overlap and len(overlap) <= 10:
            print(f"    Overlapping: {overlap}")

    for cls in ["real", "fake"]:
        print(f"\n  {cls.upper()} class:")
        cls_splits = {}
        for split in ["train", "valid", "test"]:
            vids = set()
            split_dir = output_dir / split / cls
            if split_dir.exists():
                for f in os.listdir(split_dir):
                    vids.add(extract_video_id(f))
            cls_splits[split] = vids

        for s1, s2 in [("train", "valid"), ("train", "test"), ("valid", "test")]:
            overlap = cls_splits[s1] & cls_splits[s2]
            status = "PASS" if len(overlap) == 0 else "FAIL"
            print(f"    {s1}-{s2}: {len(overlap)} [{status}]")


def main():
    parser = argparse.ArgumentParser(description="Reorganize dataset using official FF++ split")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without moving files")
    args = parser.parse_args()

    print("=" * 60)
    print("  Dataset Reorganization — Official FF++ Split")
    print("=" * 60)
    print(f"\nSource: {SOURCE_DIR}")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Split files: {FFPP_SPLITS_DIR}")
    print(f"Seed: {SEED}")

    splits = load_ffpp_splits()
    print(f"\nOfficial FF++ split: {len(splits['train'])} train, {len(splits['val'])} val, {len(splits['test'])} test")

    print("\nClassifying frames...")
    classification, deepfake_frames = classify_frames(SOURCE_DIR)

    print("\n--- Short Numeric IDs (Official Split) ---")
    for split in ["train", "valid", "test"]:
        real = len(classification[split]["real"])
        fake = len(classification[split]["fake"])
        print(f"  {split}: {real} real + {fake} fake = {real + fake}")

    deepfake_fake = deepfake_frames["fake"]
    print(f"\n--- DeepFakeDetection Frames: {len(deepfake_fake)} ---")
    if deepfake_fake:
        dd_split = split_deepfake_frames(deepfake_fake)
        for split, files in dd_split.items():
            print(f"  {split}: {len(files)} frames")

        for split in ["train", "valid", "test"]:
            classification[split]["fake"].extend(dd_split[split])

    print(f"\n--- Moving Files {'(DRY RUN)' if args.dry_run else ''} ---")
    move_files(SOURCE_DIR, OUTPUT_DIR, classification, dry_run=args.dry_run)

    if not args.dry_run:
        write_manifest(OUTPUT_DIR, classification, deepfake_frames)
        verify_zero_overlap(OUTPUT_DIR)

    print("\nDone.")


if __name__ == "__main__":
    main()
