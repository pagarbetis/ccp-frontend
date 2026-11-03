import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/lib/constants";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, ArrowLeft, Play, Video, Sparkles, Mic, Camera, Clapperboard, Film } from "lucide-react";
import React from "react";

export function RegisterForm({ className, ...props }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "creator",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Otomatis sinkron dengan tema dari localStorage
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

    return () => {
      window.removeEventListener("storage", handleThemeChange);
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  const creatorIcons = [
    { Icon: Play, top: "15%", left: "10%", size: 42, delay: 0, duration: 5 },
    { Icon: Video, top: "22%", right: "12%", size: 46, delay: 0.8, duration: 6 },
    { Icon: Sparkles, top: "72%", left: "12%", size: 38, delay: 0.3, duration: 4.5 },
    { Icon: Mic, top: "78%", right: "15%", size: 40, delay: 1.2, duration: 5.5 },
    { Icon: Camera, top: "10%", right: "32%", size: 36, delay: 1.5, duration: 7 },
    { Icon: Clapperboard, top: "65%", left: "25%", size: 44, delay: 1, duration: 6.5 },
    { Icon: Film, top: "85%", left: "45%", size: 38, delay: 0.5, duration: 5 },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setForm({ ...form, role: value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama!");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register(form);
      toast.success("Akun berhasil dibuat!");
      navigate(form.role === "editor" ? "/contents" : "/channels");
    } catch (error) {
      console.error("Register error:", error);
      setErrors(error.errors || {});
      
      const message = error.message === "Failed to fetch" 
        ? "Gagal terhubung ke server. Tunggu beberapa saat lagi!" 
        : (error.response?.data?.message || error.message || "Gagal membuat akun");

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center w-full min-h-screen px-4 py-8 overflow-y-auto transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Blob */}
      <motion.div
        animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.7, 0.4], x: [0, 80, 0], y: [0, -50, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors ${
          isDarkMode ? 'bg-blue-600/40' : 'bg-slate-300/60'
        }`}
      />
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0.65, 0.35], x: [0, -70, 0], y: [0, 60, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors ${
          isDarkMode ? 'bg-indigo-600/40' : 'bg-gray-300/60'
        }`}
      />

      {/* Animasi Ikon Kreator */}
      {creatorIcons.map(({ Icon, top, left, right, size, delay, duration }, index) => (
        <motion.div
          key={index}
          style={{ position: "absolute", top, left, right }}
          initial={{ y: 0, opacity: 0.4, rotate: 0 }}
          animate={{ y: [-25, 25, -25], rotate: [-15, 15, -15], opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: duration, repeat: Infinity, ease: "easeInOut", delay: delay }}
          className={`hidden md:block pointer-events-none ${
            isDarkMode 
              ? 'text-blue-400/60 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
              : 'text-slate-400/70 drop-shadow-[0_0_10px_rgba(148,163,184,0.3)]'
          }`}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      {/* Grid Pattern */}
      <div className={`absolute inset-0 pointer-events-none ${
        isDarkMode 
          ? 'bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]' 
          : 'bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]'
      }`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn("relative z-10 w-full max-w-md flex flex-col gap-6 my-auto", className)}
        {...props}
      >
        <Card className={`relative overflow-hidden shadow-2xl backdrop-blur-2xl rounded-3xl transition-colors duration-300 ${
          isDarkMode 
            ? "border-slate-800/80 bg-slate-900/70 text-slate-100 shadow-blue-950/25" 
            : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/60"
        }`}>
          {/* Garis Gradient Biru di Atas Card */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />

          {/* Tombol Panah Kembali ke Halaman Utama */}
          <div className="px-6 pt-6 pb-0">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 text-xs font-medium transition-colors group ${
                isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className={`p-1.5 rounded-lg border transition-all ${
                isDarkMode ? "bg-slate-800/60 border-slate-700/50 group-hover:bg-slate-800" : "bg-slate-100 border-slate-200 group-hover:bg-slate-200"
              }`}>
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <CardHeader className={`pt-4 pb-4 mb-2 space-y-2 text-left border-b ${
            isDarkMode ? "border-slate-800/60" : "border-slate-200"
          }`}>
            <CardTitle className={`flex items-center gap-2 text-xl font-bold tracking-tight ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}>
              <UserPlus className="w-5 h-5 text-blue-500" />
              Buat Akun Baru
            </CardTitle>
            <CardDescription className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              Masukkan data diri untuk mendaftar
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-5">
                <div className="grid gap-4">
                  {/* Nama Lengkap */}
                  <div className="grid gap-2 text-left">
                    <Label
                      htmlFor="name"
                      className={`text-xs font-semibold tracking-wider uppercase ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      Nama Lengkap
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nama kamu"
                      value={form.name}
                      onChange={handleChange}
                      className={`h-11 rounded-xl transition-colors ${
                        isDarkMode 
                          ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500" 
                          : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
                      }`}
                      required
                      autoFocus
                    />
                    {errors.name && (
                      <p className="text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="grid gap-2 text-left">
                    <Label
                      htmlFor="email"
                      className={`text-xs font-semibold tracking-wider uppercase ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={form.email}
                      onChange={handleChange}
                      className={`h-11 rounded-xl transition-colors ${
                        isDarkMode 
                          ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500" 
                          : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Role (Shadcn Select) */}
                  <div className="grid gap-2 text-left">
                    <Label
                      htmlFor="role"
                      className={`text-xs font-semibold tracking-wider uppercase ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      Daftar Sebagai
                    </Label>
                    <Select value={form.role} onValueChange={handleRoleChange}>
                      <SelectTrigger className={`h-11 rounded-xl transition-colors ${
                        isDarkMode 
                          ? "border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500" 
                          : "border-slate-300 bg-slate-50 text-slate-900 focus:ring-blue-500"
                      }`}>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent className={isDarkMode ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}>
                        {ROLES.filter((role) => role.value !== "admin").map(
                          (role) => (
                            <SelectItem
                              key={role.value}
                              value={role.value}
                              className={isDarkMode ? "focus:bg-slate-800 focus:text-white" : "focus:bg-slate-100 focus:text-slate-900"}
                            >
                              {role.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-400">{errors.role}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="grid gap-2 text-left">
                    <Label
                      htmlFor="password"
                      className={`text-xs font-semibold tracking-wider uppercase ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        value={form.password}
                        onChange={handleChange}
                        className={`pr-10 h-11 rounded-xl transition-colors ${
                          isDarkMode 
                            ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500" 
                            : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute transition-colors -translate-y-1/2 right-3 top-1/2 focus:outline-none ${
                          isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="grid gap-2 text-left">
                    <Label
                      htmlFor="confirmPassword"
                      className={`text-xs font-semibold tracking-wider uppercase ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      Konfirmasi Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className={`pr-10 h-11 rounded-xl transition-colors ${
                          isDarkMode 
                            ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500" 
                            : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className={`absolute transition-colors -translate-y-1/2 right-3 top-1/2 focus:outline-none ${
                          isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tombol Submit */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full font-medium text-white transition-all bg-blue-600 shadow-xl hover:bg-blue-500 shadow-blue-600/30 h-11 rounded-xl hover:scale-[1.02] cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Membuat akun..." : "Daftar"}
                    </Button>
                  </div>
                </div>

                {/* Link ke Login */}
                <div className={`pt-2 text-sm text-center border-t ${
                  isDarkMode ? "text-slate-400 border-slate-800/60" : "text-slate-600 border-slate-200"
                }`}>
                  Sudah punya akun?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-500 underline hover:text-blue-600 underline-offset-4"
                  >
                    Masuk
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}