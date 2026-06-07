"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogProps,
  IconButton,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  paperSx?: SxProps<Theme>;
}

const SIZE_MAP: Record<ModalSize, DialogProps["maxWidth"]> = {
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
};

const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  paperSx,
}) => {
  const handleClose: DialogProps["onClose"] = (_e, reason) => {
    if (reason === "backdropClick" && !closeOnBackdrop) return;
    onClose();
  };
  // slotProps={{
  //        paper: {
  //          sx: {
  //            borderRadius: 2,
  //            p: { xs: 2, sm: 3 },
  //            maxHeight: "90vh",
  //            ...paperSx,
  //          },
  //        },
  //        backdrop: {
  //          sx: { bgcolor: "rgba(0,0,0,0.5)" },
  //        },
  //     }}

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={SIZE_MAP[size]}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            p: { xs: 2, sm: 3 },
            maxHeight: "90vh",
            bgcolor: "#ffffff", // ← add this
            color: "rgba(0,0,0,0.87)", // ← and this for text
            ...paperSx,
          },
        },
      }}
    >
      {/* Header */}
      {(title || showCloseButton) && (
        <DialogTitle
          component="div"
          sx={{
            p: 0,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {title && (
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, textTransform: "capitalize" }}
            >
              {title}
            </Typography>
          )}
          {showCloseButton && (
            <IconButton
              aria-label="close modal"
              onClick={onClose}
              size="small"
              sx={{
                ml: "auto",
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>
      )}

      {/* Body */}
      <DialogContent sx={{ p: 0 }}>{children}</DialogContent>
    </Dialog>
  );
};

export default AppModal;
