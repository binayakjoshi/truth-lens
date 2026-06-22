"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Alert, Snackbar } from "@mui/material";

export type ToastVariant = "success" | "error" | "warning" | "info";

type ToastState = {
  open: boolean;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const initialState: ToastState = {
  open: false,
  message: "",
  variant: "info",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>(initialState);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      setState({ open: true, message, variant });
    },
    [],
  );

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: showToast,
      success: (message: string) => showToast(message, "success"),
      error: (message: string) => showToast(message, "error"),
      warning: (message: string) => showToast(message, "warning"),
      info: (message: string) => showToast(message, "info"),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={state.variant}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontFamily: "var(--font-roboto), sans-serif",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            "& .MuiAlert-icon": { opacity: 0.95 },
          }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
}
