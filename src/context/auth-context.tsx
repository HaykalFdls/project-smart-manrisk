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

  // Helper: cek token expired
  const isTokenExpired = (jwt: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(jwt);
      if (!decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch (err) {
      console.error("❌ Gagal decode token:", err);
      return true;
    }
  };

  // Helper: perpanjang token otomatis
  const refreshToken = useCallback(async () => {
    try {
      if (!token) return;

      const res = await fetch("http://localhost:5000/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Gagal memperpanjang token");

      const data = await res.json();
      const newToken = data.token;
      const newUser = data.user;

      if (!newToken || !newUser) return;

      // Konversi permissions → boolean
      const p = newUser.permissions || {};
      const permissions: UserPermissions = {
        can_create: !!p.can_create,
        can_read: !!p.can_read,
        can_view: !!p.can_view,
        can_update: !!p.can_update,
        can_approve: !!p.can_approve,
        can_delete: !!p.can_delete,
        can_provision: !!p.can_provision,
      };

      const updatedUser: User = { ...newUser, permissions };

      setUser(updatedUser);
      setToken(newToken);
      localStorage.setItem("smart_user", JSON.stringify(updatedUser));
      localStorage.setItem("smart_token", newToken);

      console.log("🔁 Token berhasil diperpanjang:", new Date().toLocaleTimeString());
    } catch (err) {
      console.error("❌ Refresh token gagal:", err);
      logout();
    }
  }, [token]);

  // Restore session dari localStorage
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
  }, []);

  // Jalankan auto-refresh token setiap 10 menit
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshToken();
    }, 10 * 60 * 1000); // setiap 10 menit
    return () => clearInterval(interval);
  }, [token, refreshToken]);

  // Login
  const login = async (user_id: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }),
      });

      if (!res.ok) throw new Error("Login gagal");
      const data = await res.json();

      // Konversi permission ke boolean
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

      // Simpan session
      localStorage.setItem("smart_token", data.token);
      localStorage.setItem("smart_user", JSON.stringify(userData));
      setUser(userData);
      setToken(data.token);

      console.log("✅ Login berhasil untuk:", userData.name);
      return true;
    } catch (err) {
      console.error("❌ Login error:", err);
      return false;
    }
  };

  // Logout
  const logout = useCallback(async () => {
    console.log("🚪 Logout dipanggil");
    try {
      if (token) {
        await fetch("http://localhost:5000/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("❌ Logout error:", err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("smart_user");
      localStorage.removeItem("smart_token");
      router.push("/login");
    }
  }, [token, router]);

  // fetchWithAuth wrapper
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!token) throw new Error("Tidak ada token, harap login");

    // Jika token expired → coba refresh dulu
    if (isTokenExpired(token)) {
      console.warn("⚠️ Token expired, mencoba refresh...");
      await refreshToken();
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    return fetch(url, { ...options, headers });
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
