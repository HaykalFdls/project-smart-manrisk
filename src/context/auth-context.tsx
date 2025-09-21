"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type Permissions = {
  can_create: boolean;
  can_read: boolean;
  can_view: boolean;
  can_update: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_provision: boolean;
};

type User = {
  id: number;
  user_id: string;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  unit_id: number | null;
  status: string;
  permissions: Permissions;
};


type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (user_id: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchWithAuth: (url: string, option?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type JWTPayload = {
  id: number;
  role_id: number;
  exp: number; // expiry
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // helper cek expired
  const isTokenExpired = (jwt: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(jwt);
      console.log("🔍 Decoded JWT:", decoded);
      if (!decoded.exp) return true;
      const expired = decoded.exp * 1000 < Date.now();
      if (expired) console.warn("⚠️ Token sudah expired");
      return expired;
    } catch (err) {
      console.error("❌ Gagal decode token:", err);
      return true;
    }
  };

  // restore session
  useEffect(() => {
    const storedUser = localStorage.getItem("smart_user");
    const storedToken = localStorage.getItem("smart_token");

    console.log("🔄 Restore session...", { storedUser, storedToken });

    if (storedUser && storedToken) {
      if (storedToken !== "undefined" && storedToken !== "null") {
        if (isTokenExpired(storedToken)) {
          console.warn("⚠️ Token expired, auto logout");
          logout();
        } else {
          console.log("✅ Session restored:", JSON.parse(storedUser));
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      }
    }
    setIsReady(true);
  }, []);

  // login
  const login = async (user_id: string, password: string) => {
    console.log("Login attempt:", { user_id, password });
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }),
      });

      if (!res.ok) throw new Error("Login gagal");

      const data = await res.json();
      // 🚩 Convert permission dari 0/1 ke true/false
      const permissions = Object.fromEntries(
        Object.entries(data.user.permissions).map(([k, v]) => [k, v === 1])
      ) as Permissions;

    const user = { ...data.user, permissions };


      console.log("Login response:", data);

      // simpan ke localStorage
      localStorage.setItem("smart_token", data.token);
      localStorage.setItem("smart_user", JSON.stringify(user));

      setToken(data.token);
      setUser(user);

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // logout
  const logout = () => {
    console.log("Logout dipanggil");
    setUser(null);
    setToken(null);
    localStorage.removeItem("smart_token");
    localStorage.removeItem("smart_user");
    router.push("/login");
  };

  // fetch wrapper
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    console.log("📡 fetchWithAuth dipanggil:", url, options);
    if (!token) throw new Error("Tidak ada token, harap login");
    if (isTokenExpired(token)) {
      console.warn("⚠️ Token expired, auto logout");
      logout();
      throw new Error("Token expired");
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
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
