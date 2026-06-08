#### treining the model for testing the accurcy

import copy
import time

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Training Backbone Target: {device}")

# Data Augmentation & Normalization
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
    "test": transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    ),
}

data_dir = "./data/real_vs_fake"
image_datasets = {
    x: datasets.ImageFolder(root=f"{data_dir}/{x}", transform=data_transforms[x])
    for x in ["train", "valid", "test"]
}

dataloaders = {
    x: DataLoader(
        image_datasets[x], batch_size=32, shuffle=True, num_workers=4, pin_memory=True
    )
    for x in ["train", "valid", "test"]
}

dataset_sizes = {x: len(image_datasets[x]) for x in ["train", "valid", "test"]}
class_names = image_datasets["train"].classes
print(f"Dataset Loaded: {dataset_sizes} images mapped across classes {class_names}")


# 4. Model Fine-Tuning with Grad-CAM Hooks
class TruthLensClassifier(nn.Module):
    def __init__(self):
        super(TruthLensClassifier, self).__init__()
        # Load pretrained EfficientNet-B0 backbone
        self.backbone = models.efficientnet_b0(
            weights=models.EfficientNet_B0_Weights.DEFAULT
        )

        # Feature Freezing Strategy -> so that base trained wala feature does not change (imagenet wala kura)
        for param in self.backbone.features.parameters():
            param.requires_grad = False

        # Unfreeze the final convolutional block for fake image artifact adaptation
        for param in self.backbone.features[-1].parameters():
            param.requires_grad = True

        # Swap classification head for binary prediction (0=fake, 1=real)
        num_ftrs = self.backbone.classifier[1].in_features
        self.backbone.classifier[1] = nn.Linear(num_ftrs, 2)

        # Hooks placeholders for Grad-CAM
        self.gradients = None
        self.activations = None
        self._register_hooks()

    def _register_hooks(self):
        # Target the final convolutional feature layer of the backbone
        target_layer = self.backbone.features[-1]

        def forward_hook(module, input, output):
            self.activations = output

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0]

        target_layer.register_forward_hook(forward_hook)
        target_layer.register_backward_hook(backward_hook)

    def forward(self, x):
        return self.backbone(x)


def train_model(model, criterion, optimizer, scheduler, num_epochs=10):
    since = time.time()
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    for epoch in range(num_epochs):
        print(f"\nEpoch {epoch+1}/{num_epochs}")
        print("-" * 10)

        for phase in ["train", "valid"]:
            if phase == "train":
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

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
                best_model_wts = copy.deepcopy(model.state_dict())

    time_elapsed = time.time() - since
    print(f"\nTraining complete in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Best Valid Accuracy: {best_acc:4f}")

    model.load_state_dict(best_model_wts)
    return model


# Testing Engine
def test_model(model, criterion):
    model.eval()
    running_loss = 0.0
    running_corrects = 0
    all_preds = []
    all_labels = []

    print("\nEvaluating on Test Set...")
    with torch.no_grad():
        for inputs, labels in dataloaders["test"]:
            inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    test_loss = running_loss / dataset_sizes["test"]
    test_acc = running_corrects.double() / dataset_sizes["test"]
    print(f"Test Loss: {test_loss:.4f} Test Accuracy: {test_acc:.4f}")

    return all_labels, all_preds


if __name__ == "__main__":
    model = TruthLensClassifier().to(device)

    # Optimization Configuration
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()), lr=1e-4
    )
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)

    # Run Training Engine
    trained_model = train_model(model, criterion, optimizer, scheduler, num_epochs=10)

    # Run Testing Engine
    labels, predictions = test_model(trained_model, criterion)

    """ Save target weights for FastAPI production use
     Since we wrapped everything inside a custom container class, we strip the 'backbone.' prefix 
     out during loading or save the state dict cleanly so FastAPI reads it natively. """
    torch.save(trained_model.state_dict(), "truthlens_efficientnet_b0.pth")
    print("\nProduction weights successfully saved as 'truthlens_efficientnet_b0.pth'")
