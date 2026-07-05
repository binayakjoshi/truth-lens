import torch.nn as nn
from torchvision import models


class TruthLensClassifier(nn.Module):
    def __init__(self, pretrained=False, freeze_backbone=False):
        super(TruthLensClassifier, self).__init__()
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        self.backbone = models.efficientnet_b0(weights=weights)

        if freeze_backbone:
            for param in self.backbone.features.parameters():
                param.requires_grad = False
            for param in self.backbone.features[-1].parameters():
                param.requires_grad = True

        num_ftrs = self.backbone.classifier[1].in_features
        self.backbone.classifier[1] = nn.Linear(num_ftrs, 2)

        self.gradients = None
        self.activations = None

        self._register_hooks()

    def _register_hooks(self):
        # Target the final convolutional feature block of EfficientNet-B0
        target_layer = self.backbone.features[-1]

        def forward_hook(module, input, output):
            self.activations = output

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0]

        target_layer.register_forward_hook(forward_hook)
        target_layer.register_backward_hook(backward_hook)

    def forward(self, x):
        return self.backbone(x)

    def get_gradients(self):
        return self.gradients

    def get_activations(self):
        return self.activations
