"use client";

import { useRef, useState, useCallback } from "react";
import {
  PoseLandmarker,
  FilesetResolver,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { BodyScoreBuffer } from "@/lib/scoring/bodyScoring";

const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

interface UseBodyDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  maxFrames?: number;
}

interface UseBodyDetectionReturn {
  auraScore: number;
  isReady: boolean;
  isDetecting: boolean;
  fps: number;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useBodyDetection({
  videoRef,
  enabled,
  maxFrames = 300,
}: UseBodyDetectionOptions): UseBodyDetectionReturn {
  const [auraScore, setAuraScore] = useState(5.0);
  const [isReady, setIsReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(0);

  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const bufferRef = useRef(new BodyScoreBuffer(maxFrames));
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(-1);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(Date.now());

  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return;

    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: POSE_MODEL_URL },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    landmarkerRef.current = landmarker;
    setIsReady(true);
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    if (video.currentTime !== lastTimeRef.current) {
      lastTimeRef.current = video.currentTime;

      const result: PoseLandmarkerResult = landmarker.detectForVideo(video, now);

      if (result.landmarks && result.landmarks.length > 0) {
        bufferRef.current.addFrame(result.landmarks[0]);
        setAuraScore(bufferRef.current.getScore());
      }

      frameCountRef.current++;
      const elapsed = Date.now() - fpsTimerRef.current;
      if (elapsed >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        fpsTimerRef.current = Date.now();
      }
    }

    rafRef.current = requestAnimationFrame(detect);
  }, [videoRef]);

  const start = useCallback(async () => {
    if (!landmarkerRef.current) {
      await initLandmarker();
    }
    setIsDetecting(true);
    detect();
  }, [initLandmarker, detect]);

  const stop = useCallback(() => {
    setIsDetecting(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    bufferRef.current.reset();
    setAuraScore(5.0);
  }, []);

  return { auraScore, isReady, isDetecting, fps, start, stop, reset };
}
