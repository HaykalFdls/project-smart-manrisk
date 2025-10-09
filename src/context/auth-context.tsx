"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import type { User, UserPermissions } from "@/types/user";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (user_id: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type JWTPayload = {
  id: number;
  role_id: number;
  exp: number;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // 🔎 Cek apakah token sudah expired
  const isTokenExpired = (jwt: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(jwt);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Logout (hapus session & redirect)
  const logout = useCallback(async () => {
    console.log("🚪 Logout dipanggil");
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("❌ Logout error:", err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("smart_user");
      localStorage.removeItem("smart_token");
      router.push("/login");
    }
  }, [router]);

  // Refresh token otomatis
  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/refresh-token", {
        method: "POST",
        credentials: "include", // penting agar cookie refreshToken dikirim
      });

      if (!res.ok) throw new Error("Gagal memperpanjang token");

      const data = await res.json();
      if (!data.token || !data.user) throw new Error("Data refresh tidak lengkap");

      const p = data.user.permissions || {};
      const permissions: UserPermissions = {
        can_create: !!p.can_create,
        can_read: !!p.can_read,
        can_view: !!p.can_view,
        can_update: !!p.can_update,
        can_approve: !!p.can_approve,
        can_delete: !!p.can_delete,
        can_provision: !!p.can_provision,
      };

      const updatedUser: User = { ...data.user, permissions };

      setUser(updatedUser);
      setToken(data.token);
      localStorage.setItem("smart_user", JSON.stringify(updatedUser));
      localStorage.setItem("smart_token", data.token);

      console.log(" Token berhasil diperpanjang:", new Date().toLocaleTimeString());
    } catch (err) {
      console.error("❌ Refresh token gagal:", err);
      await logout();
    }
  }, [logout]);

  //  Restore session dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("smart_user");
    const storedToken = localStorage.getItem("smart_token");

    if (storedUser && storedToken && storedToken !== "undefined" && storedToken !== "null") {
      if (!isTokenExpired(storedToken)) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        console.warn("⚠️ Token expired saat restore, logout otomatis");
        logout();
      }
    }
    setIsReady(true);
  }, [logout]);

  //  Jalankan auto-refresh token setiap 10 menit
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshToken();
    }, 10 * 60 * 1000); // setiap 10 menit
    return () => clearInterval(interval);
  }, [token, refreshToken]);

  //  Login
  const login = async (user_id: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // penting agar cookie refreshToken disimpan
        body: JSON.stringify({ user_id, password }),
      });

      if (!res.ok) throw new Error("Login gagal");
      const data = await res.json();

      const p = data.user.permissions || {};
      const permissions: UserPermissions = {
        can_create: !!p.can_create,
        can_read: !!p.can_read,
        can_view: !!p.can_view,
        can_update: !!p.can_update,
        can_approve: !!p.can_approve,
        can_delete: !!p.can_delete,
        can_provision: !!p.can_provision,
      };

      const userData: User = { ...data.user, permissions };
      setUser(userData);
      setToken(data.token);

      localStorage.setItem("smart_user", JSON.stringify(userData));
      localStorage.setItem("smart_token", data.token);

      console.log("✅ Login berhasil untuk:", userData.name);
      return true;
    } catch (err) {
      console.error("❌ Login error:", err);
      return false;
    }
  };

  //  fetchWithAuth → otomatis refresh jika expired
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!token) throw new Error("Tidak ada token, harap login");

    if (isTokenExpired(token)) {
      console.warn("⚠️ Token expired, mencoba refresh...");
      await refreshToken();
    }

    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isReady,
        login,
        logout,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
