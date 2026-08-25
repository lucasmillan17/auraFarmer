/**
 * Body scoring metrics based on MediaPipe Pose Landmarker landmarks.
 *
 * Pose landmark indices:
 * - Shoulders: 11 (left), 12 (right)
 * - Hips: 23 (left), 24 (right)
 * - Wrists: 15 (left), 16 (right)
 * - Elbows: 13 (left), 14 (right)
 * - Ankles: 27 (left), 28 (right)
 */

export interface BodyMetrics {
  posture: number;
  symmetry: number;
  stance: number;
  gesture: number;
  movementPenalty: number;
  presenceGate: boolean;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export class BodyScoreBuffer {
  private buffer: number[] = [];
  private prevLandmarks: PoseLandmark[] | null = null;
  private readonly maxFrames: number;

  constructor(maxFrames: number = 300) {
    this.maxFrames = maxFrames;
  }

  addFrame(landmarks: PoseLandmark[]): BodyMetrics {
    const metrics = this.calculateMetrics(landmarks);
    this.prevLandmarks = landmarks;

    const frameScore =
      (metrics.posture * 0.2 +
        metrics.symmetry * 0.15 +
        metrics.stance * 0.1 +
        metrics.gesture * 0.3 +
        metrics.movementPenalty) *
      10;

    this.buffer.push(Math.max(0, Math.min(10, frameScore)));

    if (this.buffer.length > this.maxFrames) {
      this.buffer.shift();
    }

    return metrics;
  }

  private calculateMetrics(landmarks: PoseLandmark[]): BodyMetrics {
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

    // Presence gate
    const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
    const presenceGate = shoulderWidth > 0.15;

    // Posture: spine alignment
    const shoulderCenter = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    };
    const hipCenter = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    };
    const spineDeviation = Math.abs(shoulderCenter.x - hipCenter.x);
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
    const posture = Math.max(0, 1 - (spineDeviation + shoulderLevel) * 3);

    // Symmetry: bilateral balance
    const bodyCenter = (leftShoulder.x + rightShoulder.x) / 2;
    const leftSpread = bodyCenter - leftShoulder.x;
    const rightSpread = rightShoulder.x - bodyCenter;
    const symRatio = Math.min(leftSpread, rightSpread) / Math.max(leftSpread, rightSpread, 0.001);
    const symmetry = symRatio;

    // Stance: feet stability
    const feetWidth = Math.abs(rightAnkle.x - leftAnkle.x);
    const stance = Math.min(1, feetWidth / 0.3);

    // Gesture detection: arm positions (simplified)
    const leftArmAngle = Math.abs(leftWrist.y - leftElbow.y);
    const rightArmAngle = Math.abs(rightWrist.y - rightElbow.y);
    const armRaise = (leftArmAngle + rightArmAngle) / 2;
    const gesture = Math.min(1, armRaise * 5);

    // Movement penalty
    let movementPenalty = 0;
    if (this.prevLandmarks) {
      const totalMovement = landmarks.reduce((sum, lm, i) => {
        if (!this.prevLandmarks![i]) return sum;
        const dx = lm.x - this.prevLandmarks![i].x;
        const dy = lm.y - this.prevLandmarks![i].y;
        return sum + Math.sqrt(dx * dx + dy * dy);
      }, 0);
      movementPenalty = totalMovement > 0.05 ? -0.1 : 0;
    }

    return {
      posture,
      symmetry,
      stance,
      gesture,
      movementPenalty,
      presenceGate,
    };
  }

  getScore(): number {
    if (this.buffer.length === 0) return 5.0;

    const sorted = [...this.buffer].sort((a, b) => a - b);
    const trimCount = Math.floor(sorted.length * 0.1);
    const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

    if (trimmed.length === 0) return 5.0;

    const sum = trimmed.reduce((a, b) => a + b, 0);
    return Math.round((sum / trimmed.length) * 10) / 10;
  }

  reset(): void {
    this.buffer = [];
    this.prevLandmarks = null;
  }

  get frameCount(): number {
    return this.buffer.length;
  }
}
