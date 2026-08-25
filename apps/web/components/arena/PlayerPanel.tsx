"use client";

import { cn } from "@/lib/utils";
import { getRank } from "@/lib/ranks";
import { AuraScore } from "./AuraScore";
import { RankBadge } from "./RankBadge";
import { PlayerBadge } from "./PlayerBadge";

interface PlayerPanelProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  remoteStream?: MediaStream | null;
  nickname: string;
  elo: number;
  country: string;
  rank: string;
  score: number;
  isYou?: boolean;
  className?: string;
}

export function PlayerPanel({
  videoRef,
  remoteStream,
  nickname,
  elo,
  country,
  rank,
  score,
  isYou = false,
  className,
}: PlayerPanelProps) {
  return (
    <div
      className={cn(
        "relative flex-1 rounded-3xl overflow-hidden border border-border",
        "bg-surface",
        className
      )}
    >
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isYou}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: isYou ? "scaleX(-1)" : undefined,
        }}
      />

      {/* Remote video via srcObject */}
      {!isYou && remoteStream && (
        <video
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          ref={(el) => {
            if (el && remoteStream) el.srcObject = remoteStream;
          }}
        />
      )}

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left: Aura Score */}
        <div className="absolute top-4 left-4">
          <AuraScore score={score} />
        </div>

        {/* Top-right: Rank Badge */}
        <div className="absolute top-4 right-4">
          <RankBadge rank={rank} isActive={true} />
        </div>

        {/* Bottom-left: Player Badge */}
        <div className="absolute bottom-4 left-4">
          <PlayerBadge
            nickname={nickname}
            elo={elo}
            country={country}
            isYou={isYou}
          />
        </div>

        {/* Bottom-right: Presence indicator */}
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full glass">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                score >= 7
                  ? "bg-aura animate-pulse"
                  : score >= 4
                    ? "bg-text-secondary"
                    : "bg-muted"
              )}
            />
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted">
              {score >= 7 ? "HIGH" : score >= 4 ? "MED" : "LOW"}
            </span>
          </div>
        </div>
      </div>

      {/* Score glow overlay — only when aura is high */}
      {score >= 8 && (
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            boxShadow: "inset 0 0 40px oklch(0.78 0.15 85 / 0.1)",
          }}
        />
      )}
    </div>
  );
}
