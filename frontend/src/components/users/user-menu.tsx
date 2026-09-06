"use client";
import { useState, type MouseEvent } from "react";

import { useRouter } from "next/navigation";

import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";

import AppModal from "@/components/custom-elements/modal";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";

type UserMenuProps = {
  firstName: string;
  lastName: string;
};

const getInitials = (firstName: string, lastName: string) => {
  const first = firstName?.trim()?.[0] ?? "";
  const last = lastName?.trim()?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
};

const UserMenu = ({ firstName, lastName }: UserMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useUser();
  const { error } = useToast();
  const router = useRouter();

  const menuOpen = Boolean(anchorEl);

  const handleAvatarClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    router.push("/profile"); // empty/placeholder route for now
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setIsLogoutOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoading(true);
      await logout();

      router.push("/");
      router.refresh();
    } catch {
      error("Failed to log out. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLogoutOpen(false);
    }
  };

  return (
    <>
      <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "primary.main",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {getInitials(firstName, lastName)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: { minWidth: 200, mt: 1 },
          },
        }}
      >
        <MenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Logout</ListItemText>
        </MenuItem>
      </Menu>

      <AppModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        title="Confirm Logout"
        size="sm"
        closeOnBackdrop
        onConfirm={() => void handleLogoutConfirm()}
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

export default UserMenu;
