import { Trash2, CheckSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import React from "react";

export default function Checklist({ contentId, items = [], onChange }) {
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState("");

  // Ambil state tema dari localStorage dan pasang listener real-time
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

  const doneCount = items.filter((item) => item.isDone).length;

  async function handleAdd(event) {
    event.preventDefault();
    setError("");

    if (!newTask.trim()) return;

    try {
      const item = await api.addChecklist(contentId, { task: newTask });
      onChange([...items, item]);
      setNewTask("");
    } catch (err) {
      setError(err.errors?.task || err.message);
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await api.toggleChecklist(id);
      onChange(items.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteChecklist(id);
      onChange(items.filter((item) => item.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <Card
      className={`relative overflow-hidden shadow-xl backdrop-blur-2xl rounded-3xl transition-colors duration-300 ${
        isDarkMode
          ? "border-slate-800/80 bg-slate-900/70 text-slate-100 shadow-blue-950/25"
          : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/60"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />

      <CardHeader
        className={`pb-4 mb-4 border-b ${
          isDarkMode ? "border-slate-800/60" : "border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <CardTitle
            className={`flex items-center gap-2 text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            <CheckSquare className="w-5 h-5 text-blue-500" />
            Checklist produksi
          </CardTitle>
          {items.length > 0 && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isDarkMode
                  ? "text-slate-300 bg-slate-800/80 border-slate-700/60"
                  : "text-slate-700 bg-slate-100 border-slate-200"
              }`}
            >
              {doneCount} dari {items.length} selesai
            </span>
          )}
        </div>
        <CardDescription
          className={isDarkMode ? "text-slate-400" : "text-slate-600"}
        >
          Pantau dan kelola tugas persiapan produksi
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <ul
          className={`px-4 overflow-hidden border divide-y shadow-inner rounded-2xl ${
            isDarkMode
              ? "border-slate-800/80 divide-slate-800/60 bg-slate-950/50"
              : "border-slate-200 divide-slate-200 bg-slate-50/50"
          }`}
        >
          {items.length === 0 && (
            <li
              className={`py-8 text-sm italic text-center ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Belum ada tugas.
            </li>
          )}
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 py-3 first:pt-4 last:pb-4"
            >
              <input
                type="checkbox"
                id={`task-${item.id}`}
                checked={item.isDone}
                onChange={() => handleToggle(item.id)}
                className={`w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600 ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-950 focus:ring-blue-500"
                    : "border-slate-300 bg-white focus:ring-blue-500"
                }`}
              />
              <label
                htmlFor={`task-${item.id}`}
                className={cn(
                  "flex-1 text-sm cursor-pointer select-none",
                  isDarkMode ? "text-slate-200" : "text-slate-800",
                  item.isDone &&
                    (isDarkMode
                      ? "text-slate-500 line-through"
                      : "text-slate-400 line-through"),
                )}
              >
                {item.task}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(item.id)}
                aria-label={`Hapus tugas ${item.task}`}
                className={`w-8 h-8 transition-colors rounded-xl cursor-pointer ${
                  isDarkMode
                    ? "text-slate-400 hover:text-red-400 hover:bg-slate-800/60"
                    : "text-slate-500 hover:text-red-600 hover:bg-slate-200"
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAdd} className="flex gap-3">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Tugas baru..."
            className={`flex-1 h-11 rounded-xl transition-colors ${
              isDarkMode
                ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
                : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
            }`}
          />
          <Button
            type="submit"
            className="h-11 px-6 font-medium text-white bg-blue-600 shadow-xl hover:bg-blue-500 shadow-blue-600/30 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            Tambah
          </Button>
        </form>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </CardContent>
    </Card>
  );
}
