"use client";

import { useEffect, useRef, useState } from "react";
import { useMatchStore } from "@/stores/matchStore";
import { useWebcam } from "@/hooks/useWebcam";
import { useAuraDetection } from "@/hooks/useAuraDetection";
import { useBodyDetection } from "@/hooks/useBodyDetection";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useTimer } from "@/hooks/useTimer";
import { getSocket } from "@/lib/socket";
import { getDuelDuration, getRank } from "@/lib/ranks";
import { ArenaLayout } from "@/components/arena/ArenaLayout";
import { ModeSelector } from "@/components/arena/ModeSelector";
import { Navbar } from "@/components/shared/Navbar";

export default function ArenaPage() {
  const { phase, mode, roomId, me, rival, setPhase, setMe, setRival, setDuration, updateScore, setTimeLeft, setWinner } =
    useMatchStore();
  const { videoRef, stream, start: startCam, stop: stopCam } = useWebcam();
  const { joinMatchmaking, leaveMatchmaking } = useMatchmaking();
  const [nickname] = useState(() => `Player_${Math.random().toString(36).slice(2, 6)}`);
  const playerSlotRef = useRef<"player1" | "player2" | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Face detection
  const faceDetection = useAuraDetection({
    videoRef,
    enabled: mode === "face",
  });

  // Body detection
  const bodyDetection = useBodyDetection({
    videoRef,
    enabled: mode === "body",
  });

  const activeDetection = mode === "face" ? faceDetection : bodyDetection;

  // WebRTC — pass reactive roomId from store
  const { remoteStream, createOffer, createAnswer } = useWebRTC({
    roomId,
    localStream: stream,
    onRemoteStream: () => {},
  });

  // Timer — duel end handler
  const { timeLeft, start: startTimer, stop: stopTimer } = useTimer(() => {
    const state = useMatchStore.getState();
    const myScore = state.me?.score ?? 0;
    const rivalScore = state.rival?.score ?? 0;

    const winnerId = myScore >= rivalScore ? state.me?.id : state.rival?.id;
    setWinner(winnerId ?? null);

    if (state.me && state.rival) {
      getSocket().emit("score:submit", {
        matchId: state.roomId,
        player1Score: playerSlotRef.current === "player1" ? myScore : rivalScore,
        player2Score: playerSlotRef.current === "player1" ? rivalScore : myScore,
      });
    }

    setPhase("result");
  });

  // Sync timeLeft into store for ArenaLayout/Timer to read
  useEffect(() => {
    setTimeLeft(timeLeft);
  }, [timeLeft, setTimeLeft]);

  // Start webcam on mount
  useEffect(() => {
    startCam();
    return () => stopCam();
  }, []);

  // Init me user
  useEffect(() => {
    const socket = getSocket();
    setMe({
      id: socket.id || "local",
      nickname,
      elo: 1200,
      rank: getRank(1200).name,
      country: "MX",
      score: 5.0,
    });
  }, []);

  // Listen for WebRTC peer joined — trigger offer/answer
  useEffect(() => {
    const socket = getSocket();

    const handleWebrtcReady = () => {
      if (playerSlotRef.current === "player1") {
        createOffer();
      } else {
        createAnswer();
      }

      // Start countdown after WebRTC connects
      setPhase("countdown");
      let count = 3;
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        count--;
        if (count <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setPhase("dueling");
          activeDetection.start();
          const state = useMatchStore.getState();
          startTimer(state.duration);
        }
      }, 1000);
    };

    const handleUserLeft = () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      stopTimer();
      setPhase("lobby");
      playerSlotRef.current = null;
    };

    socket.on("webrtc:user-joined", handleWebrtcReady);
    socket.on("webrtc:user-left", handleUserLeft);

    return () => {
      socket.off("webrtc:user-joined", handleWebrtcReady);
      socket.off("webrtc:user-left", handleUserLeft);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [createOffer, createAnswer]);

  // Override matchmaking:found to also store playerSlot for WebRTC role
  useEffect(() => {
    const socket = getSocket();

    const handleMatchFound = (data: {
      roomId: string;
      opponent: { userId: string; elo: number };
      you: "player1" | "player2";
    }) => {
      playerSlotRef.current = data.you;

      const rank = getRank(data.opponent.elo);
      setRival({
        id: data.opponent.userId,
        nickname: `Rival_${data.opponent.userId.slice(0, 4)}`,
        elo: data.opponent.elo,
        rank: rank.name,
        country: "??",
        score: 5.0,
      });

      const myRank = getRank(1200);
      setDuration(getDuelDuration(myRank.name));
    };

    socket.on("matchmaking:found", handleMatchFound);
    return () => {
      socket.off("matchmaking:found", handleMatchFound);
    };
  }, [setRival, setDuration]);

  // Broadcast my score periodically during duel
  useEffect(() => {
    if (phase !== "dueling") return;

    const interval = setInterval(() => {
      const state = useMatchStore.getState();
      if (state.me) {
        const score = activeDetection.auraScore;
        getSocket().emit("score:update", {
          playerId: state.me.id,
          score,
        });
        updateScore(state.me.id, score);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [phase, activeDetection.auraScore]);

  // Listen for opponent score updates
  useEffect(() => {
    const socket = getSocket();
    socket.on("score:update", (data: { playerId: string; score: number }) => {
      updateScore(data.playerId, data.score);
    });
    return () => { socket.off("score:update"); };
  }, []);

  // Show lobby
  if (phase === "lobby" || phase === "matchmaking") {
    return (
      <main className="flex flex-col min-h-dvh bg-void">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-mono font-bold text-text-bright tracking-tight">
              AURA ARENA
            </h1>
            <p className="text-sm text-text-secondary mt-2 font-mono">
              Select your battle mode
            </p>
          </div>

          <ModeSelector onSelect={() => {}} />

          <button
            onClick={() => joinMatchmaking(mode, me?.elo ?? 1200)}
            disabled={phase === "matchmaking"}
            className="px-8 py-3 rounded-2xl font-mono font-semibold text-sm uppercase tracking-wider bg-aura text-void hover:bg-aura-bright transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_oklch(0.78_0.15_85_/_0.25)]"
          >
            {phase === "matchmaking" ? "SEARCHING..." : "START DUEL"}
          </button>

          {phase === "matchmaking" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-muted font-mono animate-pulse">
                Finding opponent...
              </p>
              <button
                onClick={leaveMatchmaking}
                className="px-6 py-2 rounded-2xl font-mono text-xs uppercase tracking-wider border border-border bg-surface text-muted hover:text-text-secondary hover:border-border-strong transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Show connecting / countdown / dueling / result
  return (
    <ArenaLayout
      localVideoRef={videoRef}
      remoteStream={remoteStream}
    />
  );
}
