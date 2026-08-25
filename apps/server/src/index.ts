import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "./config/index.js";
import { setupSignaling } from "./sockets/signaling.js";
import { setupMatchmaking, joinQueue, leaveQueue } from "./sockets/matchmaking.js";
import leaderboardRoutes from "./routes/leaderboard.js";

const app = express();
const server = createServer(app);

const allowedOrigins = (config.corsOrigin || "").split(",").map((s) => s.trim());

function isOriginAllowed(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  if (/^https?:\/\/(localhost|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)) return callback(null, true);
  callback(new Error("CORS blocked"));
}

const io = new Server(server, {
  cors: {
    origin: isOriginAllowed,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: isOriginAllowed }));
app.use(express.json());

// Routes
app.use("/api", leaderboardRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Socket.io
setupSignaling(io);
setupMatchmaking(io);

io.on("connection", (socket) => {
  console.log(`[ws] connected: ${socket.id}`);

  socket.on("matchmaking:join", (data: { elo: number; mode: "face" | "body" }) => {
    joinQueue({
      userId: socket.id,
      socketId: socket.id,
      elo: data.elo,
      mode: data.mode,
      joinedAt: Date.now(),
    });
    console.log(`[matchmaking] joined: ${socket.id} (${data.mode})`);
  });

  socket.on("matchmaking:leave", () => {
    leaveQueue(socket.id);
  });

  socket.on("score:submit", (data: { matchId: string; player1Score: number; player2Score: number }) => {
    console.log(`[score] match=${data.matchId} p1=${data.player1Score} p2=${data.player2Score}`);
  });

  socket.on("score:update", (data: { playerId: string; score: number }) => {
    socket.broadcast.emit("score:update", data);
  });

  socket.on("disconnect", () => {
    leaveQueue(socket.id);
    console.log(`[ws] disconnected: ${socket.id}`);
  });
});

// Start
server.listen(config.port, () => {
  console.log(`[aura-arena] server running on :${config.port}`);
});
