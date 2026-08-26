"use client";

import { useEffect, useState } from "react";
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
  points: number;
  type: "positive" | "negative";
  timestamp: number;
}

const MAX_VISIBLE = 4;

export function EventToast({ events, className }: EventToastProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (events.length === 0) return;

    const newToasts = events.map((e) => ({
      ...e,
      timestamp: Date.now(),
    }));

    setToasts((prev) => {
      const combined = [...newToasts, ...prev];
      return combined.slice(0, MAX_VISIBLE);
    });
  }, [events]);

  // Auto-dismiss after 2s
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => now - t.timestamp < 2000));
    }, 200);

    return () => clearInterval(timer);
  }, [toasts.length]);

  return (
    <div className={cn("flex flex-col-reverse gap-2 pointer-events-none", className)}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-2xl font-mono text-sm font-bold tracking-wide",
              "backdrop-blur-md border",
              toast.type === "positive"
                ? "bg-aura/10 border-aura/30 text-aura-bright shadow-[0_0_12px_oklch(0.78_0.15_85_/_0.2)]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            )}
          >
            <span className="text-xs">
              {toast.type === "positive" ? "⚡" : "💀"}
            </span>
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
