"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";

import Input from "@/components/custom-elements/input";
import { useForm } from "@/hooks/use-form";
import { VALIDATOR_PASSWORD } from "@/lib/validators";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formState, inputHandler] = useForm(
    {
      password: { value: "", isValid: false, touched: false },
      confirmPassword: { value: "", isValid: false, touched: false },
    },
    false,
  );

  const passwordsMatch =
    formState.inputs.password.value === formState.inputs.confirmPassword.value;

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid || !passwordsMatch) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: formState.inputs.password.value,
        }),
      });
      const resData = await res.json();

      if (!res.ok) {
        if (res.status === 400 || res.status === 404) {
          toast.error(resData.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        return;
      }

      toast.success("Password reset successfully. Please sign in.");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormReady = formState.isValid && passwordsMatch;

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Set a new password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a strong password for your account.
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(e) => {
          void submitHandler(e);
        }}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          animation: "fadeSlideUp 0.6s ease-out forwards",
          opacity: 0,
        }}
      >
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <Input
          id="password"
          element="input"
          type={showPassword ? "text" : "password"}
          label="New password"
          validators={[VALIDATOR_PASSWORD()]}
          errorText="Password must be at least 8 characters."
          onInput={inputHandler}
          initialValue=""
          initialValid={false}
          autocomplete="new-password"
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((p) => !p)}
                edge="end"
                size="small"
              >
                {showPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          }
        />

        <Input
          id="confirmPassword"
          element="input"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm new password"
          validators={[VALIDATOR_PASSWORD()]}
          errorText="Password must be at least 8 characters."
          onInput={inputHandler}
          initialValue=""
          initialValid={false}
          autocomplete="new-password"
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword((p) => !p)}
                edge="end"
                size="small"
              >
                {showConfirmPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          }
        />

        {formState.inputs.confirmPassword.value !== "" && !passwordsMatch && (
          <Typography variant="caption" color="error" sx={{ mt: -1.5 }}>
            Passwords do not match.
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!isFormReady || isLoading}
          fullWidth
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Reset password"
          )}
        </Button>
      </Box>
    </>
  );
}
