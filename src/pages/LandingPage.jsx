import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Kanban,
  Calendar,
  Users,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Play,
  Mic,
  Camera,
  Clapperboard,
  Film,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const handleToggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");

    window.dispatchEvent(new Event("themeChange"));
  };

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
    <div
      className={`relative min-h-screen w-full font-sans antialiased overflow-x-hidden flex flex-col justify-between transition-colors duration-300 ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.35, 1],
            opacity: [0.4, 0.7, 0.4],
            x: [0, 80, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-0 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors ${
            isDarkMode ? "bg-blue-600/30" : "bg-slate-300/60"
          }`}
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.35, 0.65, 0.35],
            x: [0, -70, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors ${
            isDarkMode ? "bg-indigo-600/30" : "bg-gray-300/60"
          }`}
        />

        {creatorIcons.map(
          ({ Icon, top, left, right, size, delay, duration }, index) => (
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
              className={`hidden md:block ${
                isDarkMode
                  ? "text-blue-400/50 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                  : "text-slate-400/70 drop-shadow-[0_0_10px_rgba(148,163,184,0.3)]"
              }`}
            >
              <Icon size={size} />
            </motion.div>
          )
        )}

        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]"
              : "bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]"
          }`}
        />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-40 w-full px-6 pt-6 mx-auto max-w-7xl shrink-0"
      >
        <div
          className={`backdrop-blur-md  rounded-2xl px-6 h-16 flex items-center justify-between shadow-lg transition-colors ${
            isDarkMode
              ? "bg-slate-950/60 border-slate-800/80 text-white"
              : "bg-white/80 border-slate-200 text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="p-2 text-white bg-indigo-600 shadow-lg rounded-xl shadow-indigo-500/30">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-indigo-600">
              CreatorFlow
            </span>
          </div>

          <button
            onClick={handleToggleTheme}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
            title="Ganti Tema"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.header>


      <div className="relative z-10 flex flex-col justify-center flex-1 py-12 my-auto">
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="max-w-4xl px-6 mx-auto mb-12 text-center shrink-0"
        >
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-medium mb-6 shadow-inner ${
              isDarkMode
                ? "bg-indigo-950/80 border-indigo-800/50 text-indigo-300"
                : "bg-indigo-50 border-indigo-200 text-indigo-600"
            }`}
          >
            <span>Platform Manajemen Pipeline Konten Kreator</span>
          </div>

          <h1
            className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Kelola Workflow Video <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              Rapi, Cepat, Tanpa Ribet
            </span>
          </h1>

          <p
            className={`text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Pantau ide, jadwal tayang, proses review tim/editor, sampai analitik
            performa media sosial lu dalam satu aplikasi.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] cursor-pointer text-sm sm:text-base"
            >
              Mulai Sekarang (Daftar)
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className={`w-full sm:w-auto font-semibold px-8 py-3.5 rounded-xl transition-all backdrop-blur-sm cursor-pointer text-sm sm:text-base border ${
                isDarkMode
                  ? "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm"
              }`}
            >
              Masuk ke Akun
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="w-full max-w-5xl px-6 mx-auto shrink-0"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              isDarkMode={isDarkMode}
              icon={<Kanban className="w-6 h-6 text-indigo-500" />}
              title="Kanban Pipeline"
              desc="Kelola status dari Ide, Scripting, Filming, Editing, hingga Ready to Publish."
            />
            <FeatureCard
              isDarkMode={isDarkMode}
              icon={<Calendar className="w-6 h-6 text-purple-500" />}
              title="Content Calendar"
              desc="Atur jadwal tayang konten di YouTube, TikTok, & Instagram biar gak terlewat."
            />
            <FeatureCard
              isDarkMode={isDarkMode}
              icon={<Users className="w-6 h-6 text-pink-500" />}
              title="Multi-Role Review"
              desc="Sistem approval dan feedback langsung antara Creator, Editor, dan Admin."
            />
          </div>
        </motion.section>
      </div>

      <footer className="py-4 text-xs text-center opacity-40">
        © {new Date().getFullYear()} CreatorFlow. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, isDarkMode }) {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all group backdrop-blur-md shadow-lg ${
        isDarkMode
          ? "bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/40 text-slate-100"
          : "bg-white/90 border-slate-200 hover:border-indigo-500/40 text-slate-900 shadow-slate-200/60"
      }`}
    >
      <div
        className={`p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform ${
          isDarkMode ? "bg-slate-800/80" : "bg-slate-100"
        }`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <p
        className={`text-xs sm:text-sm leading-relaxed ${
          isDarkMode ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {desc}
      </p>
    </div>
  );
}