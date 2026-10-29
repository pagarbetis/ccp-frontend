import { LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
// import { ROLES, labelOf } from "@/lib/constants";
import { cn } from "@/lib/utils";
import React from "react";

// Menu hanya tampil untuk peran yang diizinkan.
const NAV_ITEMS = [
  { to: "/contents", label: "Konten", roles: ["creator", "editor", "admin"] },
  { to: "/channels", label: "Channel", roles: ["creator", "admin"] },
  { to: "/users", label: "Pengguna", roles: ["admin"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const menu = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="flex items-center max-w-6xl gap-6 px-4 mx-auto h-14">
          <span className="font-bold">Pipeline Konten</span>

          <nav className="flex gap-1">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn("rounded px-3 py-1.5 text-sm hover:bg-muted", isActive && "bg-muted font-medium")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            {/* Nama & Role */}
            <div className="hidden text-sm sm:flex sm:items-center sm:gap-2">
              <span className="font-medium">{user?.name}</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                {user?.role}
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl px-4 py-8 mx-auto">
        <Outlet />
      </main>
    </div>
  );
}