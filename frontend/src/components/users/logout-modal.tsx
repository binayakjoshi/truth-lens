"use client";

import { useState } from "react";

import { Button } from "@mui/material";
import toast from "react-hot-toast";

import AppModal from "@/components/custom-elements/modal";
import { useUser } from "@/context/user-context";

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
      setIsOpen(false);
    }
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
        onConfirm={handleLogout}
        confirmLabel="Logout"
        confirmColor="error"
        confirmDisabled={isLoading}
      >
        Are you sure you want to log out? You will need to sign in again to
        access your account.
      </AppModal>
    </>
  );
};

export default LogoutModal;
