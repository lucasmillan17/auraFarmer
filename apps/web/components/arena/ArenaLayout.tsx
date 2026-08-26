"use client";

import { useMatchStore } from "@/stores/matchStore";
import { PlayerPanel } from "./PlayerPanel";
import { DominanceBar } from "./DominanceBar";
import { Timer } from "./Timer";
import { MatchResult } from "./MatchResult";
import type { RefObject } from "react";

interface ArenaLayoutProps {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export function ArenaLayout({ localVideoRef, localStream, remoteStream }: ArenaLayoutProps) {
  const { me, rival, timeLeft, duration, phase, winner } = useMatchStore();

  if (!me || !rival) return null;

  return (
    <div className="relative flex flex-col md:flex-row h-dvh bg-void p-3 gap-2">
      {/* YOU */}
      <PlayerPanel
        videoRef={localVideoRef}
        localStream={localStream}
        nickname={me.nickname}
        elo={me.elo}
        country={me.country}
        rank={me.rank}
        score={me.score}
        isYou={true}
      />

      {/* Center overlay: Timer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <Timer timeLeft={timeLeft} duration={duration} />
      </div>

      {/* RIVAL */}
      <PlayerPanel
        remoteStream={remoteStream}
        nickname={rival.nickname}
        elo={rival.elo}
        country={rival.country}
        rank={rival.rank}
        score={rival.score}
        isYou={false}
      />

      {/* Bottom dominance bar */}
      <div className="absolute bottom-0 left-0 right-0 pb-3 px-4 z-10 pointer-events-none">
        <DominanceBar
          player1Score={me.score}
          player2Score={rival.score}
          player1Label="YOU"
          player2Label="RIVAL"
        />
      </div>

      {/* Result modal */}
      {phase === "result" && winner && (
        <MatchResult />
      )}
    </div>
  );
}
