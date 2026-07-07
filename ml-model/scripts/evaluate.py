import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from torch.utils.data import DataLoader
from torchvision import transforms

from truthlens.model.classifier import TruthLensClassifier
from truthlens.training.dataset import PreprocessedDataset

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = TruthLensClassifier().to(device)
model.load_state_dict(
    torch.load("models/truthlens_efficientnet_b0.pth", map_location=device)
)
model.eval()

val_transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

val_dataset = PreprocessedDataset(
    root_dir="datasets/truthlens_dataset/valid", transform=val_transform
)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=2)

all_preds, all_labels, all_probs = [], [], []

with torch.no_grad():
    for inputs, labels in val_loader:
        inputs = inputs.to(device)
        outputs = model(inputs)
        probs = torch.softmax(outputs, dim=1)
        preds = torch.argmax(outputs, dim=1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())
        all_probs.extend(probs.cpu().numpy())

print("=" * 60)
print("TruthLens Classification Report")
print("Classes: 0 = AI-Generated (Fake), 1 = Real")
print("=" * 60)
print(f"\nAccuracy:  {accuracy_score(all_labels, all_preds):.4f}")
print()

target_names = ["AI-Generated (Fake)", "Real"]
print(classification_report(all_labels, all_preds, target_names=target_names))

cm = confusion_matrix(all_labels, all_preds)
print("Confusion Matrix:")
print(f"{'':>25} {'Predicted Fake':>15} {'Predicted Real':>15}")
print(f"{'Actual Fake':>25} {cm[0][0]:>15} {cm[0][1]:>15}")
print(f"{'Actual Real':>25} {cm[1][0]:>15} {cm[1][1]:>15}")
print()

tn, fp, fn, tp = cm.ravel()
print(f"True Negatives:  {tn}  (correctly identified fake)")
print(f"False Positives: {fp}  (real flagged as fake)")
print(f"False Negatives: {fn}  (fake missed as real)")
print(f"True Positives:  {tp}  (correctly identified real)")
print()

all_labels_bin = np.array(all_labels)
all_probs_real = np.array(all_probs)[:, 1]
try:
    auc = roc_auc_score(all_labels_bin, all_probs_real)
    print(f"ROC-AUC: {auc:.4f}")
except Exception:
    print("ROC-AUC: N/A")

print(f"\nModel path: models/truthlens_efficientnet_b0.pth ({16}MB)")
