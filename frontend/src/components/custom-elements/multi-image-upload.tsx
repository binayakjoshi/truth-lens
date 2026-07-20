"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";

import Image from "next/image";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

type SelectedFile = {
  file: File;
  previewUrl: string;
};

type MultiImageUploadProps = {
  id: string;
  errorText?: string;
  maxSizeInBytes?: number;
  maxFiles?: number;
  onInput: (id: string, files: File[], isValid: boolean) => void;
};

const MultiImageUpload = ({
  id,
  errorText,
  maxSizeInBytes = 5 * 1024 * 1024,
  maxFiles = 15,
  onInput,
}: MultiImageUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [currentError, setCurrentError] = useState<string | undefined>();
  const filePickerRef = useRef<HTMLInputElement>(null);

  // clean up object URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const emitChange = (files: SelectedFile[]) => {
    const isValid = files.length > 0 && files.length <= maxFiles;
    onInput(
      id,
      files.map((f) => f.file),
      isValid,
    );
  };

  const pickedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pickedList = event.target.files;
    let error: string | undefined;

    if (!pickedList || pickedList.length === 0) {
      setCurrentError(errorText || "Please select at least one image");
      if (filePickerRef.current) filePickerRef.current.value = "";
      return;
    }

    const incoming = Array.from(pickedList);
    const oversized = incoming.filter((f) => f.size > maxSizeInBytes);

    const validIncoming = incoming.filter((f) => f.size <= maxSizeInBytes);

    setSelectedFiles((prev) => {
      const combined = [
        ...prev,
        ...validIncoming.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ];

      let finalFiles = combined;
      if (combined.length > maxFiles) {
        finalFiles = combined.slice(0, maxFiles);
        error = `You can upload a maximum of ${maxFiles} images. Extra files were not added.`;
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
      emitChange(finalFiles);
      return finalFiles;
    });

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
    </Box>
  );
};

export default MultiImageUpload;
