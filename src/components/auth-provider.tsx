"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/spinner";

// Dummy credentials
const DUMMY_EMAIL = "user@example.com";
const DUMMY_PASSWORD = "password";
const AUTH_STORAGE_KEY = "smart-login-token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only on the client after hydration
    try {
      const storedToken = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedToken) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to access localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (email === DUMMY_EMAIL && pass === DUMMY_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, "dummy-token");
      setIsAuthenticated(true);
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    router.push("/");
  };

  const value = { isAuthenticated, isLoading, login, logout };

  if (isLoading) {
    return <Spinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
