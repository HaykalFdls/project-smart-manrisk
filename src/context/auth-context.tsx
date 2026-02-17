"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const login = async (user_id: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5001/api/login", {
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

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
