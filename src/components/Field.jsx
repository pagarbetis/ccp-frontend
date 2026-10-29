import { Label } from "@/components/ui/label";
import React from "react";

// Label + input + pesan error dari server, dibungkus jadi satu.
export default function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-200">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-sm font-medium text-red-400">{error}</p>}
    </div>
  );
}