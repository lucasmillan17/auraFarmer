"use client";

import { Navbar } from "@/components/shared/Navbar";
import { GlassCard } from "@/components/shared/GlassCard";

const MOCK_LEADERBOARD = [
  { rank: 1, nickname: "SigmaLord", elo: 1850, games: 142, winRate: "78%", country: "US" },
  { rank: 2, nickname: "AuraKing", elo: 1790, games: 98, winRate: "72%", country: "KR" },
  { rank: 3, nickname: "FaceGod", elo: 1720, games: 210, winRate: "69%", country: "JP" },
  { rank: 4, nickname: "ChadOnly", elo: 1680, games: 87, winRate: "65%", country: "BR" },
  { rank: 5, nickname: "Composure", elo: 1650, games: 155, winRate: "68%", country: "DE" },
  { rank: 6, nickname: "GazeMaster", elo: 1580, games: 200, winRate: "63%", country: "MX" },
  { rank: 7, nickname: "HeadStill", elo: 1520, games: 75, winRate: "61%", country: "ES" },
  { rank: 8, nickname: "AuraFarm", elo: 1490, games: 130, winRate: "59%", country: "FR" },
  { rank: 9, nickname: "Mogger", elo: 1450, games: 90, winRate: "57%", country: "GB" },
  { rank: 10, nickname: "Presence", elo: 1420, games: 110, winRate: "55%", country: "AR" },
];

const FLAG_MAP: Record<string, string> = {
  US: "\uD83C\uDDFA\uD83C\uDDF8", KR: "\uD83C\uDDF0\uD83C\uDDF7",
  JP: "\uD83C\uDDEF\uD83C\uDDF5", BR: "\uD83C\uDDE7\uD83C\uDDF7",
  DE: "\uD83C\uDDE9\uD83C\uDDEA", MX: "\uD83C\uDDF2\uD83C\uDDFD",
  ES: "\uD83C\uDDEA\uD83C\uDDF8", FR: "\uD83C\uDDEB\uD83C\uDDF7",
  GB: "\uD83C\uDDEC\uD83C\uDDE7", AR: "\uD83C\uDDE6\uD83C\uDDF7",
};

export default function LeaderboardPage() {
  return (
    <main className="flex flex-col min-h-dvh bg-void">
      <Navbar />
      <div className="flex-1 flex flex-col items-center py-12 px-4">
        <h1 className="text-2xl font-mono font-bold text-text-bright tracking-tight mb-2">
          LEADERBOARD
        </h1>
        <p className="text-xs text-muted font-mono uppercase tracking-[0.2em] mb-8">
          Top aura holders
        </p>

        <GlassCard className="w-full max-w-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_80px_60px_50px] gap-2 px-4 py-2 border-b border-border text-[10px] font-mono uppercase tracking-wider text-muted">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">ELO</span>
            <span className="text-right">Games</span>
            <span className="text-right">Win%</span>
          </div>

          {/* Rows */}
          {MOCK_LEADERBOARD.map((player) => (
            <div
              key={player.rank}
              className="grid grid-cols-[40px_1fr_80px_60px_50px] gap-2 px-4 py-3 border-b border-border/50 hover:bg-surface-elevated/50 transition-colors"
            >
              <span className="font-mono text-sm text-muted">
                {player.rank}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{FLAG_MAP[player.country]}</span>
                <span className="text-sm font-medium text-text truncate">
                  {player.nickname}
                </span>
              </div>
              <span className="text-right font-mono text-sm text-text-bright tabular-nums">
                {player.elo}
              </span>
              <span className="text-right font-mono text-xs text-text-secondary tabular-nums">
                {player.games}
              </span>
              <span className="text-right font-mono text-xs text-muted tabular-nums">
                {player.winRate}
              </span>
            </div>
          ))}
        </GlassCard>
      </div>
    </main>
  );
}
