"use client";

import type React from "react";
import { useRef, useState, useCallback } from "react";

import Image from "next/image";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CropIcon from "@mui/icons-material/Crop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type ImageUploadProps = {
  id: string;
  errorText?: string;
  initialValue?: string;
  maxSizeInBytes?: number;
  /** Lock the crop box to this ratio (e.g. 1 for 1:1). Omit for a free-form crop. */
  aspectRatio?: number;
  onInput: (id: string, file: File | undefined, isValid: boolean) => void;
};

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function getCroppedFile(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string,
  mimeType: string,
): Promise<File> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(new File([blob], fileName, { type: mimeType }));
      },
      mimeType,
      0.92,
    );
  });
}

const ImageUpload = ({
  id,
  errorText,
  initialValue,
  maxSizeInBytes = 5 * 1024 * 1024,
  aspectRatio,
  onInput,
}: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialValue,
  );
  const [isValid, setIsValid] = useState(!!initialValue);
  const [currentError, setCurrentError] = useState<string | undefined>(
    errorText,
  );
  const filePickerRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Crop modal state — rawImageSrc is loaded up-front (in the event handler)
  // and stored alongside the pending file, so no effect is needed to derive it.
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | undefined>();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const applyFile = useCallback(
    (newFile: File, dataUrl?: string) => {
      setIsValid(true);
      setCurrentError(undefined);
      onInput(id, newFile, true);

      if (dataUrl) {
        setPreviewUrl(dataUrl);
      } else {
        void readFileAsDataURL(newFile).then(setPreviewUrl);
      }
    },
    [id, onInput],
  );

  const pickedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length !== 1) {
      setIsValid(false);
      setCurrentError(errorText || "Please select a valid image file");
      setPreviewUrl(undefined);
      onInput(id, undefined, false);
      return;
    }

    const pickedFile = event.target.files[0];

    if (pickedFile.size > maxSizeInBytes) {
      setIsValid(false);
      setCurrentError(
        `File size (${formatFileSize(pickedFile.size)}) exceeds the maximum limit of ${formatFileSize(
          maxSizeInBytes,
        )}`,
      );
      setPreviewUrl(undefined);
      onInput(id, undefined, false);
      // Allow re-selecting the same file later
      event.target.value = "";
      return;
    }

    // Valid pick -> load it, then open the crop modal instead of using the raw file directly
    setCurrentError(undefined);
    setCrop(undefined);
    setCompletedCrop(undefined);

    void readFileAsDataURL(pickedFile).then((dataUrl) => {
      setPendingFile(pickedFile);
      setRawImageSrc(dataUrl);
      setCropModalOpen(true);
    });

    // Allow re-selecting the same file later
    event.target.value = "";
  };

  const pickImageHandler = () => filePickerRef.current?.click();

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspectRatio) {
      setCrop(centerAspectCrop(width, height, aspectRatio));
    } else {
      setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
    }
  };

  const closeCropModal = () => {
    setCropModalOpen(false);
    setRawImageSrc("");
    setPendingFile(undefined);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleUseWithoutCropping = () => {
    if (pendingFile) applyFile(pendingFile, rawImageSrc);
    closeCropModal();
  };

  const handleConfirmCrop = async () => {
    if (!imgRef.current || !pendingFile) return;

    if (!completedCrop || !completedCrop.width || !completedCrop.height) {
      applyFile(pendingFile, rawImageSrc);
      closeCropModal();
      return;
    }

    try {
      const croppedFile = await getCroppedFile(
        imgRef.current,
        completedCrop,
        pendingFile.name,
        pendingFile.type || "image/jpeg",
      );
      applyFile(croppedFile);
    } catch {
      setCurrentError("Could not crop image, please try again");
    } finally {
      closeCropModal();
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <input
        id={id}
        ref={filePickerRef}
        style={{ display: "none" }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <Box
        sx={{
          border: "2px dashed",
          borderColor: !isValid && currentError ? "error.main" : "divider",
          borderRadius: 2,
          p: 2,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "border-color 0.2s ease",
        }}
      >
        {previewUrl && (
          <Box sx={{ mb: 2 }}>
            <Image
              src={previewUrl}
              alt="Preview"
              height={200}
              width={200}
              style={{
                maxWidth: "100%",
                height: 128,
                width: "auto",
                objectFit: "contain",
                margin: "0 auto",
                borderRadius: 8,
                display: "block",
              }}
            />
          </Box>
        )}

        <Button
          type="button"
          onClick={pickImageHandler}
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
        >
          {previewUrl ? "Change Image" : "Pick Image"}
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          Maximum file size: {formatFileSize(maxSizeInBytes)}
        </Typography>

        {!isValid && currentError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {currentError}
          </Typography>
        )}
      </Box>

      <Dialog
        open={cropModalOpen}
        onClose={closeCropModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crop Image</DialogTitle>
        <DialogContent>
          {rawImageSrc && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                maxHeight: "60vh",
                overflow: "auto",
              }}
            >
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                keepSelection
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={rawImageSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: "56vh", maxWidth: "100%" }}
                />
              </ReactCrop>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeCropModal} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUseWithoutCropping} color="secondary">
            Use Without Cropping
          </Button>
          <Button
            onClick={() => {
              void handleConfirmCrop();
            }}
            variant="contained"
            startIcon={<CropIcon />}
          >
            Crop & Use
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload;
