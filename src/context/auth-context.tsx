"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  user_id: string;
  name: string;
  role: string;
  role_name?: string;
  unit_id?: number;
  role_id?: number;
  unit_name?: string;
  permissions?: {
    can_create?: boolean;
    can_read?: boolean;
    can_view?: boolean;
    can_update?: boolean;
    can_approve?: boolean;
    can_delete?: boolean;
    can_provision?: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (user_id: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setIsReady(true);
      }
    };
    checkSession();
  }, []);

  const login = async (user_id: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message };
      }

      setUser(data.user);
      router.push("/dashboard");
      return { success: true };
    } catch (err) {
      return { success: false, message: "Server tidak terhubung" };
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:5001/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    router.push("/login");
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isReady, 
      isAuthenticated: !!user, 
      login, 
      logout,
      fetchWithAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
