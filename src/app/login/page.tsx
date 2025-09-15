"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Image from "next/image"; // pakai next/image biar optimal

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch {
      setError("Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/Signin-Background.jpeg')" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-96 border border-gray-200"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo_png.png"
            alt="SMART Logo"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Judul */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-red-700">
          LOGIN SMART
        </h2>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mb-4 text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        {/* Extra Links */}
        <div className="mt-5 text-sm text-center text-gray-500">
          <p>
            Belum punya akun?{" "}
            <a href="/register" className="text-red-600 hover:underline">
              Daftar
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
