"use client";

import type React from "react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

type ImageUploadProps = {
  id: string;
  errorText?: string;
  initialValue?: string;
  maxSizeInBytes?: number;
  onInput: (id: string, file: File | undefined, isValid: boolean) => void;
};

const ImageUpload = ({
  id,
  errorText,
  initialValue,
  maxSizeInBytes = 5 * 1024 * 1024,
  onInput,
}: ImageUploadProps) => {
  const [file, setFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialValue,
  );
  const [isValid, setIsValid] = useState(!!initialValue);
  const [currentError, setCurrentError] = useState<string | undefined>(
    errorText,
  );
  const filePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialValue) {
      setPreviewUrl(initialValue);
      setIsValid(true);
      setCurrentError(undefined);
    }
  }, [initialValue]);

  useEffect(() => {
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const pickedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    let pickedFile: File | undefined;
    let fileIsValid = false;
    let error: string | undefined;

    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      if (pickedFile.size > maxSizeInBytes) {
        error = `File size (${formatFileSize(
          pickedFile.size,
        )}) exceeds the maximum limit of ${formatFileSize(maxSizeInBytes)}`;
        fileIsValid = false;
        setFile(undefined);
        setPreviewUrl(undefined);
      } else {
        setFile(pickedFile);
        fileIsValid = true;
        error = undefined;
      }
    } else {
      error = errorText || "Please select a valid image file";
      fileIsValid = false;
      setFile(undefined);
      setPreviewUrl(undefined);
    }

    setIsValid(fileIsValid);
    setCurrentError(error);
    onInput(id, pickedFile, fileIsValid);
  };

  const pickImageHandler = () => {
    filePickerRef.current?.click();
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
    </Box>
  );
};

export default ImageUpload;
