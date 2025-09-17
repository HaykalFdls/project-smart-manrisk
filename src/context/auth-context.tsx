"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  unit_id: number | null;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Load session dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("smart_user");
    console.log("🔹 useEffect restore user raw:", storedUser);
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        const parsed = JSON.parse(storedUser);
        console.log("Parsed user dari localStorage:", parsed);
        setUser(parsed);
      } catch (err) {
        console.error("Gagal parse user dari localStorage:", err);
        localStorage.removeItem("smart_user");
      }
    } else {
      console.log("Tidak ada user di localStorage");
    }
    setIsReady(true);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login gagal");

      const data = await res.json();
      console.log("Login response:", data);

      // Simpan ke localStorage
      localStorage.setItem("smart_user", JSON.stringify(data));

      setUser(data); // update state user
      console.log("🔹 User state setelah login:", data);
      return true;
    } catch (err) {
      console.error("❌ Login error:", err);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("smart_user");
    console.log("🚪 User logout, redirect ke /login");
    router.push("/login");
  };

  // Debug render
  useEffect(() => {
    console.log("AuthProvider render ulang. State user:", user);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isReady,
        login,
        logout,
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
