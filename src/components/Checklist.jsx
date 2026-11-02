import { Trash2, CheckSquare } from "lucide-react";
import { useState } from "react";
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
    <Card className="relative overflow-hidden shadow-xl border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl text-slate-100 rounded-3xl">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
      <CardHeader className="pb-4 mb-4 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            Checklist produksi
          </CardTitle>
          {items.length > 0 && (
            <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
              {doneCount} dari {items.length} selesai
            </span>
          )}
        </div>
        <CardDescription className="text-slate-400">
          Pantau dan kelola tugas persiapan produksi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="px-4 overflow-hidden border divide-y shadow-inner divide-slate-800/60 rounded-2xl border-slate-800/80 bg-slate-950/50">
          {items.length === 0 && (
            <li className="py-8 text-sm italic text-center text-slate-500">
              Belum ada tugas. Contoh: "B-roll direkam", "Thumbnail disetujui".
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
                className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-700 bg-slate-950 focus:ring-blue-500 accent-blue-600"
              />
              <label
                htmlFor={`task-${item.id}`}
                className={cn(
                  "flex-1 text-sm text-slate-200 cursor-pointer select-none",
                  item.isDone && "text-slate-500 line-through",
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
                className="w-8 h-8 transition-colors text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-xl"
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
            className="flex-1 h-11 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500 rounded-xl"
          />
          <Button
            type="submit"
            className="h-11 px-6 font-medium text-white bg-blue-600 shadow-xl hover:bg-blue-500 shadow-blue-600/30 rounded-xl transition-all hover:scale-[1.02]"
          >
            Tambah
          </Button>
        </form>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </CardContent>
    </Card>
  );
}
