"use client";

import { useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useMatchStore } from "@/stores/matchStore";

export function useMatchmaking() {
  const setPhase = useMatchStore((s) => s.setPhase);

  const joinMatchmaking = useCallback(
    (mode: "face" | "body", elo: number) => {
      const socket = getSocket();
      if (!socket.connected) socket.connect();
      setPhase("matchmaking");
      socket.emit("matchmaking:join", { elo, mode });
    },
    [setPhase]
  );

  const leaveMatchmaking = useCallback(() => {
    const socket = getSocket();
    socket.emit("matchmaking:leave");
    setPhase("lobby");
  }, [setPhase]);

  return { joinMatchmaking, leaveMatchmaking };
}
