import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";

export default function Field({ label, error, hint, children, className }) {
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
    <div className="space-y-1.5">
      <Label className={`text-sm font-semibold transition-colors ${
        isDarkMode ? "text-slate-200" : "text-slate-900"
      } ${className || ""}`}>
        {label}
      </Label>
      {children}
      {hint && !error && <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{hint}</p>}
      {error && <p className="text-sm font-medium text-red-400">{error}</p>}
    </div>
  );
}