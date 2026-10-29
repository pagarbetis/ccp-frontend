import React from "react";
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

// Tombol "Hapus konten" + jendela konfirmasi.
// Penghapusan sungguhan dikerjakan `onConfirm` dari halaman pemanggil.
export default function DeleteContentDialog({ content, onConfirm }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="font-medium text-red-400 transition-colors hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Hapus konten
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="shadow-2xl border-slate-800 bg-slate-900/95 backdrop-blur-xl text-slate-100 shadow-blue-950/40">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-white">
            Hapus &quot;{content.title}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {content.checklists?.length || 0} checklist, {content.metrics?.length || 0}{" "}
            catatan metrik, dan riwayat review ikut terhapus. Tindakan ini tidak
            bisa dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={buttonVariants({ variant: "destructive" }) + " bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"}
          >
            Ya, hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}