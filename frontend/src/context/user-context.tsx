"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { type User } from "@/types/type";

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  otpExpiration: string | null;
  setOtpExpiration: (exp: string) => void;
  verificationEmail: string | null;
  setVerificationEmail: (email: string) => void;
  fetchUser: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpExpiration, setOtpExpiration] = useState<string | null>(null);

  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );
  const fetchUser = useCallback(() => {
    void (async () => {
      try {
        setIsLoading(true);

        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const resData = await res.json();
        setUser(resData.data);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const logout = useCallback(() => {
    void (async () => {
      try {
        setIsLoading(true);

        const res = await fetch("/api/auth/logout", {
          credentials: "include",
        });

        if (res.ok) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        verificationEmail,
        setVerificationEmail,
        isLoading,
        isAuthenticated: !!user,
        fetchUser,
        logout,
        otpExpiration,
        setOtpExpiration,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
