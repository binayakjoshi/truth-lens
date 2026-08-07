"use client";

import { useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import AppModal from "@/components/custom-elements/modal";
import Input from "@/components/custom-elements/input";
import { useForm, type InputState } from "@/hooks/use-form";
import { VALIDATOR_REQUIRE } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

function toISOStringWithTimezone(date: Date): string {
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");
  const tzOffsetMinutes = -date.getTimezoneOffset();
  const sign = tzOffsetMinutes >= 0 ? "+" : "-";
  const offsetHours = pad(tzOffsetMinutes / 60);
  const offsetMinutes = pad(tzOffsetMinutes % 60);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `.${String(date.getMilliseconds()).padStart(3, "0")}` +
    `${sign}${offsetHours}:${offsetMinutes}`
  );
}

const initialInputs: Record<string, InputState> = {
  startDate: { value: "", isValid: false, touched: false },
  endDate: { value: "", isValid: false, touched: false },
};

export default function DownloadReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [formState, inputHandler, setFormData] = useForm(initialInputs, false);

  const startDateValue = (formState.inputs.startDate.value as string) || "";
  const endDateValue = (formState.inputs.endDate.value as string) || "";

  const { error } = useToast();
  const resetState = () => {
    setFormData(initialInputs, false);
  };

  const handleClose = () => {
    if (isDownloading) return;
    setIsOpen(false);
    resetState();
  };

  const handleConfirm = async () => {
    if (!startDateValue || !endDateValue) {
      error("Please select both start and end dates.");
      return;
    }

    const start = new Date(`${startDateValue}T00:00:00`);
    const end = new Date(`${endDateValue}T23:59:59.999`);

    if (start > end) {
      error("Start date must be before end date.");
      return;
    }

    setIsDownloading(true);

    try {
      const params = new URLSearchParams({
        startDate: toISOStringWithTimezone(start),
        endDate: toISOStringWithTimezone(end),
      });

      const res = await fetch(`/api/analysis/export?${params.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to download report.");
      }

      const contentDisposition = res.headers.get("content-disposition") ?? "";
      const filename =
        contentDisposition.match(/filename="?([^"]+)"?/)?.[1] ??
        "analysis-report.pdf";

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsOpen(false);
      resetState();
    } catch (err: unknown) {
      error(
        err instanceof Error
          ? err.message
          : "Something went wrong while downloading.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={
          isDownloading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <DownloadIcon fontSize="small" />
          )
        }
        onClick={() => setIsOpen(true)}
        disabled={isDownloading}
        sx={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: "0.8rem",
          textTransform: "none",
          whiteSpace: "nowrap",
        }}
      >
        {isDownloading ? "Downloading..." : "Download Report"}
      </Button>

      <AppModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Download Report"
        size="sm"
        onConfirm={handleConfirm}
        confirmLabel={isDownloading ? "Downloading..." : "Download"}
        cancelLabel="Cancel"
        confirmDisabled={isDownloading || !formState.isValid}
      >
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            Select a date range to export analysis history as a PDF report.
          </Typography>

          <Input
            id="startDate"
            element="input"
            type="date"
            label="Start Date"
            initialValue=""
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Start date is required."
            onInput={inputHandler}
            required
            readOnly={isDownloading}
          />

          <Input
            id="endDate"
            element="input"
            type="date"
            label="End Date"
            initialValue=""
            validators={[VALIDATOR_REQUIRE()]}
            errorText="End date is required."
            onInput={inputHandler}
            required
            readOnly={isDownloading}
          />
        </Stack>
      </AppModal>
    </>
  );
}
