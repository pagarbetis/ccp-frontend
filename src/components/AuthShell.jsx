import React from "react";
import { motion } from "framer-motion";
import { Play, Video, Sparkles, Mic, Camera, Clapperboard, Film } from "lucide-react";

export default function AuthShell({ children, footer, isDarkMode = false }) {
  const creatorIcons = [
    { Icon: Play, top: "15%", left: "10%", size: 42, delay: 0, duration: 5 },
    { Icon: Video, top: "22%", right: "12%", size: 46, delay: 0.8, duration: 6 },
    { Icon: Sparkles, top: "72%", left: "12%", size: 38, delay: 0.3, duration: 4.5 },
    { Icon: Mic, top: "78%", right: "15%", size: 40, delay: 1.2, duration: 5.5 },
    { Icon: Camera, top: "10%", right: "32%", size: 36, delay: 1.5, duration: 7 },
    { Icon: Clapperboard, top: "65%", left: "25%", size: 44, delay: 1, duration: 6.5 },
    { Icon: Film, top: "85%", left: "45%", size: 38, delay: 0.5, duration: 5 },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center w-full min-h-screen px-4 py-8 overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 🌊 1. Blob Cahaya (Menyesuaikan Mode Terang / Gelap) */}
      <motion.div
        animate={{
          scale: [1, 1.35, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, 80, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ${
          isDarkMode ? 'bg-blue-600/40' : 'bg-slate-300/60'
        }`}
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.35, 0.65, 0.35],
          x: [0, -70, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ${
          isDarkMode ? 'bg-indigo-600/40' : 'bg-gray-300/60'
        }`}
      />

      {/* 🎬 2. Ikon Konten Kreator */}
      {creatorIcons.map(({ Icon, top, left, right, size, delay, duration }, index) => (
        <motion.div
          key={index}
          style={{ position: "absolute", top, left, right }}
          initial={{ y: 0, opacity: 0.4, rotate: 0 }}
          animate={{
            y: [-25, 25, -25],
            rotate: [-15, 15, -15],
            opacity: [0.4, 0.85, 0.4],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay,
          }}
          className={`hidden md:block pointer-events-none ${
            isDarkMode 
              ? 'text-blue-400/60 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
              : 'text-slate-400/70 drop-shadow-[0_0_10px_rgba(148,163,184,0.3)]'
          }`}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      {/* Grid Pattern Studio */}
      <div 
        className={`absolute inset-0 pointer-events-none ${
          isDarkMode 
            ? 'bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]' 
            : 'bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]'
        }`} 
      />

      {/* 📦 3. Container Form */}
      <div className="relative z-10 w-full max-w-md">
        {children}

        {footer && (
          <div className="mt-6 text-xs text-center text-slate-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}