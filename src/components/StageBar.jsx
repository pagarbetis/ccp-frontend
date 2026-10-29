import { STAGES, labelOf } from "@/lib/constants";
import React from "react";

const BAR_STAGES = STAGES.filter((stage) => stage.value !== "revision");

export default function StageBar({ status }) {
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
                index <= currentIndex ? stage.color : "rgb(30 41 59)",
            }}
          />
        ))}
      </div>
      <span
        className={
          status === "revision"
            ? "text-sm font-medium text-amber-400"
            : "text-sm text-slate-300 font-medium"
        }
      >
        {labelOf(STAGES, status)}
      </span>
    </div>
  );
}
