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

// Khusus admin: mengubah role pengguna.
export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);

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
    <div className="max-w-3xl space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Pengguna
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Atur peran setiap akun. Akun sendiri tidak bisa diubah.
        </p>
      </div>

      <div className="relative overflow-hidden border shadow-xl border-slate-800/80 rounded-3xl bg-slate-900/60 backdrop-blur-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead className="border-b border-slate-800/80 bg-slate-900/90 text-slate-400">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Nama</th>
                <th className="px-4 py-3.5 font-semibold">Email</th>
                <th className="px-4 py-3.5 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3.5 font-medium text-slate-100">
                    {u.name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <Select
                      value={u.role}
                      onValueChange={(val) => changeRole(u, val)}
                      disabled={u.id === me.id}
                    >
                      <SelectTrigger className="h-10 w-36 border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500 disabled:opacity-50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-800 bg-slate-900 text-slate-100 rounded-xl">
                        {ROLES.map((role) => (
                          <SelectItem
                            key={role.value}
                            value={role.value}
                            className="focus:bg-slate-800 focus:text-slate-100"
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
