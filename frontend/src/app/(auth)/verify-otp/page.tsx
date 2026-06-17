"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { MarkEmailRead } from "@mui/icons-material";
import { Box, Button, CircularProgress, Link, Typography } from "@mui/material";
import toast from "react-hot-toast";

import { useUser } from "@/context/user-context";

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { otpExpiration, setOtpExpiration, verificationEmail } = useUser();
  // Derive countdown from otpExpiration timestamp
  useEffect(() => {
    if (!otpExpiration) return;
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(otpExpiration).getTime() - Date.now()) / 1000),
      );
      setCountdown(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [otpExpiration]);

  const focusInput = (index: number) => inputRefs.current[index]?.focus();

  // Focus the first input on mount
  useEffect(() => {
    focusInput(0);
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const otp = digits.join("");
  const isComplete = digits.every((d) => d !== "");

  const handleVerify = useCallback(async () => {
    if (!isComplete) return;
    try {
      setIsVerifying(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 || res.status === 404 || res.status === 401)
          toast.error(data.message);
        else toast.error("Could not verify otp code. Please try again later.");

        setDigits(Array(OTP_LENGTH).fill(""));
        focusInput(0);
        return;
      }
      toast.success("Email verified. Welcome!");
      router.push("/");
    } finally {
      setIsVerifying(false);
    }
  }, [isComplete, otp, router, verificationEmail]);

  // Auto-submit once all digits are filled
  useEffect(() => {
    if (isComplete) void handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  const handleResend = async () => {
    try {
      setIsResending(true);
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 || res.status === 404) toast.error(data.message);
        else
          toast.error("Could not resend the otp code. Please try again later.");
        return;
      }
      toast.success("A new code has been sent.");
      setOtpExpiration(data.data.otpExpiration);
      setDigits(Array(OTP_LENGTH).fill(""));
      focusInput(0);
    } finally {
      setIsResending(false);
    }
  };
  const fmtCountdown = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            opacity: 0.9,
          }}
        >
          <MarkEmailRead sx={{ color: "#fff", fontSize: 24 }} />
        </Box>

        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Check your inbox
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We sent a 6-digit code to{" "}
          {verificationEmail ? (
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: 500 }}
            >
              {verificationEmail}
            </Typography>
          ) : (
            "your email address"
          )}
          . Enter it below to verify your account.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 1.5 },
          mb: 3,
          justifyContent: "center",
        }}
        onPaste={handlePaste}
      >
        {digits.map((digit, i) => (
          <Box
            key={i}
            component="input"
            ref={(el: HTMLInputElement | null) => {
              inputRefs.current[i] = el;
            }}
            value={digit}
            maxLength={1}
            inputMode="numeric"
            autoComplete="one-time-code"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(i, e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(i, e)
            }
            sx={{
              width: { xs: 44, sm: 52 },
              height: { xs: 52, sm: 60 },
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: digit ? "primary.main" : "divider",
              bgcolor: "background.default",
              color: "text.primary",
              fontSize: "1.5rem",
              fontWeight: 700,
              textAlign: "center",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              caretColor: "transparent",
              "&:focus": {
                borderColor: "primary.main",
                boxShadow: "0 0 0 3px rgba(138,92,246,0.2)",
              },
              "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
                appearance: "none",
              },
            }}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={!isComplete || isVerifying}
        onClick={() => void handleVerify()}
        sx={{ mb: 3 }}
      >
        {isVerifying ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          "Verify email"
        )}
      </Button>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        Didn&apos;t receive it?{" "}
        {countdown > 0 ? (
          <Typography component="span" variant="body2" color="text.disabled">
            Resend in {fmtCountdown(countdown)}
          </Typography>
        ) : (
          <Link
            component="button"
            variant="body2"
            underline="hover"
            sx={{ fontWeight: 500, cursor: "pointer" }}
            onClick={() => {
              if (!isResending) void handleResend();
            }}
            disabled={isResending}
          >
            {isResending ? "Sending…" : "Resend code"}
          </Link>
        )}
      </Typography>
    </>
  );
}
