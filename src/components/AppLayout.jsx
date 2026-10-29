import { Clapperboard, LogOut, Play, Video, Sparkles, Mic, Camera, Layers, Radio, Users, Film, Flame, Menu, X } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

const NAV_ITEMS = [
  { to: "/contents", label: "Konten", icon: Layers, roles: ["creator", "editor", "admin"] },
  { to: "/channels", label: "Channel", icon: Radio, roles: ["creator", "admin"] },
  { to: "/users", label: "Pengguna", icon: Users, roles: ["admin"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menu = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  const creatorIcons = [
    { Icon: Play, top: "15%", left: "6%", size: 42, delay: 0, duration: 4.5 },
    { Icon: Video, top: "25%", right: "8%", size: 46, delay: 0.6, duration: 5.5 },
    { Icon: Sparkles, top: "72%", left: "10%", size: 38, delay: 0.2, duration: 4 },
    { Icon: Mic, top: "82%", right: "12%", size: 40, delay: 1.2, duration: 5 },
    { Icon: Camera, top: "10%", right: "28%", size: 36, delay: 1.5, duration: 6.5 },
    { Icon: Clapperboard, top: "68%", left: "18%", size: 44, delay: 0.8, duration: 5.8 },
    { Icon: Film, top: "40%", left: "4%", size: 34, delay: 2, duration: 5.2 },
    { Icon: Flame, top: "30%", right: "5%", size: 38, delay: 0.4, duration: 4.6 },
  ];

  return (
    <div className="h-screen bg-[#030712] text-slate-100 flex overflow-hidden relative selection:bg-blue-600 selection:text-white">
      <style>{`
        @keyframes moveGrid {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.25; }
          50% { transform: scale(1.3) translate(40px, -40px); opacity: 0.5; }
        }
        .animated-grid {
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
          animation: moveGrid 10s linear infinite;
        }
        .ambient-blob-1 { animation: pulseGlow 10s ease-in-out infinite; }
        .ambient-blob-2 { animation: pulseGlow 12s ease-in-out infinite reverse; }
      `}</style>

      {/* Smooth Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none ambient-blob-1" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none ambient-blob-2" />

      {creatorIcons.map(({ Icon, top, left, right, size, delay, duration }, index) => (
        <motion.div
          key={index}
          style={{ position: "absolute", top, left, right }}
          initial={{ y: 0, opacity: 0.2, rotate: 0 }}
          animate={{
            y: [-25, 25, -25],
            rotate: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
          className="text-blue-500/30 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] pointer-events-none hidden lg:block"
        >
          <Icon size={size} />
        </motion.div>
      ))}

      {/* Grid Bergerak */}
      <div className="absolute inset-0 pointer-events-none animated-grid" />

      {/* 📱 MOBILE SIDEBAR BACKDROP */}
      <AnimatePresence>
        {mobileMenuOpen && !isDesktop && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 🗂 SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isDesktop ? 0 : (mobileMenuOpen ? 0 : "-100%") 
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 w-68 flex flex-col shrink-0 h-full",
          "border-r border-slate-800/40 bg-slate-900/95 lg:bg-slate-900/50 backdrop-blur-2xl",
          "shadow-[20px_0_50px_rgba(0,0,0,0.6)]"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/30 shrink-0">
          <div className="flex items-center gap-3.5">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 text-white shadow-lg cursor-pointer bg-gradient-to-tr from-blue-600 to-blue-500 rounded-xl shadow-blue-600/30"
            >
              <Clapperboard className="w-5 h-5" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">Pipeline Konten</span>
              <span className="text-[10px] text-blue-400/80 font-medium tracking-wider uppercase">Creator Studio</span>
            </div>
          </div>
          {/* Tombol Close khusus Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="relative block outline-none"
              >
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                      isActive
                        ? "bg-blue-600/90 text-white shadow-lg shadow-blue-600/25 font-semibold backdrop-blur-md"
                        : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-blue-600 -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-slate-400")} />
                    <span>{item.label}</span>
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout (Bottom) */}
        <div className="p-4 space-y-3 border-t border-slate-800/30 shrink-0 bg-slate-950/30 backdrop-blur-md">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate text-slate-200">{user?.name}</span>
              <span className="text-[11px] text-blue-400/80 capitalize font-medium">{user?.role}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="justify-start w-full text-xs font-medium transition-all text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl h-9"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </motion.aside>

      {/* 💻 MAIN CONTENT AREA (BG TRANSPARAN BIAR ANIMASI KELIATAN) */}
      <div className="z-10 flex flex-col flex-1 h-full min-w-0 overflow-y-auto bg-transparent">
        {/* Mobile Header Bar */}
        <header className="flex items-center h-16 px-6 border-b border-slate-800/30 bg-slate-900/40 backdrop-blur-md shrink-0 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </Button>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full p-4 mx-auto sm:p-8 max-w-7xl"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}