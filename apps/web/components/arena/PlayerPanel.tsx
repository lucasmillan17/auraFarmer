"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getRank } from "@/lib/ranks";
import { AuraScore } from "./AuraScore";
import { RankBadge } from "./RankBadge";
import { PlayerBadge } from "./PlayerBadge";

interface PlayerPanelProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  remoteStream?: MediaStream | null;
  localStream?: MediaStream | null;
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
  localStream,
  nickname,
  elo,
  country,
  rank,
  score,
  isYou = false,
  className,
}: PlayerPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach local stream — runs when stream or element changes
  useEffect(() => {
    const el = localVideoRef.current;
    if (el && localStream && el.srcObject !== localStream) {
      el.srcObject = localStream;
    }
  }, [localStream]);

  // Sync localVideoRef back to parent useWebcam ref
  useEffect(() => {
    if (videoRef) {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = localVideoRef.current;
    }
  });

  // Attach remote stream — only runs when stream changes
  useEffect(() => {
    const el = remoteVideoRef.current;
    if (el && remoteStream && el.srcObject !== remoteStream) {
      el.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div
      className={cn(
        "relative flex-1 min-h-0 min-w-0 rounded-3xl overflow-hidden border border-border",
        "bg-surface",
        className
      )}
    >
      {/* Local video */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted={isYou}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: isYou ? "scaleX(-1)" : undefined,
        }}
      />

      {/* Remote video overlay — only for rival */}
      {!isYou && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
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
