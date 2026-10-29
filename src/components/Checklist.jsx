import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-base font-semibold text-white">Checklist produksi</CardTitle>
          {items.length > 0 && (
            <span className="text-xs font-medium text-slate-400">
              {doneCount} dari {items.length} selesai
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-y divide-slate-800/80 border-y border-slate-800">
          {items.length === 0 && (
            <li className="py-4 text-sm text-center text-slate-500">
              Belum ada tugas. Contoh: "B-roll direkam", "Thumbnail disetujui".
            </li>
          )}
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <input
                type="checkbox"
                id={`task-${item.id}`}
                checked={item.isDone}
                onChange={() => handleToggle(item.id)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-700 bg-slate-950 focus:ring-blue-500 accent-blue-600"
              />
              <label
                htmlFor={`task-${item.id}`}
                className={cn("flex-1 text-sm text-slate-200 cursor-pointer select-none", item.isDone && "text-slate-500 line-through")}
              >
                {item.task}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(item.id)}
                aria-label={`Hapus tugas ${item.task}`}
                className="w-8 h-8 transition-colors text-slate-400 hover:text-red-400 hover:bg-slate-800/60"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)} 
            placeholder="Tugas baru..." 
            className="h-10 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
          />
          <Button 
            type="submit" 
            variant="outline"
            className="h-10 px-4 border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            Tambah
          </Button>
        </form>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </CardContent>
    </Card>
  );
}