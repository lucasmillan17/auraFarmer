"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TimerProps {
  timeLeft: number;
  duration: number;
  className?: string;
}

export function Timer({ timeLeft, duration, className }: TimerProps) {
  const isLow = timeLeft <= 3;
  const progress = (timeLeft / duration) * 100;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {/* Timer ring */}
      <div className="relative w-16 h-16">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 36 36"
        >
          {/* Background ring */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="2"
          />
          {/* Progress ring */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke={isLow ? "#EF4444" : "var(--color-aura)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progress} 100`}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: isLow ? "drop-shadow(0 0 4px #EF4444)" : undefined,
            }}
          />
        </svg>
        {/* Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-xl font-mono font-bold tabular-nums",
              isLow ? "text-red-500" : "text-text-bright"
            )}
          >
            {timeLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
