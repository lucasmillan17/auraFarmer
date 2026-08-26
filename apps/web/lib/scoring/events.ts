/**
 * Event definitions for AURA scoring system.
 * Each event has a label, point value, and cooldown to prevent spam.
 */

export interface AuraEvent {
  id: string;
  label: string;
  points: number;
  type: "positive" | "negative";
}

export interface EventDefinition {
  label: string;
  points: number;
  cooldownMs: number;
}

export const FACE_EVENTS: Record<string, EventDefinition> = {
  wink: {
    label: "GUIÑO",
    points: 500,
    cooldownMs: 800,
  },
  blink: {
    label: "PARPADEO",
    points: -500,
    cooldownMs: 500,
  },
  smile: {
    label: "SONRISA",
    points: 200,
    cooldownMs: 1000,
  },
  raisedBrow: {
    label: "CEJA",
    points: 400,
    cooldownMs: 1000,
  },
  mouthOpen: {
    label: "BOCA ABIERTA",
    points: -300,
    cooldownMs: 800,
  },
  lookAway: {
    label: "MIRANDO AFUERA",
    points: -200,
    cooldownMs: 1500,
  },
  chinUp: {
    label: "FACHA",
    points: 300,
    cooldownMs: 1200,
  },
  stare: {
    label: "MIRADA LETAL",
    points: 150,
    cooldownMs: 3000,
  },
  composure: {
    label: "CALMA",
    points: 50,
    cooldownMs: 2000,
  },
};

export const BODY_EVENTS: Record<string, EventDefinition> = {
  powerStance: {
    label: "PODER",
    points: 800,
    cooldownMs: 1200,
  },
  flex: {
    label: "FLEX",
    points: 600,
    cooldownMs: 1000,
  },
  hunch: {
    label: "ENCORVADO",
    points: -1000,
    cooldownMs: 1500,
  },
  slouch: {
    label: "GRAZA",
    points: -800,
    cooldownMs: 1500,
  },
  straight: {
    label: "RECTO",
    points: 300,
    cooldownMs: 1000,
  },
  handsOnHips: {
    label: "CADERA",
    points: 500,
    cooldownMs: 1000,
  },
  peace: {
    label: "PAZ",
    points: 400,
    cooldownMs: 1200,
  },
  shaking: {
    label: "TEMBLOR",
    points: -500,
    cooldownMs: 800,
  },
  powerUp: {
    label: "POWER UP",
    points: 700,
    cooldownMs: 2000,
  },
};
