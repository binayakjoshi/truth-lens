"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { Box, Button, CircularProgress, Typography } from "@mui/material";
import toast from "react-hot-toast";

import Input from "@/components/custom-elements/input";
import { useUser } from "@/context/user-context";
import { useForm } from "@/hooks/use-form";
import { VALIDATOR_EMAIL } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setOtpExpiration, setVerificationEmail } = useUser();

  const [formState, inputHandler] = useForm(
    {
      email: { value: "", isValid: false, touched: false },
    },
    false,
  );

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid) return;

    const email = formState.inputs.email.value as string;

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const resData = await res.json();

      if (!res.ok) {
        if (res.status === 404 || res.status === 400 || res.status === 401) {
          toast.error(resData.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        return;
      }

      setVerificationEmail(resData.data.email);
      setOtpExpiration(resData.data.otpExpiration);
      toast.success("Reset code sent. Check your inbox.");
      router.push("/verify-reset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Forgot your password?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter the email address linked to your account and we&apos;ll send you
          a reset code.
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(e) => {
          void submitHandler(e);
        }}
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        <Input
          id="email"
          element="input"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          validators={[VALIDATOR_EMAIL()]}
          errorText="Please enter a valid email address."
          onInput={inputHandler}
          initialValue=""
          initialValid={false}
          autocomplete="email"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!formState.isValid || isLoading}
          fullWidth
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Send reset code"
          )}
        </Button>
      </Box>
    </>
  );
}
