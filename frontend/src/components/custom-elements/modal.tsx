"use client";

import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  type DialogProps,
  IconButton,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";

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
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "error";
  confirmDisabled?: boolean;
  hideActions?: boolean;
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
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "primary",
  confirmDisabled = false,
  hideActions = false,
}) => {
  const handleClose: DialogProps["onClose"] = (_e, reason) => {
    if (reason === "backdropClick" && !closeOnBackdrop) return;
    onClose();
  };

  const showFooter = !hideActions && onConfirm !== undefined;

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
            border: "1px solid",
            borderColor: "divider",
            ...paperSx,
          },
        },
        backdrop: {
          sx: { bgcolor: "rgba(0,0,0,0.55)" },
        },
      }}
    >
      {(title || showCloseButton) && (
        <DialogTitle
          component="div"
          sx={{
            p: 0,
            mb: 2,
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

      <DialogContent sx={{ p: 0 }}>{children}</DialogContent>

      {showFooter && (
        <DialogActions sx={{ px: 0, pt: 3, pb: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, width: "100%" }}>
            <Button variant="outlined" onClick={onClose}>
              {cancelLabel}
            </Button>
            {onConfirm && (
              <Button
                variant="contained"
                color={confirmColor}
                disabled={confirmDisabled}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            )}
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AppModal;
