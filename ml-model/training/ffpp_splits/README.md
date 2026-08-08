# Official FaceForensics++ Splits

Video-level train/validation/test assignment for the FF++ dataset.
Each file is a list of `[target, source]` video ID pairs.

| File | Pairs | Videos |
|------|-------|--------|
| `train.json` | 360 | 720 |
| `val.json`   | 70  | 140 |
| `test.json`  | 70  | 140 |

Used by `../scripts/split_dataset.py` to re-split frames at the video
level (zero video-ID overlap between splits) instead of the original
leaky frame-level split.
