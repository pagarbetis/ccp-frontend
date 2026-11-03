import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

export default function DeleteContentDialog({ content, onConfirm }) {
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

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="font-medium text-red-400 transition-colors cursor-pointer hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Hapus konten
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent
        className={`shadow-2xl backdrop-blur-xl rounded-3xl transition-colors duration-300 ${
          isDarkMode
            ? "border-slate-800 bg-slate-900/95 text-slate-100 shadow-blue-950/40"
            : "border-slate-200 bg-white/95 text-slate-900 shadow-slate-200/80"
        }`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Hapus &quot;{content.title}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription
            className={isDarkMode ? "text-slate-400" : "text-slate-600"}
          >
            {content.checklists?.length || 0} checklist,{" "}
            {content.metrics?.length || 0} catatan metrik, dan riwayat review
            ikut terhapus. Tindakan ini tidak bisa dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel
            className={`rounded-xl cursor-pointer ${
              isDarkMode
                ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              buttonVariants({ variant: "destructive" }) +
              " bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 rounded-xl cursor-pointer"
            }
          >
            Ya, hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
