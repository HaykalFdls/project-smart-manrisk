"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-white"
    >
      {/* Logo / Judul Sistem */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <h1 className="text-2xl font-bold tracking-widest text-accent">
          SMART-RISK
        </h1>
        <p className="text-sm text-gray-300">Loading, please wait...</p>
      </motion.div>

      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        className="mt-8"
      >
        <Loader2 className="h-10 w-10 text-accent" />
      </motion.div>
    </motion.div>
  );
}
