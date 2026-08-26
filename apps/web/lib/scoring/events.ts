/**
 * Event definitions for AURA scoring system.
 * Each event has a label, emoji, point value, and cooldown to prevent spam.
 */

export interface AuraEvent {
  id: string;
  label: string;
  emoji: string;
  points: number;
  type: "positive" | "negative";
}

export interface EventDefinition {
  label: string;
  emoji: string;
  points: number;
  cooldownMs: number;
}

export const FACE_EVENTS: Record<string, EventDefinition> = {
  wink: {
    label: "GUIÑO",
    emoji: "😏",
    points: 500,
    cooldownMs: 2000,
  },
  blink: {
    label: "PARPADEO",
    emoji: "😑",
    points: -500,
    cooldownMs: 1800,
  },
  smile: {
    label: "SONRISA",
    emoji: "😁",
    points: 200,
    cooldownMs: 2500,
  },
  raisedBrow: {
    label: "CEJA",
    emoji: "🤨",
    points: 400,
    cooldownMs: 2500,
  },
  mouthOpen: {
    label: "BOCA ABIERTA",
    emoji: "😱",
    points: -300,
    cooldownMs: 2000,
  },
  lookAway: {
    label: "MIRANDO AFUERA",
    emoji: "👀",
    points: -200,
    cooldownMs: 3000,
  },
  chinUp: {
    label: "FACHA",
    emoji: "🔥",
    points: 300,
    cooldownMs: 2500,
  },
  stare: {
    label: "MIRADA LETAL",
    emoji: "👁️",
    points: 150,
    cooldownMs: 4000,
  },
  composure: {
    label: "CALMA",
    emoji: "🧘",
    points: 50,
    cooldownMs: 4000,
  },
};

export const BODY_EVENTS: Record<string, EventDefinition> = {
  powerStance: {
    label: "PODER",
    emoji: "💪",
    points: 800,
    cooldownMs: 3000,
  },
  flex: {
    label: "FLEX",
    emoji: "🔥",
    points: 600,
    cooldownMs: 2500,
  },
  hunch: {
    label: "ENCORVADO",
    emoji: "💀",
    points: -1000,
    cooldownMs: 3000,
  },
  slouch: {
    label: "GRAZA",
    emoji: "🪫",
    points: -800,
    cooldownMs: 3000,
  },
  straight: {
    label: "RECTO",
    emoji: "🧍",
    points: 300,
    cooldownMs: 2500,
  },
  handsOnHips: {
    label: "CADERA",
    emoji: "🤝",
    points: 500,
    cooldownMs: 2500,
  },
  peace: {
    label: "PAZ",
    emoji: "✌️",
    points: 400,
    cooldownMs: 3000,
  },
  shaking: {
    label: "TEMBLOR",
    emoji: "🫨",
    points: -500,
    cooldownMs: 2000,
  },
  powerUp: {
    label: "POWER UP",
    emoji: "⚡",
    points: 700,
    cooldownMs: 4000,
  },
};
