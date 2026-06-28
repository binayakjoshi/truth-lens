"""
Step 2 — CLAHE (Contrast Limited Adaptive Histogram Equalization).

Why: Synthesized faces often have subtle intensity mismatches between the
original background and the generated face region (different lighting,
skin tone). CLAHE enhances LOCAL contrast (tile-by-tile) to reveal these
blending boundaries — unlike global equalization which washes them out.

What we gain: Reveals contrast-based artifacts that sharpening alone misses.
Works synergistically with USM: edges highlighted in step 1 get their
surrounding contrast anomalies exposed here.

Order note: Runs AFTER sharpening, BEFORE frequency boost. The enhanced
contrast edges will be further amplified in step 3.
"""

import cv2
import numpy as np


def clahe_equalize(
    image: np.ndarray,
    clip_limit: float = 2.0,
    grid_size: tuple[int, int] = (8, 8),
) -> np.ndarray:
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=grid_size)
    l = clahe.apply(l)
    return cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)


if __name__ == "__main__":
    import sys

    path = sys.argv[1] if len(sys.argv) > 1 else "output_1_sharpen.jpg"
    img = cv2.imread(path)
    if img is None:
        print(f"Could not read {path}")
        sys.exit(1)
    out = clahe_equalize(img)
    cv2.imwrite("output_2_contrast.jpg", out)
    print(f"CLAHE → output_2_contrast.jpg ({out.shape})")
