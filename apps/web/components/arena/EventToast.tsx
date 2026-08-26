"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AuraEvent } from "@/lib/scoring/events";

interface EventToastProps {
  events: AuraEvent[];
  className?: string;
}

interface ToastItem {
  id: string;
  label: string;
  emoji: string;
  points: number;
  type: "positive" | "negative";
  timestamp: number;
  x: number;
  y: number;
  rotation: number;
}

const MAX_VISIBLE = 3;
const DISMISS_MS = 2500;

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function EventToast({ events, className }: EventToastProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (events.length === 0) return;

    const newToasts = events.map((e) => ({
      ...e,
      timestamp: Date.now(),
      x: randomBetween(10, 80),
      y: randomBetween(5, 70),
      rotation: randomBetween(-12, 12),
    }));

    setToasts((prev) => {
      const combined = [...newToasts, ...prev];
      return combined.slice(0, MAX_VISIBLE);
    });
  }, [events]);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => now - t.timestamp < DISMISS_MS));
    }, 250);

    return () => clearInterval(timer);
  }, [toasts.length]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none overflow-hidden z-20", className)}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -30 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
            className={cn(
              "absolute flex items-center gap-1.5 rounded-2xl font-mono font-bold tracking-wide",
              "backdrop-blur-md border",
              "px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm",
              toast.type === "positive"
                ? "bg-aura/10 border-aura/30 text-aura-bright shadow-[0_0_12px_oklch(0.78_0.15_85_/_0.2)]"
                : "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_8px_rgba(239,68,68,_0.15)]"
            )}
            style={{
              left: `${toast.x}%`,
              top: `${toast.y}%`,
              transform: `translate(-50%, -50%) rotate(${toast.rotation}deg)`,
            }}
          >
            <span className="text-sm sm:text-base">{toast.emoji}</span>
            <span className="uppercase tracking-wider">{toast.label}</span>
            <span
              className={cn(
                "tabular-nums",
                toast.type === "positive" ? "text-aura" : "text-red-500"
              )}
            >
              {toast.points > 0 ? `+${toast.points}` : toast.points}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
