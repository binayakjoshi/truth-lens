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

import ContinueWithGoogle from "@/components/auth/continue-google";
import Input from "@/components/custom-elements/input";
import { useForm } from "@/hooks/use-form";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MAXLENGTH,
  VALIDATOR_REQUIRE,
  VALIDATOR_USERNAME,
  VALIDATOR_PASSWORD,
} from "@/lib/validators";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formState, inputHandler] = useForm(
    {
      firstName: { value: "", isValid: false, touched: false },
      lastName: { value: "", isValid: false, touched: false },
      username: { value: "", isValid: false, touched: false },
      email: { value: "", isValid: false, touched: false },
      password: { value: "", isValid: false, touched: false },
    },
    false,
  );

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid) return;
    setIsLoading(true);
    const payload = {
      firstName: formState.inputs.firstName.value,
      lastName: formState.inputs.lastName.value,
      username: formState.inputs.username.value as string,
      email: formState.inputs.email.value as string,
      password: formState.inputs.password.value as string,
    };

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        if (res.status === 400 || res.status === 409) {
          toast.error(resData.message);
          return;
        }
      }
      if (res.ok) {
        toast.success("Successfully created an account. Redirecting ....");
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Create an account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start detecting deepfakes in minutes
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(e) => {
          void submitHandler(e);
        }}
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        {/* First name + Last name side by side */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Input
            id="firstName"
            element="input"
            type="text"
            label="First name"
            placeholder="Jane"
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(20)]}
            errorText="First name is required (max 20 chars)."
            onInput={inputHandler}
            initialValue=""
            initialValid={false}
            autocomplete="given-name"
          />
          <Input
            id="lastName"
            element="input"
            type="text"
            label="Last name"
            placeholder="Doe"
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(20)]}
            errorText="Last name is required (max 20 chars)."
            onInput={inputHandler}
            initialValue=""
            initialValid={false}
            autocomplete="family-name"
          />
        </Box>

        <Input
          id="username"
          element="input"
          type="text"
          label="Username"
          placeholder="jane_doe42"
          validators={[VALIDATOR_USERNAME()]}
          errorText="Must start with a lowercase letter; only lowercase letters, numbers, and underscores allowed."
          onInput={inputHandler}
          initialValue=""
          initialValid={false}
          autocomplete="username"
        />

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
          validators={[VALIDATOR_PASSWORD(), VALIDATOR_REQUIRE()]}
          errorText="Min 8 characters, must include at least one number and one special character (!@#$%^&*)."
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!formState.isValid || isLoading}
          fullWidth
          sx={{ mt: 0.5 }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Create account"
          )}
        </Button>

        <Divider>
          <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
            OR
          </Typography>
        </Divider>
        <ContinueWithGoogle />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Already have an account?{" "}
          <Link
            component={NextLink}
            href="/login"
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </>
  );
}
