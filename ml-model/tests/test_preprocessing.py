import numpy as np
import pytest

from truthlens.preprocessing.contrast import clahe_equalize
from truthlens.preprocessing.frequency import high_pass_boost
from truthlens.preprocessing.pipeline import run_pipeline
from truthlens.preprocessing.sharpen import unsharp_mask


@pytest.fixture
def dummy_image():
    return np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)


class TestSharpen:
    def test_output_shape_and_dtype(self, dummy_image):
        result = unsharp_mask(dummy_image)
        assert result.shape == dummy_image.shape
        assert result.dtype == np.uint8

    def test_values_in_range(self, dummy_image):
        result = unsharp_mask(dummy_image)
        assert result.min() >= 0
        assert result.max() <= 255

    def test_default_params_produce_different_result(self, dummy_image):
        result = unsharp_mask(dummy_image)
        assert not np.array_equal(result, dummy_image)


class TestCLAHE:
    def test_output_shape_and_dtype(self, dummy_image):
        result = clahe_equalize(dummy_image)
        assert result.shape == dummy_image.shape
        assert result.dtype == np.uint8

    def test_values_in_range(self, dummy_image):
        result = clahe_equalize(dummy_image)
        assert result.min() >= 0
        assert result.max() <= 255

    def test_default_params_produce_different_result(self, dummy_image):
        result = clahe_equalize(dummy_image)
        assert not np.array_equal(result, dummy_image)


class TestHighPassBoost:
    def test_output_shape_and_dtype(self, dummy_image):
        result = high_pass_boost(dummy_image)
        assert result.shape == dummy_image.shape
        assert result.dtype == np.uint8

    def test_values_in_range(self, dummy_image):
        result = high_pass_boost(dummy_image)
        assert result.min() >= 0
        assert result.max() <= 255


class TestPipeline:
    def test_pipeline_output_shape_and_dtype(self, dummy_image):
        result = run_pipeline(dummy_image)
        assert result.shape == dummy_image.shape
        assert result.dtype == np.uint8

    def test_pipeline_values_in_range(self, dummy_image):
        result = run_pipeline(dummy_image)
        assert result.min() >= 0
        assert result.max() <= 255

    def test_pipeline_changes_image(self, dummy_image):
        result = run_pipeline(dummy_image)
        assert not np.array_equal(result, dummy_image)
