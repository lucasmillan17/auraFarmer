"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMatchStore } from "@/stores/matchStore";
import { getRank } from "@/lib/ranks";
import { RankBadge } from "./RankBadge";
import { getSocket } from "@/lib/socket";

export function MatchResult() {
  const { me, rival, winner, roomId, reset } = useMatchStore();
  if (!me || !rival || !winner) return null;

  const isWinner = winner === me.id;
  const winnerPlayer = isWinner ? me : rival;
  const loserPlayer = isWinner ? rival : me;
  const winnerRank = getRank(winnerPlayer.elo);

  const handleReturnToLobby = () => {
    if (roomId) {
      const socket = getSocket();
      socket.emit("webrtc:leave-room", roomId);
    }
    reset();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 15 }}
          className="flex flex-col items-center gap-6 p-8 rounded-3xl glass-strong border border-border max-w-sm w-full mx-4"
        >
          {/* Winner crown */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl"
          >
            {isWinner ? "\uD83D\uDC51" : "\uD83D\uDC94"}
          </motion.div>

          {/* Result text */}
          <div className="text-center">
            <h2
              className={`text-2xl font-bold font-mono tracking-tight ${
                isWinner ? "text-aura aura-glow" : "text-muted"
              }`}
            >
              {isWinner ? "AURA DOMINANT" : "OUT-AURA'D"}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {isWinner
                ? "Your presence was undeniable"
                : "Work on your composure"}
            </p>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-mono font-bold text-aura aura-glow">
                {winnerPlayer.score.toFixed(1)}
              </span>
              <RankBadge rank={winnerPlayer.rank} isActive={true} />
              <span className="text-xs text-muted font-mono">
                {winnerPlayer.nickname}
              </span>
            </div>
            <span className="text-muted text-lg font-mono">vs</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-mono font-bold text-muted">
                {loserPlayer.score.toFixed(1)}
              </span>
              <RankBadge rank={loserPlayer.rank} />
              <span className="text-xs text-muted font-mono">
                {loserPlayer.nickname}
              </span>
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={handleReturnToLobby}
            className="w-full py-3 rounded-2xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-bright transition-all duration-200 font-mono text-sm uppercase tracking-wider"
          >
            Return to Lobby
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
