// multi-image-upload.tsx
"use client";

import type React from "react";
import { useRef, useState, useEffect, useCallback } from "react";

import Image from "next/image";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CropIcon from "@mui/icons-material/Crop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type SelectedFile = {
  file: File;
  previewUrl: string;
};

type QueuedFile = {
  file: File;
  dataUrl: string;
};

type MultiImageUploadProps = {
  id: string;
  errorText?: string;
  maxSizeInBytes?: number;
  maxFiles?: number;
  /** Lock the crop box to this ratio (e.g. 1 for 1:1). Omit for a free-form crop. */
  aspectRatio?: number;
  onInput: (id: string, files: File[], isValid: boolean) => void;
  /**
   * Bump this value (e.g. a counter incremented on successful submit) to
   * clear the currently selected files/previews from the picker. The
   * picker is otherwise uncontrolled, so the parent can't clear it by
   * resetting its own `files` state alone.
   */
  clearTrigger?: number;
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

const MultiImageUpload = ({
  id,
  errorText,
  maxSizeInBytes = 5 * 1024 * 1024,
  maxFiles = 15,
  aspectRatio,
  onInput,
  clearTrigger,
}: MultiImageUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [currentError, setCurrentError] = useState<string | undefined>();
  const filePickerRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Queue of files (with their data URLs already loaded) awaiting the crop
  // modal, processed one at a time. Loading the data URL up-front — at the
  // point files are picked or a decision is made — means we never need an
  // effect to derive it from `currentFile`.
  const [cropQueue, setCropQueue] = useState<QueuedFile[]>([]);
  const [cropQueueTotal, setCropQueueTotal] = useState(0);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const currentFile = cropQueue[0];
  const cropModalOpen = cropQueue.length > 0;
  const currentIndex = cropQueueTotal - cropQueue.length + 1;

  // clean up object URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear the picker whenever the parent bumps clearTrigger (e.g. after a
  // successful upload). Skip on initial mount so passing clearTrigger={0}
  // doesn't wipe anything before the user has picked files.
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (clearTrigger === undefined) return;

    const raf = requestAnimationFrame(() => {
      setSelectedFiles((prev) => {
        prev.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        return [];
      });

      setCurrentError(undefined);
      setCropQueue([]);
      setCropQueueTotal(0);
      setCrop(undefined);
      setCompletedCrop(undefined);

      if (filePickerRef.current) {
        filePickerRef.current.value = "";
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [clearTrigger]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const emitChange = useCallback(
    (files: SelectedFile[]) => {
      const isValid = files.length > 0 && files.length <= maxFiles;
      onInput(
        id,
        files.map((f) => f.file),
        isValid,
      );
    },
    [id, maxFiles, onInput],
  );

  const addFileToSelection = useCallback(
    (file: File, dataUrl: string) => {
      setSelectedFiles((prev) => {
        if (prev.length >= maxFiles) return prev;
        const next = [...prev, { file, previewUrl: dataUrl }];
        emitChange(next);
        return next;
      });
    },
    [maxFiles, emitChange],
  );

  const enqueueFiles = async (files: File[]) => {
    const queued = await Promise.all(
      files.map(async (file) => ({
        file,
        dataUrl: await readFileAsDataURL(file),
      })),
    );
    setCropQueue((prev) => [...prev, ...queued]);
    setCropQueueTotal((prev) => prev + queued.length);
  };

  const pickedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pickedList = event.target.files;

    if (!pickedList || pickedList.length === 0) {
      setCurrentError(errorText || "Please select at least one image");
      if (filePickerRef.current) filePickerRef.current.value = "";
      return;
    }

    const incoming = Array.from(pickedList);
    const oversized = incoming.filter((f) => f.size > maxSizeInBytes);
    const validIncoming = incoming.filter((f) => f.size <= maxSizeInBytes);

    const remainingSlots = Math.max(
      0,
      maxFiles - selectedFiles.length - cropQueue.length,
    );
    const accepted = validIncoming.slice(0, remainingSlots);
    const truncatedCount = validIncoming.length - accepted.length;

    let error: string | undefined;
    if (truncatedCount > 0) {
      error = `You can upload a maximum of ${maxFiles} images. ${truncatedCount} extra file${
        truncatedCount === 1 ? "" : "s"
      } will not be added.`;
    } else if (oversized.length > 0) {
      error = `${oversized.length} file${
        oversized.length === 1 ? "" : "s"
      } exceeded the ${formatFileSize(maxSizeInBytes)} size limit and ${
        oversized.length === 1 ? "was" : "were"
      } skipped.`;
    } else {
      error = undefined;
    }
    setCurrentError(error);

    if (accepted.length > 0) {
      if (cropQueue.length === 0) {
        setCrop(undefined);
        setCompletedCrop(undefined);
      }
      void enqueueFiles(accepted);
    }

    if (filePickerRef.current) filePickerRef.current.value = "";
  };

  const pickImageHandler = () => {
    filePickerRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((_, i) => i !== index);
      setCurrentError(undefined);
      emitChange(next);
      return next;
    });
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspectRatio) {
      setCrop(centerAspectCrop(width, height, aspectRatio));
    } else {
      setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
    }
  };

  const advanceQueue = () => {
    setCropQueue((prev) => prev.slice(1));
    setCropQueueTotal((prev) => (cropQueue.length <= 1 ? 0 : prev));
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleCancelCurrent = () => {
    // Skip this one file entirely, move to the next in the queue
    advanceQueue();
  };

  const handleCancelAll = () => {
    setCropQueue([]);
    setCropQueueTotal(0);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleUseWithoutCropping = () => {
    if (currentFile) addFileToSelection(currentFile.file, currentFile.dataUrl);
    advanceQueue();
  };

  const handleConfirmCrop = async () => {
    if (!currentFile) return;

    if (
      !imgRef.current ||
      !completedCrop ||
      !completedCrop.width ||
      !completedCrop.height
    ) {
      addFileToSelection(currentFile.file, currentFile.dataUrl);
      advanceQueue();
      return;
    }

    try {
      const croppedFile = await getCroppedFile(
        imgRef.current,
        completedCrop,
        currentFile.file.name,
        currentFile.file.type || "image/jpeg",
      );
      const croppedDataUrl = await readFileAsDataURL(croppedFile);
      addFileToSelection(croppedFile, croppedDataUrl);
    } catch {
      setCurrentError("Could not crop image, please try again");
      addFileToSelection(currentFile.file, currentFile.dataUrl);
    } finally {
      advanceQueue();
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
        multiple
        onChange={pickedHandler}
      />
      <Box
        sx={{
          border: "2px dashed",
          borderColor: currentError ? "error.main" : "divider",
          borderRadius: 2,
          p: 2,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "border-color 0.2s ease",
        }}
      >
        {selectedFiles.length > 0 && (
          <Grid container spacing={1.5} sx={{ mb: 2, width: "100%" }}>
            {selectedFiles.map((f, index) => (
              <Grid size={{ xs: 4, sm: 3 }} key={`${f.file.name}-${index}`}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: 1.5,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Image
                    src={f.previewUrl}
                    alt={f.file.name}
                    fill
                    sizes="120px"
                    style={{ objectFit: "cover" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        <Button
          type="button"
          onClick={pickImageHandler}
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
          disabled={selectedFiles.length >= maxFiles}
        >
          {selectedFiles.length > 0 ? "Add More Images" : "Pick Images"}
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {selectedFiles.length}/{maxFiles} selected · Max file size:{" "}
          {formatFileSize(maxSizeInBytes)}
        </Typography>

        {currentError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {currentError}
          </Typography>
        )}
      </Box>

      <Dialog
        open={cropModalOpen}
        onClose={handleCancelCurrent}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Crop Image
          {cropQueueTotal > 1 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Image {currentIndex} of {cropQueueTotal}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {currentFile && (
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
                  src={currentFile.dataUrl}
                  onLoad={onImageLoad}
                  style={{ maxHeight: "56vh", maxWidth: "100%" }}
                />
              </ReactCrop>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
          <Button onClick={handleCancelCurrent} color="inherit">
            Skip This Image
          </Button>
          {cropQueueTotal > 1 && (
            <Button onClick={handleCancelAll} color="inherit">
              Cancel All
            </Button>
          )}
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

export default MultiImageUpload;
