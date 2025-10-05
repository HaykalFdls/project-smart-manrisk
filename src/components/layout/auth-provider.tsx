"use client";

import React, { useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/spinner";

const AUTH_STORAGE_KEY = "smart-login-token";
const REFRESH_INTERVAL = 1000 * 60 * 50; // 50 menit sebelum expired (1 jam)

export const AuthContext = React.createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  // ======== CEK TOKEN SAAT LOAD =========
  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      setIsAuthenticated(true);
      scheduleTokenRefresh(token);
    }
    setIsLoading(false);
  }, []);

  // ======== LOGIN =========
  const login = async (user_id: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      setIsAuthenticated(true);
      scheduleTokenRefresh(data.token);
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: err.message || "Terjadi kesalahan.",
      });
    }
  };

  // ======== LOGOUT =========
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEY);
      if (token) {
        await fetch("http://localhost:5000/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout gagal:", error);
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsAuthenticated(false);
      router.push("/");
    }
  }, [router]);

  // ======== AUTO REFRESH TOKEN =========
  const scheduleTokenRefresh = (token: string) => {
    setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:5000/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (data.token) {
          localStorage.setItem(AUTH_STORAGE_KEY, data.token);
          toast({ title: "Session diperpanjang" });
          scheduleTokenRefresh(data.token); // jadwalkan ulang
        } else {
          toast({
            variant: "destructive",
            title: "Sesi kadaluarsa",
            description: "Silakan login ulang.",
          });
          logout();
        }
      } catch (error) {
        console.error("Gagal refresh token:", error);
        logout();
      }
    }, REFRESH_INTERVAL);
  };

  // ======== AUTO LOGOUT WARNING =========
  useEffect(() => {
    const warningTimer = setTimeout(() => {
      toast({
        title: "Sesi akan berakhir sebentar lagi ⏳",
        description: "Sesi Anda akan otomatis diperpanjang.",
      });
    }, REFRESH_INTERVAL - 5 * 60 * 1000); // 5 menit sebelum refresh

    return () => clearTimeout(warningTimer);
  }, [isAuthenticated]);

  if (isLoading) return <Spinner />;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
