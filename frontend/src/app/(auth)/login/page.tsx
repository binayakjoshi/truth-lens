"use client";

import React, { useState } from "react";

import NextLink from "next/link";
import { useRouter } from "next/navigation";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";

import Input from "@/components/custom-elements/input";
import { useUser } from "@/context/user-context";
import { useForm } from "@/hooks/use-form";
import { VALIDATOR_EMAIL, VALIDATOR_PASSWORD } from "@/lib/validators";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { fetchUser, setOtpExpiration, setVerificationEmail } = useUser();
  const [formState, inputHandler] = useForm(
    {
      email: { value: "", isValid: false, touched: false },
      password: { value: "", isValid: false, touched: false },
    },
    false,
  );

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid) return;
    const payload = {
      email: formState.inputs.email.value as string,
      password: formState.inputs.password.value as string,
    };

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        if (res.status === 401 || res.status === 404) {
          toast.error(resData.message);
          return;
        }
      }
      if (res.ok) {
        if (resData.message.includes("verification")) {
          setOtpExpiration(resData.data.otpExpiration);
          setVerificationEmail(resData.data.email);
          toast.success("Account not verifed. Please verify your email");
          router.push("/verify-otp");
          return;
        }
        fetchUser();
        toast.success("Login successful. Redirecting ....");
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your account to continue
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

        <Input
          id="password"
          element="input"
          type={showPassword ? "text" : "password"}
          label="Password"
          validators={[VALIDATOR_PASSWORD()]}
          errorText="Password must be at least 8 characters."
          onInput={inputHandler}
          initialValue=""
          initialValid={false}
          autocomplete="current-password"
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1 }}>
          <Link href="/forgot-password" underline="hover" variant="body2">
            Forgot password?
          </Link>
        </Box>

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
            "Sign in"
          )}
        </Button>

        <Divider>
          <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
            OR
          </Typography>
        </Divider>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            component={NextLink}
            href="/signup"
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            Create one
          </Link>
        </Typography>
      </Box>
    </>
  );
}
