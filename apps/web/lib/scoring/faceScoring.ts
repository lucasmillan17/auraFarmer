/**
 * Face scoring metrics based on MediaPipe Face Landmarker landmarks.
 *
 * Landmark reference:
 * - Iris: 468 (left center), 473 (right center)
 * - Eyes: 33/133 (left corners), 263/362 (right corners)
 * - Eyelids: 159/145 (left), 386/374 (right)
 * - Nose: 4 (tip), 10 (forehead), 152 (chin)
 * - Mouth: 13/14 (lips), 61/291 (corners)
 */

export interface FaceMetrics {
  gazeStability: number;
  headPose: number;
  blinkPenalty: number;
  expressionPenalty: number;
  presenceGate: boolean;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export function calculateFaceMetrics(
  landmarks: Landmark[],
  prevMetrics: FaceMetrics | null
): FaceMetrics {
  // Gaze stability: iris centered in eye
  const leftIrisX = landmarks[468]?.x ?? 0.5;
  const leftEyeCenter =
    ((landmarks[33]?.x ?? 0) + (landmarks[133]?.x ?? 0)) / 2;
  const leftGazeOffset = Math.abs(leftIrisX - leftEyeCenter);

  const rightIrisX = landmarks[473]?.x ?? 0.5;
  const rightEyeCenter =
    ((landmarks[263]?.x ?? 0) + (landmarks[362]?.x ?? 0)) / 2;
  const rightGazeOffset = Math.abs(rightIrisX - rightEyeCenter);

  const avgGazeOffset = (leftGazeOffset + rightGazeOffset) / 2;
  const gazeStability = Math.max(0, 1 - avgGazeOffset * 15);

  // Head pose: deviation from center
  const noseX = landmarks[4]?.x ?? 0.5;
  const foreheadX = landmarks[10]?.x ?? 0.5;
  const chinY = landmarks[152]?.y ?? 0.5;
  const foreheadY = landmarks[10]?.y ?? 0.2;

  const yaw = Math.abs(noseX - 0.5);
  const pitch = Math.abs(
    (landmarks[4]?.y ?? 0.5) - (foreheadY + chinY) / 2
  );
  const headDeviation = yaw + pitch;
  const headPose = Math.max(0, 1 - headDeviation * 5);

  // Blink detection (EAR - Eye Aspect Ratio)
  const leftEAR =
    Math.abs((landmarks[159]?.y ?? 0) - (landmarks[145]?.y ?? 0)) /
    Math.max(
      Math.abs((landmarks[33]?.x ?? 0) - (landmarks[133]?.x ?? 0)),
      0.001
    );
  const rightEAR =
    Math.abs((landmarks[386]?.y ?? 0) - (landmarks[374]?.y ?? 0)) /
    Math.max(
      Math.abs((landmarks[263]?.x ?? 0) - (landmarks[362]?.x ?? 0)),
      0.001
    );
  const avgEAR = (leftEAR + rightEAR) / 2;
  const isBlinking = avgEAR < 0.18;

  // Expression control: smile detection
  const mouthHeight =
    Math.abs(
      (landmarks[13]?.y ?? 0) - (landmarks[14]?.y ?? 0)
    );
  const leftCornerRise =
    (landmarks[13]?.y ?? 0) - (landmarks[61]?.y ?? 0);
  const rightCornerRise =
    (landmarks[13]?.y ?? 0) - (landmarks[291]?.y ?? 0);
  const smileAmount =
    (leftCornerRise + rightCornerRise) / 2;
  const isSmiling = smileAmount > 0.008 || mouthHeight > 0.03;

  // Presence gate: face confidence
  const faceWidth = Math.abs(
    (landmarks[234]?.x ?? 0) - (landmarks[454]?.x ?? 0)
  );
  const presenceGate = faceWidth > 0.1;

  return {
    gazeStability,
    headPose,
    blinkPenalty: isBlinking ? -0.05 : 0,
    expressionPenalty: isSmiling ? -0.08 : 0,
    presenceGate,
  };
}

/**
 * Aggregate face metrics into a 0-10 aura score.
 * Uses trimmed mean over a buffer of frames.
 */
export class FaceScoreBuffer {
  private buffer: number[] = [];
  private readonly maxFrames: number;

  constructor(maxFrames: number = 300) {
    this.maxFrames = maxFrames;
  }

  addFrame(metrics: FaceMetrics): void {
    if (!metrics.presenceGate) return;

    const frameScore =
      (metrics.gazeStability * 0.15 +
        metrics.headPose * 0.1 +
        metrics.blinkPenalty +
        metrics.expressionPenalty) *
      10;

    this.buffer.push(Math.max(0, Math.min(10, frameScore)));

    if (this.buffer.length > this.maxFrames) {
      this.buffer.shift();
    }
  }

  getScore(): number {
    if (this.buffer.length === 0) return 5.0;

    // Trimmed mean: remove top/bottom 10%
    const sorted = [...this.buffer].sort((a, b) => a - b);
    const trimCount = Math.floor(sorted.length * 0.1);
    const trimmed = sorted.slice(
      trimCount,
      sorted.length - trimCount
    );

    if (trimmed.length === 0) return 5.0;

    const sum = trimmed.reduce((a, b) => a + b, 0);
    return Math.round((sum / trimmed.length) * 10) / 10;
  }

  reset(): void {
    this.buffer = [];
  }

  get frameCount(): number {
    return this.buffer.length;
  }
}
