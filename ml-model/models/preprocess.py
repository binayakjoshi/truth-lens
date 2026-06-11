import os
import random

import cv2
import torch
from facenet_pytorch import MTCNN
from sklearn.model_selection import train_test_split
from tqdm import tqdm

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Point directly to the locally extracted folder shown in your workspace
INPUT_DATASET_DIR = os.path.join(CURRENT_DIR, "FaceForensics++_C23")
OUTPUT_ROOT = os.path.join(CURRENT_DIR, "data", "truthlens_dataset")

OUTPUT_FRAME_SIZE = (224, 224)
FRAME_COUNT_FAKE = 1  # Target valid frames per video from fake subfolders
FRAME_COUNT_REAL = 6  # Target valid frames per video from real subfolders

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

# Dynamically fall back to CPU if CUDA cannot be loaded
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def get_detector():
    """Initializes FaceNet MTCNN directly on the RTX 3050 GPU device."""
    global _detector
    if _detector is None:
        # keep_all=False ensures we only grab the single most prominent face per frame
        _detector = MTCNN(keep_all=False, device=device, post_process=False)
    return _detector


def discover_local_videos():
    """Scans the local storage directory and segments paths into explicit real and fake tracking vectors."""
    real_paths = []
    fake_paths = []

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


def extract_face_crop(frame):
    """Detects a prominent human face using PyTorch MTCNN. Returns None if no face is visible."""
    if frame is None or frame.size == 0:
        return None

    try:
        # OpenCV captures frames in BGR; FaceNet requires RGB alignment
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Runs inference directly inside your RTX GPU's VRAM
        boxes, _ = get_detector().detect(frame_rgb)

        if boxes is not None and len(boxes) > 0:
            # PyTorch MTCNN bounding boxes are shaped as [x1, y1, x2, y2]
            x1, y1, x2, y2 = map(int, boxes[0])

            # Clamp values to prevent out-of-bounds array segmentation indices
            x1, y1 = max(0, x1), max(0, y1)

            face_crop = frame[y1:y2, x1:x2]
            if face_crop.size > 0:
                return cv2.resize(face_crop, OUTPUT_FRAME_SIZE)
    except Exception:
        pass
    return None  # Drop the frame completely if a face tracking failure occurs


def extract_frames_from_video(video_path, frames_to_extract):
    """Uniformly samples frames across a local video media container and keeps only those with detected faces."""
    frames = []
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return frames

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        return frames

    # Setup a timeline step interval to scan through the stream evenly
    step = max(total_frames // (frames_to_extract + 1), 1)
    current_attempt = 1

    # Continue searching until the required frame count threshold is reached
    while len(frames) < frames_to_extract:
        frame_idx = step * current_attempt

        # If we run out of video before hitting the target valid frame count, break safely
        if frame_idx >= total_frames:
            break

        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()

        if ret and frame is not None:
            face_img = extract_face_crop(frame)
            if face_img is not None:
                frames.append(face_img)

        current_attempt += 1

    cap.release()
    return frames


def split_paths(paths):
    """Applies clean random partitions to video lists to enforce complete zero-leakage training sets."""
    if len(paths) < 3:
        return paths, [], []
    train, temp = train_test_split(paths, test_size=0.3, random_state=RANDOM_SEED)
    val, test = train_test_split(temp, test_size=0.5, random_state=RANDOM_SEED)
    return train, val, test


def process_videos(video_paths, output_dir, frame_count, label):
    """Iterates through localized arrays, extracts cropped faces, and pipes image arrays directly to your local drive."""
    os.makedirs(output_dir, exist_ok=True)

    for path in tqdm(video_paths, desc=f"↳ {label} Submissions"):
        video_name = os.path.splitext(os.path.basename(path))[0]
        face_frames = extract_frames_from_video(path, frame_count)

        for idx, img in enumerate(face_frames):
            out_file_path = os.path.join(output_dir, f"{video_name}_fr{idx}.jpg")
            cv2.imwrite(out_file_path, img)


def init_pipeline():
    """Initializes the verification configurations and triggers structural extraction passes."""
    random.seed(RANDOM_SEED)

    print(f"Target Device Context: {device.type.upper()}")
    if device.type == "cuda":
        print(f"RTX GPU Acceleration Locked & Loaded: {torch.cuda.get_device_name(0)}")
    else:
        print(
            "WARNING: PyTorch could not locate CUDA dependencies. Falling back to CPU."
        )

    print(f" Scanning local files inside: {INPUT_DATASET_DIR}")
    if not os.path.exists(INPUT_DATASET_DIR):
        raise FileNotFoundError(
            f" Local data root not discovered at '{INPUT_DATASET_DIR}'. "
        )

    real_video_paths, fake_video_paths = discover_local_videos()
    print(
        f"Local Match Tallies -> Real Videos: {len(real_video_paths)} | Fake Videos: {len(fake_video_paths)}"
    )

    if not real_video_paths and not fake_video_paths:
        raise ValueError(
            " No valid video files discovered inside target directory structures."
        )

    # Split allocations at the video level to prevent frame leakage across datasets
    train_real, val_real, test_real = split_paths(real_video_paths)
    train_fake, val_fake, test_fake = split_paths(fake_video_paths)

    splits = {
        "train": (train_real, train_fake),
        "valid": (val_real, val_fake),
        "test": (test_real, test_fake),
    }

    # Run direct local disk extractions
    for split_name, (reals, fakes) in splits.items():
        if not reals and not fakes:
            continue

        print(f"\n Processing [{split_name.upper()}] dataset split partition...")

        if reals:
            process_videos(
                reals,
                os.path.join(OUTPUT_ROOT, split_name, "real"),
                FRAME_COUNT_REAL,
                "Real",
            )
        if fakes:
            process_videos(
                fakes,
                os.path.join(OUTPUT_ROOT, split_name, "fake"),
                FRAME_COUNT_FAKE,
                "Fake",
            )

    print(
        f"\n Success! Your clean, face-verified PyTorch dataset is saved at: {OUTPUT_ROOT}"
    )


if __name__ == "__main__":
    init_pipeline()
