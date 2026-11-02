import { useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import React from "react";

export function LoginForm({ className, ...props }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form);
      toast.success("Login berhasil!");
      navigate("/contents");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Login gagal!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Card className="relative overflow-hidden shadow-2xl border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl text-slate-100 rounded-3xl shadow-blue-950/20">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
        <CardHeader className="pt-6 pb-4 mb-2 space-y-2 text-left border-b border-slate-800/60">
          <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <LogIn className="w-5 h-5 text-blue-400" />
            Login
          </CardTitle>
          <CardDescription className="text-slate-400">
            Masuk ke akun kamu untuk mengelola konten
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5">
              <div className="grid gap-4">
                <div className="grid gap-2 text-left">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold tracking-wider uppercase text-slate-300"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500 h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="grid gap-2 text-left">
                  <Label
                    htmlFor="password"
                    className="text-xs font-semibold tracking-wider uppercase text-slate-300"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className="pr-10 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500 h-11 rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full font-medium text-white transition-all bg-blue-600 shadow-xl hover:bg-blue-500 shadow-blue-600/30 h-11 rounded-xl hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {loading ? "Memeriksa..." : "Masuk"}
                  </Button>
                </div>
              </div>

              <div className="pt-2 text-sm text-center border-t text-slate-400 border-slate-800/60">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-400 underline hover:text-blue-300 underline-offset-4"
                >
                  Daftar
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
