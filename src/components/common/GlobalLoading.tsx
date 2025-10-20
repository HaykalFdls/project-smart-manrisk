"use client";

import Image from "next/image";
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
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3 flex flex-col items-center"
      >
        {/* Gunakan Image dari next/image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src="/images/logo_bjbs.png"
            alt="SMART-RISK Logo"
            width={300}
            height={200}
            className="mb-4 drop-shadow-lg"
          />
        </motion.div>

        <h1 className="text-2xl font-bold tracking-widest text-accent">
          SMART SYSTEM INFORMATION
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
