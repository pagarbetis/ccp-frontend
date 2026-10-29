import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"

export function RegisterForm({ className, ...props }) {
  const { register } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama!")
      return
    }

    setLoading(true)

    try {
      await register(form)
      toast.success("Registrasi berhasil!")
      navigate("/contents")
    } catch (error) {
      console.error("Register error:", error)
      toast.error(error.response?.data?.message || error.message || "Registrasi gagal!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("flex flex-col gap-6", className)} 
      {...props}
    >
      <Card className="shadow-2xl border-slate-800/80 bg-slate-900/90 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
        <CardHeader className="pb-4 space-y-2 text-left">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Buat Akun Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5">
              <div className="grid gap-4">
                <div className="grid gap-2 text-left">
                  <Label htmlFor="name" className="text-xs font-semibold tracking-wider uppercase text-slate-300">Nama Lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nama kamu"
                    value={form.name}
                    onChange={handleChange}
                    className="border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500 h-11"
                    required
                  />
                </div>

                <div className="grid gap-2 text-left">
                  <Label htmlFor="email" className="text-xs font-semibold tracking-wider uppercase text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500 h-11"
                    required
                  />
                </div>

                <div className="grid gap-2 text-left">
                  <Label htmlFor="password" className="text-xs font-semibold tracking-wider uppercase text-slate-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className="pr-10 border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 text-left">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold tracking-wider uppercase text-slate-300">Konfirmasi Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="pr-10 border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-2 font-medium text-white transition-all bg-blue-600 shadow-lg hover:bg-blue-500 shadow-blue-600/25 h-11" 
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Daftar"}
                </Button>
              </div>

              <div className="pt-2 text-sm text-center text-slate-400">
                Sudah punya akun?{" "}
                <Link to="/login" className="font-semibold text-blue-400 underline hover:text-blue-300 underline-offset-4">
                  Masuk
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
    </motion.div>
  )
}