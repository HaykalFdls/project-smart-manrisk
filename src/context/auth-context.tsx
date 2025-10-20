"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User, UserPermissions } from "@/types/user";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (user_id: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Ambil session aktif (user) dari server via cookie
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/me", {
        method: "GET",
        credentials: "include", // kirim cookie ke server
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      const p = data.permissions || {};
      const permissions: UserPermissions = {
        can_create: !!p.can_create,
        can_read: !!p.can_read,
        can_view: !!p.can_view,
        can_update: !!p.can_update,
        can_approve: !!p.can_approve,
        can_delete: !!p.can_delete,
        can_provision: !!p.can_provision,
      };

      setUser({ ...data, permissions });
    } catch (err) {
      console.error("❌ Gagal ambil sesi user:", err);
      setUser(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // 🔹 Login → server akan set cookie HTTP-only
  const login = async (user_id: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // penting untuk menyimpan cookie
        body: JSON.stringify({ user_id, password }),
      });

      if (!res.ok) throw new Error("Login gagal");

      // Server seharusnya langsung set cookie + return user
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

      setUser({ ...data.user, permissions });
      console.log("✅ Login berhasil untuk:", data.user.name);
      return true;
    } catch (err) {
      console.error("❌ Login error:", err);
      return false;
    }
  };

  // Logout → server hapus cookie
  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  // fetchWithAuth → semua request pakai cookie otomatis
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
