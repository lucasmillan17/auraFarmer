"use client";

import { io, Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      console.log("[aura] socket connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[aura] socket connection error:", err.message);
    });
  }
  return socket;
}
