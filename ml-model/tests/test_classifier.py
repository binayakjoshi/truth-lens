import torch

from truthlens.model.classifier import TruthLensClassifier


class TestTruthLensClassifier:
    def test_instantiation(self):
        model = TruthLensClassifier()
        assert model is not None
        assert isinstance(model, torch.nn.Module)

    def test_forward_pass_shape(self):
        model = TruthLensClassifier()
        model.eval()
        batch = torch.randn(1, 3, 224, 224)
        with torch.no_grad():
            output = model(batch)
        assert output.shape == (1, 2)

    def test_grad_cam_hooks_initialized(self):
        model = TruthLensClassifier()
        assert model.get_gradients() is None
        assert model.get_activations() is None

    def test_grad_cam_hooks_populated_after_backward(self):
        model = TruthLensClassifier()
        batch = torch.randn(1, 3, 224, 224)
        output = model(batch)
        output[0, 0].backward()
        assert model.get_gradients() is not None
        assert model.get_activations() is not None

    def test_grad_cam_hook_shapes(self):
        model = TruthLensClassifier()
        batch = torch.randn(1, 3, 224, 224)
        output = model(batch)
        output[0, 0].backward()
        grads = model.get_gradients()
        acts = model.get_activations()
        assert grads.shape == acts.shape
