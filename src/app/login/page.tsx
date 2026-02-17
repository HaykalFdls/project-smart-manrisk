"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Loader2 } from "lucide-react"; // Tambahkan Loader2
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const result = await login(user_id, password);

    if (result.success) {
      // Jika di AuthContext sudah ada router.push, ini hanya sebagai cadangan
      // atau biarkan AuthContext yang bekerja sepenuhnya.
      console.log("Login sukses, mengalihkan...");
    } else {
      setError(result.message || "ID USER atau PASSWORD salah");
    }
  } catch (err) {
    setError("Terjadi kesalahan sistem. Coba lagi nanti.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative p-4 sm:p-8 overflow-hidden"
      style={{ backgroundImage: "url('/images/Sign_bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-7xl items-center justify-around gap-12 lg:gap-24 px-4 sm:px-0">
        {/* Konten Kiri */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center md:items-start text-white text-center md:text-left drop-shadow-lg max-w-sm sm:max-w-md lg:max-w-lg"
        >
          <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer mb-4">
            <Image
              src="/images/logo_bjbs.png"
              alt="Bank BJB Syariah"
              width={480}
              height={150}
              priority
              className="select-none filter drop-shadow-lg"
            />
          </motion.div>
          <h3 className="mt-6 text-3xl font-bold leading-tight tracking-wide text-white">
            SISTEM INFORMASI SMART
          </h3>
          <h4 className="mt-2 text-xl font-medium text-blue-100/90 italic uppercase tracking-widest">
            Divisi Manajemen Risiko
          </h4>
        </motion.div>

        {/* Card Login */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-3xl border border-blue-100 p-8 sm:p-10 w-full max-w-md transform transition-all duration-300 hover:shadow-blue-500/20"
        >
          <h2 className="text-4xl font-extrabold mb-2 text-center text-gray-800 tracking-tight">
            Selamat Datang
          </h2>
          <p className="text-center text-gray-500 mb-10 text-md">
            Silakan masuk untuk akses kontrol risiko
          </p>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-2xl text-sm text-center font-semibold mb-6 shadow-sm"
            >
              ⚠️ {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
              <input
                type="text"
                placeholder="User ID"
                className="w-full rounded-full bg-slate-50 border border-slate-200 py-4 pl-14 pr-5 text-base text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                value={user_id}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-full bg-slate-50 border border-slate-200 py-4 pl-14 pr-5 text-base text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-bold text-lg uppercase tracking-wider"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-sm text-center">
            <span className="text-gray-400 font-medium">Lupa akses? </span>
            <a href="#" className="text-blue-600 hover:text-blue-800 transition font-bold">
              Hubungi Admin IT
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}