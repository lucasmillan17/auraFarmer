/**
 * Body scoring — event-based detection using MediaPipe Pose Landmarker.
 *
 * Each frame is analyzed for discrete body events that add/subtract points.
 *
 * Pose landmark indices:
 * - Shoulders: 11 (left), 12 (right)
 * - Hips: 23 (left), 24 (right)
 * - Wrists: 15 (left), 16 (right)
 * - Elbows: 13 (left), 14 (right)
 * - Ankles: 27 (left), 28 (right)
 * - Knees: 25 (left), 26 (right)
 */

import { type AuraEvent, BODY_EVENTS } from "./events";

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface BodyFrameResult {
  score: number;
  events: AuraEvent[];
}

interface CooldownEntry {
  lastFired: number;
}

export class BodyScoringState {
  score = 0;
  private cooldowns: Map<string, CooldownEntry> = new Map();
  private prevLandmarks: PoseLandmark[] | null = null;
  private prevHipY: number | null = null;
  private wasSitting = false;

  addFrame(landmarks: PoseLandmark[]): BodyFrameResult {
    const now = Date.now();
    const events: AuraEvent[] = [];

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      this.prevLandmarks = landmarks;
      return { score: this.score, events };
    }

    // === BODY ANALYSIS ===

    // Shoulder center and hip center
    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipCenterY = (leftHip.y + rightHip.y) / 2;

    // Spine deviation (hunch detection)
    const spineDeviation = Math.abs(shoulderCenterX - hipCenterX);
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);

    // Wrist positions relative to shoulders
    const leftWristAboveShoulder = leftWrist && leftWrist.y < leftShoulder.y - 0.05;
    const rightWristAboveShoulder = rightWrist && rightWrist.y < rightShoulder.y - 0.05;
    const leftWristWide = leftWrist && Math.abs(leftWrist.x - leftShoulder.x) > 0.15;
    const rightWristWide = rightWrist && Math.abs(rightWrist.x - rightShoulder.x) > 0.15;

    // Elbow positions
    const leftElbowAboveShoulder = leftElbow && leftElbow.y < leftShoulder.y - 0.02;
    const rightElbowAboveShoulder = rightElbow && rightElbow.y < rightShoulder.y - 0.02;

    // Wrist near hip region
    const leftWristNearHip =
      leftWrist &&
      Math.abs(leftWrist.y - leftHip.y) < 0.08 &&
      Math.abs(leftWrist.x - leftHip.x) < 0.1;
    const rightWristNearHip =
      rightWrist &&
      Math.abs(rightWrist.y - rightHip.y) < 0.08 &&
      Math.abs(rightWrist.x - rightHip.x) < 0.1;

    // Wrist near opposite shoulder (crossed arms)
    const leftWristCrossed =
      leftWrist &&
      Math.abs(leftWrist.x - rightShoulder.x) < 0.08 &&
      Math.abs(leftWrist.y - rightShoulder.y) < 0.08;
    const rightWristCrossed =
      rightWrist &&
      Math.abs(rightWrist.x - leftShoulder.x) < 0.08 &&
      Math.abs(rightWrist.y - leftShoulder.y) < 0.08;

    // Hip-ankle distance (detect standing vs sitting)
    const hipAnkleDist = leftHip && leftAnkle
      ? Math.abs(leftHip.y - leftAnkle.y)
      : 0.3;

    // Movement calculation
    let totalMovement = 0;
    if (this.prevLandmarks) {
      for (let i = 0; i < landmarks.length; i++) {
        const curr = landmarks[i];
        const prev = this.prevLandmarks[i];
        if (curr && prev) {
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          totalMovement += Math.sqrt(dx * dx + dy * dy);
        }
      }
    }

    // === EVENT DETECTION ===

    // Power stance: both arms wide and above shoulders
    if (leftWristAboveShoulder && rightWristAboveShoulder && leftWristWide && rightWristWide) {
      const fired = this.tryFire("powerStance", now);
      if (fired) events.push(fired);
    }

    // Flex: both elbows above shoulders
    if (leftElbowAboveShoulder && rightElbowAboveShoulder) {
      const fired = this.tryFire("flex", now);
      if (fired) events.push(fired);
    }

    // Hunch: significant spine deviation
    if (spineDeviation > 0.08) {
      const fired = this.tryFire("hunch", now);
      if (fired) events.push(fired);
    }

    // Slouch: moderate spine deviation + shoulders not level
    if (spineDeviation > 0.05 && spineDeviation <= 0.08 && shoulderLevel > 0.03) {
      const fired = this.tryFire("slouch", now);
      if (fired) events.push(fired);
    }

    // Straight: good alignment
    if (spineDeviation < 0.03 && shoulderLevel < 0.02) {
      const fired = this.tryFire("straight", now);
      if (fired) events.push(fired);
    }

    // Hands on hips
    if (leftWristNearHip && rightWristNearHip) {
      const fired = this.tryFire("handsOnHips", now);
      if (fired) events.push(fired);
    }

    // Peace / crossed arms gesture
    if (leftWristCrossed && rightWristCrossed) {
      const fired = this.tryFire("peace", now);
      if (fired) events.push(fired);
    }

    // Shaking: excessive movement
    if (totalMovement > 0.8) {
      const fired = this.tryFire("shaking", now);
      if (fired) events.push(fired);
    }

    // Power up: detect standing up (hip Y moving up significantly)
    if (this.prevHipY !== null) {
      const hipYMoved = this.prevHipY - hipCenterY; // positive = moving up
      if (hipYMoved > 0.04 && hipAnkleDist > 0.25) {
        const fired = this.tryFire("powerUp", now);
        if (fired) events.push(fired);
      }
    }
    this.prevHipY = hipCenterY;

    // Apply event points
    for (const evt of events) {
      this.score += evt.points;
    }

    this.prevLandmarks = landmarks;
    return { score: this.score, events };
  }

  reset(): void {
    this.score = 0;
    this.cooldowns.clear();
    this.prevLandmarks = null;
    this.prevHipY = null;
    this.wasSitting = false;
  }

  private tryFire(eventKey: string, now: number): AuraEvent | null {
    const def = BODY_EVENTS[eventKey];
    if (!def) return null;

    const cooldown = this.cooldowns.get(eventKey);
    if (cooldown && now - cooldown.lastFired < def.cooldownMs) {
      return null;
    }

    this.cooldowns.set(eventKey, { lastFired: now });

    return {
      id: `${eventKey}-${now}`,
      label: def.label,
      points: def.points,
      type: def.points >= 0 ? "positive" : "negative",
    };
  }
}
