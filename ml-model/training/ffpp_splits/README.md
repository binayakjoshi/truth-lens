# Official FaceForensics++ Splits

Video-level train/validation/test assignment for the FF++ dataset.
Each file is a list of `[target, source]` video ID pairs.

| File | Pairs | Videos |
|------|-------|--------|
| `ffpp_train.json` | 360 | 720 |
| `ffpp_val.json`   | 70  | 140 |
| `ffpp_test.json`  | 70  | 140 |

Used by `../scripts/split_dataset.py` to re-split frames at the video
level (zero video-ID overlap between splits) instead of the original
leaky frame-level split.
