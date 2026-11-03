import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ROLES, labelOf } from "@/lib/constants";
import React from "react";

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    api
      .getUsers()
      .then(setUsers)
      .catch((error) => toast.error(error.message));
  }, []);

  async function changeRole(target, role) {
    try {
      const updated = await api.updateUserRole(target.id, role);
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(`${target.name} sekarang ${labelOf(ROLES, role)}`);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div
      className={`max-w-3xl space-y-6 transition-colors duration-300 ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
    >
      <div>
        <h1
          className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Pengguna
        </h1>
        <p
          className={`mt-1 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
        >
          Atur peran setiap akun. Akun sendiri tidak bisa diubah.
        </p>
      </div>

      <div
        className={`relative overflow-hidden border shadow-xl rounded-3xl backdrop-blur-2xl transition-colors duration-300 ${
          isDarkMode
            ? "border-slate-800/80 bg-slate-900/70 shadow-blue-950/25"
            : "border-slate-200/80 bg-white/90 shadow-slate-200/60"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead
              className={`border-b ${
                isDarkMode
                  ? "border-slate-800/80 bg-slate-900/90 text-slate-400"
                  : "border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              <tr>
                <th className="px-4 py-3.5 font-semibold">Nama</th>
                <th className="px-4 py-3.5 font-semibold">Email</th>
                <th className="px-4 py-3.5 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isDarkMode ? "divide-slate-800/60" : "divide-slate-200"}`}
            >
              {users.map((u) => (
                <tr
                  key={u.id}
                  className={`transition-colors ${isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-100/50"}`}
                >
                  <td
                    className={`px-4 py-3.5 font-medium ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                  >
                    {u.name}
                  </td>
                  <td
                    className={`px-4 py-3.5 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {u.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <Select
                      value={u.role}
                      onValueChange={(val) => changeRole(u, val)}
                      disabled={u.id === me.id}
                    >
                      <SelectTrigger
                        className={`h-10 w-36 rounded-xl transition-colors ${
                          isDarkMode
                            ? "border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500 disabled:opacity-50"
                            : "border-slate-300 bg-slate-50 text-slate-900 focus:ring-blue-500 disabled:opacity-50 shadow-sm"
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={`rounded-xl ${isDarkMode ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}
                      >
                        {ROLES.map((role) => (
                          <SelectItem
                            key={role.value}
                            value={role.value}
                            className={
                              isDarkMode
                                ? "focus:bg-slate-800 focus:text-slate-100"
                                : "focus:bg-slate-100 focus:text-slate-900"
                            }
                          >
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
