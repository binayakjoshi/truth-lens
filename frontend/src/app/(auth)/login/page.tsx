// app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "@/hooks/use-form";
import Input from "@/components/custom-elements/input";
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH } from "@/lib/validators";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import NextLink from "next/link";
import { Link } from "@mui/material";
import Image from "next/image";
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      console.log({
        email: formState.inputs.email.value,
        password: formState.inputs.password.value,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* ── Left panel ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse at 30% 60%, #2a1f3d 0%, transparent 70%)",
          bgcolor: "background.default",
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background:
                "linear-gradient(135deg, primary.main, primary.light)",
              bgcolor: "primary.main",
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}
          >
            TruthLens
          </Typography>
        </Box>

        {/* Illustration */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 520,
              position: "relative",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 20px 60px rgba(138,92,246,0.15)",
            }}
          >
            <Image
              src="/images/img.png"
              alt="Deepfake detection dashboard with Grad-CAM explainability"
              width={1365}
              height={1024}
              priority
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </Box>
        </Box>
        {/* Tagline */}
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, lineHeight: 1.15, mb: 1.5 }}
          >
            See through
            <br />
            the artificial.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 300 }}
          >
            Deepfake face detection with by Grad-CAM explainability.
          </Typography>
        </Box>

        {/* Ambient orb */}
        <Box
          sx={{
            position: "absolute",
            top: "15%",
            right: "-15%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(138,92,246,0.15) 0%, transparent 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* ── Right panel — form ── */}
      <Box
        sx={{
          width: { xs: "100%", md: 480 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 4, sm: 6 },
          py: 8,
          bgcolor: "background.paper",
        }}
      >
        {/* Mobile brand */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 1.5,
            mb: 5,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: "primary.main",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            TruthLens
          </Typography>
        </Box>

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
          onSubmit={submitHandler}
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
            validators={[VALIDATOR_MINLENGTH(8)]}
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
              href="/register"
              underline="hover"
              sx={{ fontWeight: 500 }}
            >
              Create one
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
