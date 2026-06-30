"""
Full preprocessing pipeline — chains Step 1 → 2 → 3 in one call.

USM → CLAHE → High-Pass Boost

This module is importable so the FastAPI inference server (main.py)
can call run_pipeline(image_np) before resize + normalize.
"""

import cv2
import numpy as np

from preprocessing._1_sharpen import unsharp_mask
from preprocessing._2_contrast import clahe_equalize
from preprocessing._3_frequency import high_pass_boost


def run_pipeline(image: np.ndarray) -> np.ndarray:
    result = unsharp_mask(image)
    result = clahe_equalize(result)
    result = high_pass_boost(result)
    return result


if __name__ == "__main__":
    import sys

    path = sys.argv[1] if len(sys.argv) > 1 else "test.jpg"
    img = cv2.imread(path)
    if img is None:
        print(f"Could not read {path}")
        sys.exit(1)
    out = run_pipeline(img)
    cv2.imwrite("output_pipeline.jpg", out)
    print(f"Full pipeline → output_pipeline.jpg ({out.shape})")
