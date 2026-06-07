"use client";

import { useState } from "react";

import { Button, Typography, Box } from "@mui/material";
import toast from "react-hot-toast";

import { useUser } from "@/context/user-context";

import AppModal from "../custom-elements/modal";

const LogoutModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { logout } = useUser();
  const handleLogout = () => {
    try {
      setIsLoading(true);
      logout();
    } catch {
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoading(false);
    }
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="outlined" color="error" onClick={() => setIsOpen(true)}>
        Logout
      </Button>

      <AppModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Logout"
        size="sm"
        closeOnBackdrop
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Are you sure you want to log out? You will need to sign in again to
          access your account.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button variant="outlined" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            variant="contained"
            color="error"
            onSubmit={() => {
              void handleLogout();
            }}
          >
            Logout
          </Button>
        </Box>
      </AppModal>
    </>
  );
};

export default LogoutModal;
