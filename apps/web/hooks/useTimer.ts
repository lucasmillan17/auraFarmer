"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: (seconds: number) => void;
  stop: () => void;
  reset: (seconds?: number) => void;
}

export function useTimer(onComplete?: () => void): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      durationRef.current = seconds;
      setTimeLeft(seconds);
      setIsRunning(true);

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer, onComplete]
  );

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(
    (seconds?: number) => {
      clearTimer();
      setTimeLeft(seconds ?? durationRef.current);
      setIsRunning(false);
    },
    [clearTimer]
  );

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { timeLeft, isRunning, start, stop, reset };
}
