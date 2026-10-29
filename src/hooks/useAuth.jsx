import { createContext, useContext, useState } from "react";
import { api, TOKEN_KEY } from "@/lib/api";

const USER_KEY = "ccp_user";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1. Amankan parsing dari localStorage biar gak crash kalau ada "undefined"
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved || saved === "undefined" || saved === "null") return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  // 2. Sesuaikan destructuring dengan response backend asli ({ token, data })
  function saveSession(response) {
    // Ambil token dan data user (backend ngirim 'data', bukan 'user')
    const token = response?.token;
    const userData = response?.data || response?.user; // fallback jika ada beda response

    if (token) localStorage.setItem(TOKEN_KEY, token);
    
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  }

  async function login(credentials) {
    const res = await api.login(credentials);
    saveSession(res);
  }

  async function register(data) {
    const res = await api.register(data);
    saveSession(res);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}