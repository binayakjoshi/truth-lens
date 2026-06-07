"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type User = {
  id: string;
  email: string;
  username: string;
};

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
      } else {
        const resData = await res.json();

        setUser(resData.data);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/logout", {
        credentials: "include",
      });

      if (res.ok) {
        setUser(null);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        fetchUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a <UserProvider>");
  }
  return ctx;
}
