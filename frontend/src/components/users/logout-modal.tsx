"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@mui/material";

import AppModal from "@/components/custom-elements/modal";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";

const LogoutModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { logout } = useUser();
  const { error } = useToast();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.push("/");
      router.refresh();
    } catch {
      error("Failed to log out. Please try again.");
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
        onConfirm={() => void handleLogout()}
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
