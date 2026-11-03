import { STAGES, labelOf } from "@/lib/constants";
import React, { useState, useEffect } from "react";

const BAR_STAGES = STAGES.filter((stage) => stage.value !== "revision");

export default function StageBar({ status }) {
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

  const progressStatus = status === "revision" ? "editing" : status;
  const currentIndex = BAR_STAGES.findIndex(
    (stage) => stage.value === progressStatus,
  );

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-1" aria-hidden="true">
        {BAR_STAGES.map((stage, index) => (
          <span
            key={stage.value}
            className="h-2 w-4 rounded-[2px] transition-colors"
            style={{
              backgroundColor:
                index <= currentIndex
                  ? stage.color
                  : isDarkMode
                    ? "rgb(30 41 59)"
                    : "rgb(203 213 225)",
            }}
          />
        ))}
      </div>
      <span
        className={
          status === "revision"
            ? "text-sm font-medium text-amber-500"
            : isDarkMode
              ? "text-sm text-slate-300 font-medium"
              : "text-sm text-slate-700 font-medium"
        }
      >
        {labelOf(STAGES, status)}
      </span>
    </div>
  );
}