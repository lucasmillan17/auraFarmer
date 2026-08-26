/**
 * Face scoring — event-based detection using MediaPipe Face Landmarker.
 *
 * Instead of continuous metrics, each frame is analyzed for discrete events
 * (wink, blink, smile, etc.) that add or subtract points from a cumulative score.
 *
 * Landmark reference:
 * - Iris: 468 (left center), 473 (right center)
 * - Eyes: 33/133 (left corners), 263/362 (right corners)
 * - Eyelids: 159/145 (left), 386/374 (right)
 * - Eyebrows: 107/105 (left), 336/334 (right)
 * - Nose: 4 (tip), 10 (forehead), 152 (chin)
 * - Mouth: 13/14 (lips), 61/291 (corners)
 */

import { type AuraEvent, FACE_EVENTS } from "./events";

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface FaceFrameResult {
  score: number;
  events: AuraEvent[];
}

interface CooldownEntry {
  lastFired: number;
}

export class FaceScoringState {
  score = 0;
  private cooldowns: Map<string, CooldownEntry> = new Map();
  private negativeEventCount = 0;
  private lastNegativeTime = 0;
  private stableFrames = 0;
  private neutralFrames = 0;

  addFrame(landmarks: Landmark[]): FaceFrameResult {
    const now = Date.now();
    const events: AuraEvent[] = [];

    // --- EAR (Eye Aspect Ratio) ---
    const leftEAR = this.calcEAR(landmarks, "left");
    const rightEAR = this.calcEAR(landmarks, "right");
    const avgEAR = (leftEAR + rightEAR) / 2;

    const isLeftClosed = leftEAR < 0.15;
    const isRightClosed = rightEAR < 0.15;
    const isLeftOpen = leftEAR > 0.20;
    const isRightOpen = rightEAR > 0.20;

    // --- Gaze offset ---
    const leftGazeOffset = this.calcGazeOffset(landmarks, "left");
    const rightGazeOffset = this.calcGazeOffset(landmarks, "right");
    const avgGazeOffset = (leftGazeOffset + rightGazeOffset) / 2;

    // --- Smile detection ---
    const smileAmount = this.calcSmile(landmarks);

    // --- Eyebrow raise ---
    const browRaise = this.calcBrowRaise(landmarks);

    // --- Mouth open ---
    const mouthGap = this.calcMouthOpen(landmarks);

    // --- Head pose (chin up / pitch) ---
    const chinUp = this.calcChinUp(landmarks);

    // --- Neutral face (no smile, no open mouth) ---
    const isNeutral = smileAmount < 0.005 && mouthGap < 0.02;

    // === EVENT DETECTION ===

    // Wink: one eye closed, other open
    if (isLeftClosed && isRightOpen) {
      const fired = this.tryFire("wink", now);
      if (fired) events.push(fired);
    } else if (isRightClosed && isLeftOpen) {
      const fired = this.tryFire("wink", now);
      if (fired) events.push(fired);
    }

    // Blink: both eyes closed
    if (isLeftClosed && isRightClosed) {
      const fired = this.tryFire("blink", now);
      if (fired) events.push(fired);
      this.negativeEventCount++;
      this.lastNegativeTime = now;
    }

    // Smile
    if (smileAmount > 0.01) {
      const fired = this.tryFire("smile", now);
      if (fired) events.push(fired);
    }

    // Raised eyebrow
    if (browRaise > 0.012) {
      const fired = this.tryFire("raisedBrow", now);
      if (fired) events.push(fired);
    }

    // Mouth open (surprised / talking)
    if (mouthGap > 0.035) {
      const fired = this.tryFire("mouthOpen", now);
      if (fired) {
        events.push(fired);
        this.negativeEventCount++;
        this.lastNegativeTime = now;
      }
    }

    // Look away
    if (avgGazeOffset > 0.06) {
      const fired = this.tryFire("lookAway", now);
      if (fired) {
        events.push(fired);
        this.negativeEventCount++;
        this.lastNegativeTime = now;
      }
    }

    // Chin up (confident pose — head pitched slightly down)
    if (chinUp > 0.06) {
      const fired = this.tryFire("chinUp", now);
      if (fired) events.push(fired);
    }

    // Stare: stable gaze + neutral face for many frames
    if (avgGazeOffset < 0.02 && isNeutral) {
      this.stableFrames++;
    } else {
      this.stableFrames = 0;
    }
    if (this.stableFrames > 90) { // ~3s at 30fps
      const fired = this.tryFire("stare", now);
      if (fired) {
        events.push(fired);
        this.stableFrames = 0;
      }
    }

    // Composure: no negative events for 2s
    const timeSinceNegative = now - this.lastNegativeTime;
    if (timeSinceNegative > 2000 && this.lastNegativeTime > 0) {
      const fired = this.tryFire("composure", now);
      if (fired) events.push(fired);
    }

    // Track neutral frames
    if (isNeutral) {
      this.neutralFrames++;
    } else {
      this.neutralFrames = 0;
    }

    // Apply event points
    for (const evt of events) {
      this.score += evt.points;
    }

    return { score: this.score, events };
  }

  reset(): void {
    this.score = 0;
    this.cooldowns.clear();
    this.negativeEventCount = 0;
    this.lastNegativeTime = 0;
    this.stableFrames = 0;
    this.neutralFrames = 0;
  }

  private tryFire(eventKey: string, now: number): AuraEvent | null {
    const def = FACE_EVENTS[eventKey];
    if (!def) return null;

    const cooldown = this.cooldowns.get(eventKey);
    if (cooldown && now - cooldown.lastFired < def.cooldownMs) {
      return null;
    }

    this.cooldowns.set(eventKey, { lastFired: now });

    return {
      id: `${eventKey}-${now}`,
      label: def.label,
      emoji: def.emoji,
      points: def.points,
      type: def.points >= 0 ? "positive" : "negative",
    };
  }

  private calcEAR(lm: Landmark[], side: "left" | "right"): number {
    const topLid = side === "left" ? 159 : 386;
    const botLid = side === "left" ? 145 : 374;
    const inner = side === "left" ? 33 : 263;
    const outer = side === "left" ? 133 : 362;

    const vertical = Math.abs((lm[topLid]?.y ?? 0) - (lm[botLid]?.y ?? 0));
    const horizontal = Math.abs((lm[inner]?.x ?? 0) - (lm[outer]?.x ?? 0));

    return vertical / Math.max(horizontal, 0.001);
  }

  private calcGazeOffset(lm: Landmark[], side: "left" | "right"): number {
    const iris = side === "left" ? 468 : 473;
    const inner = side === "left" ? 33 : 263;
    const outer = side === "left" ? 133 : 362;

    const irisX = lm[iris]?.x ?? 0.5;
    const eyeCenter = ((lm[inner]?.x ?? 0) + (lm[outer]?.x ?? 0)) / 2;
    return Math.abs(irisX - eyeCenter);
  }

  private calcSmile(lm: Landmark[]): number {
    const lipTop = lm[13]?.y ?? 0;
    const cornerLeft = lm[61]?.y ?? 0;
    const cornerRight = lm[291]?.y ?? 0;

    const leftRise = lipTop - cornerLeft;
    const rightRise = lipTop - cornerRight;
    return (leftRise + rightRise) / 2;
  }

  private calcBrowRaise(lm: Landmark[]): number {
    const leftBrow = lm[105]?.y ?? 0;
    const leftEye = lm[159]?.y ?? 0;
    const rightBrow = lm[334]?.y ?? 0;
    const rightEye = lm[386]?.y ?? 0;

    const leftGap = leftEye - leftBrow; // y increases downward
    const rightGap = rightEye - rightBrow;
    return (leftGap + rightGap) / 2;
  }

  private calcMouthOpen(lm: Landmark[]): number {
    const upperLip = lm[13]?.y ?? 0;
    const lowerLip = lm[14]?.y ?? 0;
    return Math.abs(upperLip - lowerLip);
  }

  private calcChinUp(lm: Landmark[]): number {
    const noseTip = lm[4]?.y ?? 0.5;
    const forehead = lm[10]?.y ?? 0.2;
    const chin = lm[152]?.y ?? 0.8;

    const faceMid = (forehead + chin) / 2;
    return Math.abs(noseTip - faceMid);
  }
}
