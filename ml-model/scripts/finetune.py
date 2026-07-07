import copy
import os
import time

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms

from truthlens.model.classifier import TruthLensClassifier
from truthlens.training.dataset import PreprocessedDataset

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Fine-tuning on: {device}")

data_transforms = {
    "train": transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.ColorJitter(brightness=0.1, contrast=0.1),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    ),
    "valid": transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    ),
}

data_dir = "datasets/truthlens_dataset"
datasets = {
    "train": PreprocessedDataset(
        root_dir=f"{data_dir}/train", transform=data_transforms["train"]
    ),
    "valid": PreprocessedDataset(
        root_dir=f"{data_dir}/valid", transform=data_transforms["valid"]
    ),
}
dataloaders = {
    x: DataLoader(
        datasets[x], batch_size=32, shuffle=True, num_workers=4, pin_memory=True
    )
    for x in ["train", "valid"]
}
dataset_sizes = {x: len(datasets[x]) for x in ["train", "valid"]}
print(f"Loaded: {dataset_sizes} images")

# Class weights — emphasize Real class (weak point at 0.78 recall)
n_fake = dataset_sizes["train"] // 2
n_real = dataset_sizes["train"] - n_fake
weight_real = 1.5
weight_fake = 1.0
class_weights = torch.tensor([weight_fake, weight_real]).to(device)
print(f"Class weights: Fake={weight_fake}, Real={weight_real}")

# Load model — freeze_backbone=False so all layers are trainable for fine-tuning
model = TruthLensClassifier(pretrained=False, freeze_backbone=False).to(device)
model.load_state_dict(
    torch.load("models/truthlens_efficientnet_b0.pth", map_location=device)
)
print("Loaded existing weights, backbone unfrozen for fine-tuning")

criterion = nn.CrossEntropyLoss(weight=class_weights)

# Lower LR for fine-tuning the whole network
optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-5)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)


def train_model(model, criterion, optimizer, scheduler, num_epochs=10):
    since = time.time()
    best_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    for epoch in range(num_epochs):
        print(f"\nEpoch {epoch + 1}/{num_epochs}")
        print("-" * 10)

        for phase in ["train", "valid"]:
            model.train() if phase == "train" else model.eval()
            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs, labels = inputs.to(device), labels.to(device)
                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == "train"):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == "train":
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            if phase == "train":
                scheduler.step()

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]
            print(f"{phase.capitalize()} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

            if phase == "valid" and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_wts = copy.deepcopy(model.state_dict())

    elapsed = time.time() - since
    print(f"\nDone in {elapsed // 60:.0f}m {elapsed % 60:.0f}s")
    print(f"Best valid acc: {best_acc:.4f}")
    model.load_state_dict(best_wts)
    return model


model = train_model(model, criterion, optimizer, scheduler, num_epochs=10)

os.makedirs("models", exist_ok=True)
save_path = "models/truthlens_efficientnet_b0.pth"
torch.save(model.state_dict(), save_path)
print(f"Saved: {save_path}")
