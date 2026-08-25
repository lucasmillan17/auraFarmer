import type { Server, Socket } from "socket.io";
import type { MatchmakingEntry } from "../types/index.js";

const queue: MatchmakingEntry[] = [];
const ELO_RANGE_INITIAL = 200;
const ELO_RANGE_EXPAND_RATE = 50; // per second in queue
const MAX_ELO_RANGE = 600;

export function setupMatchmaking(io: Server) {
  setInterval(() => tryMatch(io), 1000);
}

function tryMatch(io: Server) {
  if (queue.length < 2) return;

  const now = Date.now();
  console.log(`[matchmaking] queue size: ${queue.length}`);

  // Sort by join time (oldest first)
  queue.sort((a, b) => a.joinedAt - b.joinedAt);

  const matched: string[] = [];

  for (let i = 0; i < queue.length; i++) {
    if (matched.includes(queue[i].userId)) continue;

    const a = queue[i];
    const waitTimeA = (now - a.joinedAt) / 1000;
    const rangeA = Math.min(
      ELO_RANGE_INITIAL + waitTimeA * ELO_RANGE_EXPAND_RATE,
      MAX_ELO_RANGE
    );

    for (let j = i + 1; j < queue.length; j++) {
      if (matched.includes(queue[j].userId)) continue;

      const b = queue[j];
      const eloDiff = Math.abs(a.elo - b.elo);

      // Match if elo difference is within range of BOTH players
      const waitTimeB = (now - b.joinedAt) / 1000;
      const rangeB = Math.min(
        ELO_RANGE_INITIAL + waitTimeB * ELO_RANGE_EXPAND_RATE,
        MAX_ELO_RANGE
      );

      if (eloDiff <= rangeA && eloDiff <= rangeB && a.mode === b.mode) {
        matched.push(a.userId, b.userId);
        emitMatchFound(io, a, b);
        break;
      }
    }
  }

  // Remove matched players from queue
  for (const userId of matched) {
    const idx = queue.findIndex((e) => e.userId === userId);
    if (idx !== -1) queue.splice(idx, 1);
  }
}

function emitMatchFound(io: Server, a: MatchmakingEntry, b: MatchmakingEntry) {
  const roomId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  console.log(`[matchmaking] MATCHED: ${a.userId} vs ${b.userId} in ${roomId}`);

  io.to(a.socketId).emit("matchmaking:found", {
    roomId,
    opponent: { userId: b.userId, elo: b.elo },
    you: "player1",
  });

  io.to(b.socketId).emit("matchmaking:found", {
    roomId,
    opponent: { userId: a.userId, elo: a.elo },
    you: "player2",
  });
}

export function joinQueue(entry: MatchmakingEntry) {
  // Remove if already in queue
  const existing = queue.findIndex((e) => e.userId === entry.userId);
  if (existing !== -1) queue.splice(existing, 1);
  queue.push(entry);
}

export function leaveQueue(userId: string) {
  const idx = queue.findIndex((e) => e.userId === userId);
  if (idx !== -1) queue.splice(idx, 1);
}
