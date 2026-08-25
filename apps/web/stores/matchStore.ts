import { create } from "zustand";

export type DuelMode = "face" | "body";
export type DuelPhase = "lobby" | "matchmaking" | "connecting" | "countdown" | "dueling" | "result";

interface Player {
  id: string;
  nickname: string;
  elo: number;
  rank: string;
  country: string;
  score: number;
}

interface MatchState {
  phase: DuelPhase;
  mode: DuelMode;
  roomId: string | null;
  me: Player | null;
  rival: Player | null;
  timeLeft: number;
  duration: number;
  winner: string | null;

  setPhase: (phase: DuelPhase) => void;
  setMode: (mode: DuelMode) => void;
  setRoomId: (roomId: string) => void;
  setMe: (me: Player) => void;
  setRival: (rival: Player) => void;
  updateScore: (playerId: string, score: number) => void;
  setTimeLeft: (time: number) => void;
  setDuration: (d: number) => void;
  setWinner: (winnerId: string | null) => void;
  reset: () => void;
}

const initialState = {
  phase: "lobby" as DuelPhase,
  mode: "face" as DuelMode,
  roomId: null as string | null,
  me: null as Player | null,
  rival: null as Player | null,
  timeLeft: 0,
  duration: 10,
  winner: null as string | null,
};

export const useMatchStore = create<MatchState>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),
  setMode: (mode) => set({ mode }),
  setRoomId: (roomId) => set({ roomId }),
  setMe: (me) => set({ me }),
  setRival: (rival) => set({ rival }),

  updateScore: (playerId, score) =>
    set((state) => {
      if (state.me?.id === playerId) return { me: { ...state.me, score } };
      if (state.rival?.id === playerId) return { rival: { ...state.rival, score } };
      return {};
    }),

  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setDuration: (duration) => set({ duration, timeLeft: duration }),
  setWinner: (winner) => set({ winner }),
  reset: () => set(initialState),
}));
