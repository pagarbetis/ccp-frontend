import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ROLES, labelOf } from "@/lib/constants";
import React from "react";

// Khusus admin: mengubah role pengguna.
export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getUsers().then(setUsers).catch((error) => toast.error(error.message));
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Pengguna</h1>
        <p className="mt-1 text-sm text-slate-400">Atur peran setiap akun. Akun sendiri tidak bisa diubah.</p>
      </div>

      <div className="overflow-x-auto border shadow-xl border-slate-800 rounded-xl bg-slate-900/80 backdrop-blur-xl shadow-blue-950/20">
        <table className="w-full min-w-[30rem] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-slate-800/40">
                <td className="px-4 py-3.5 font-medium text-slate-100">{u.name}</td>
                <td className="px-4 py-3.5 text-slate-400">{u.email}</td>
                <td className="px-4 py-3.5">
                  <Select
                    className="h-10 w-36 border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500 disabled:opacity-50"
                    value={u.role}
                    disabled={u.id === me.id}
                    onChange={(e) => changeRole(u, e.target.value)}
                    aria-label={`Role ${u.name}`}
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value} className="bg-slate-900 text-slate-100">{role.label}</option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}