"""
Step 3 — High-Pass Frequency Boost.

Why: GAN / diffusion upsampling operations leave traceable spectral artifacts
in the high-frequency bands of generated images (Wang et al., 2020).
A Laplacian high-pass filter isolates these frequency-domain anomalies
and amplifies them so the classifier can leverage spectral cues alongside
spatial ones.

What we gain: AAAI 2024 FreqNet shows forcing CNNs to focus on high-frequency
information improves cross-generator generalization by +9.8%. This step
catches artifacts that survived steps 1-2.

Order note: Runs LAST — acts as a final frequency-domain amplifier on the
already-enhanced image from steps 1 and 2.
"""

import cv2
import numpy as np


def high_pass_boost(
    image: np.ndarray,
    strength: float = 0.5,
) -> np.ndarray:
    kernel = np.array([[-1, -1, -1],
                       [-1,  8, -1],
                       [-1, -1, -1]], dtype=np.float32) / 9.0
    high_freq = cv2.filter2D(image.astype(np.float32), -1, kernel)
    return cv2.addWeighted(
        image.astype(np.float32), 1.0, high_freq, strength, 0
    ).clip(0, 255).astype(np.uint8)


if __name__ == "__main__":
    import sys

    path = sys.argv[1] if len(sys.argv) > 1 else "output_2_contrast.jpg"
    img = cv2.imread(path)
    if img is None:
        print(f"Could not read {path}")
        sys.exit(1)
    out = high_pass_boost(img)
    cv2.imwrite("output_3_frequency.jpg", out)
    print(f"Frequency boosted → output_3_frequency.jpg ({out.shape})")
