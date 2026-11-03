import {
  Clapperboard,
  LogOut,
  Play,
  Video,
  Sparkles,
  Mic,
  Camera,
  Layers,
  Radio,
  Users,
  Film,
  Flame,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const NAV_ITEMS = [
  {
    to: "/contents",
    label: "Konten",
    icon: Layers,
    roles: ["creator", "editor", "admin"],
  },
  {
    to: "/channels",
    label: "Channel",
    icon: Radio,
    roles: ["creator", "admin"],
  },
  { to: "/users", label: "Pengguna", icon: Users, roles: ["admin"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    const handleThemeChange = () => {
      const saved = localStorage.getItem("theme");
      if (saved) {
        setIsDarkMode(saved === "dark");
      }
    };

    window.addEventListener("storage", handleThemeChange);
    window.addEventListener("themeChange", handleThemeChange);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("storage", handleThemeChange);
      window.removeEventListener("themeChange", handleThemeChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleToggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    window.dispatchEvent(new Event("themeChange"));
  };

  const handleLogout = () => {
    MySwal.fire({
      title: "Apakah Anda yakin ingin keluar?",
      text: "Sesi Anda saat ini akan diakhiri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      background: isDarkMode ? "#0f172a" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#0f172a",
      customClass: {
        popup: "rounded-3xl shadow-2xl border border-slate-700/50",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (logout) await logout();
          toast.success("Berhasil keluar.");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          navigate("/");
        }
      }
    });
  };

  const menu = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  const creatorIcons = [
    { Icon: Play, top: "15%", left: "6%", size: 42, delay: 0, duration: 4.5 },
    {
      Icon: Video,
      top: "25%",
      right: "8%",
      size: 46,
      delay: 0.6,
      duration: 5.5,
    },
    {
      Icon: Sparkles,
      top: "72%",
      left: "10%",
      size: 38,
      delay: 0.2,
      duration: 4,
    },
    { Icon: Mic, top: "82%", right: "12%", size: 40, delay: 1.2, duration: 5 },
    {
      Icon: Camera,
      top: "10%",
      right: "28%",
      size: 36,
      delay: 1.5,
      duration: 6.5,
    },
    {
      Icon: Clapperboard,
      top: "68%",
      left: "18%",
      size: 44,
      delay: 0.8,
      duration: 5.8,
    },
    { Icon: Film, top: "40%", left: "4%", size: 34, delay: 2, duration: 5.2 },
    {
      Icon: Flame,
      top: "30%",
      right: "5%",
      size: 38,
      delay: 0.4,
      duration: 4.6,
    },
  ];

  return (
    <div
      className={`h-screen flex overflow-hidden relative selection:bg-blue-600 selection:text-white transition-colors duration-300 ${
        isDarkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <style>{`
        @keyframes moveGrid {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.25; }
          50% { transform: scale(1.3) translate(40px, -40px); opacity: 0.5; }
        }
        .animated-grid-dark {
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
          animation: moveGrid 10s linear infinite;
        }
        .animated-grid-light {
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px);
          animation: moveGrid 10s linear infinite;
        }
        .ambient-blob-1 { animation: pulseGlow 10s ease-in-out infinite; }
        .ambient-blob-2 { animation: pulseGlow 12s ease-in-out infinite reverse; }
      `}</style>

      <div
        className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none ambient-blob-1 transition-colors ${
          isDarkMode ? "bg-blue-600/20" : "bg-slate-300/50"
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none ambient-blob-2 transition-colors ${
          isDarkMode ? "bg-indigo-600/20" : "bg-gray-300/50"
        }`}
      />

      {creatorIcons.map(
        ({ Icon, top, left, right, size, delay, duration }, index) => (
          <motion.div
            key={index}
            style={{ position: "absolute", top, left, right }}
            initial={{ y: 0, opacity: 0.2, rotate: 0 }}
            animate={{
              y: [-25, 25, -25],
              rotate: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
            className={`pointer-events-none hidden lg:block ${
              isDarkMode
                ? "text-blue-500/30 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                : "text-slate-400/50 drop-shadow-[0_0_15px_rgba(148,163,184,0.3)]"
            }`}
          >
            <Icon size={size} />
          </motion.div>
        ),
      )}

      <div
        className={`absolute inset-0 pointer-events-none ${isDarkMode ? "animated-grid-dark" : "animated-grid-light"}`}
      />
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
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : mobileMenuOpen ? 0 : "-100%",
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 w-68 flex flex-col shrink-0 h-full backdrop-blur-2xl transition-colors duration-300",
          isDarkMode
            ? "border-r border-slate-800/40 bg-slate-900/95 lg:bg-slate-900/50 shadow-[20px_0_50px_rgba(0,0,0,0.6)]"
            : "border-r border-slate-200 bg-white/95 lg:bg-white/70 shadow-[20px_0_50px_rgba(0,0,0,0.05)]",
        )}
      >
        <div
          className={`flex items-center justify-between h-20 px-6 border-b shrink-0 ${
            isDarkMode ? "border-slate-800/30" : "border-slate-200/80"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/contents")}
              className="flex items-center justify-center w-10 h-10 text-white shadow-lg cursor-pointer bg-gradient-to-tr from-blue-600 to-blue-500 rounded-xl shadow-blue-600/30"
            >
              <Clapperboard className="w-5 h-5" />
            </motion.div>
            <div className="flex flex-col">
              <span
                className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Pipeline Konten
              </span>
              <span className="text-[10px] text-blue-500 font-medium tracking-wider uppercase">
                Creator Studio
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className={`lg:hidden cursor-pointer ${isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
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
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold backdrop-blur-md"
                        : isDarkMode
                          ? "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-blue-600 -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 35,
                        }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive
                          ? "text-white"
                          : isDarkMode
                            ? "text-slate-400"
                            : "text-slate-500",
                      )}
                    />
                    <span>{item.label}</span>
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div
          className={`p-4 space-y-3 border-t shrink-0 backdrop-blur-md ${
            isDarkMode
              ? "border-slate-800/30 bg-slate-950/30"
              : "border-slate-200/80 bg-slate-100/50"
          }`}
        >
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex flex-col truncate">
              <span
                className={`text-sm font-medium truncate ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
              >
                {user?.name}
              </span>
              <span className="text-[11px] text-blue-500 capitalize font-medium">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleToggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
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
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`justify-start w-full text-xs font-medium transition-all rounded-xl h-9 cursor-pointer ${
              isDarkMode
                ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                : "text-slate-600 hover:text-red-600 hover:bg-red-50"
            }`}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </motion.aside>
      <div className="z-10 flex flex-col flex-1 h-full min-w-0 overflow-y-auto bg-transparent">
        <header
          className={`flex items-center h-16 px-6 border-b backdrop-blur-md shrink-0 lg:hidden ${
            isDarkMode
              ? "border-slate-800/30 bg-slate-900/40"
              : "border-slate-200 bg-white/70"
          }`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex items-center gap-2 cursor-pointer ${
              isDarkMode
                ? "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
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