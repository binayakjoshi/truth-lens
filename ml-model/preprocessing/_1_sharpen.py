"""
Step 1 — Unsharp Masking (USM).

Why: Deepfakes leave micro-blurring / seam artifacts at facial blending
boundaries (face contour, eye sockets, hairline). USM amplifies these
high-frequency edge traces so the CNN sees them clearly.

What we gain: IJACSA 2025 paper shows USM + EfficientNet-B4 hits 97.77%
validation accuracy vs baseline without USM.

Order note: Runs BEFORE contrast normalization so we sharpen edges first,
then reveal contrast anomalies around those edges in step 2.
"""

import cv2
import numpy as np


def unsharp_mask(
    image: np.ndarray,
    radius: float = 1.5,
    amount: float = 1.5,
    threshold: int = 0,
) -> np.ndarray:
    blurred = cv2.GaussianBlur(image, (0, 0), radius)
    mask = cv2.subtract(image.astype(np.float32), blurred.astype(np.float32))
    mask = np.where(np.abs(mask) < threshold, 0, mask)
    result = cv2.add(image.astype(np.float32), amount * mask)
    return result.clip(0, 255).astype(np.uint8)


if __name__ == "__main__":
    import sys

    path = sys.argv[1] if len(sys.argv) > 1 else "test.jpg"
    img = cv2.imread(path)
    if img is None:
        print(f"Could not read {path}")
        sys.exit(1)
    out = unsharp_mask(img)
    cv2.imwrite("output_1_sharpen.jpg", out)
    print(f"Sharpened → output_1_sharpen.jpg ({out.shape})")
