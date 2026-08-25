"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { FaceScoreBuffer, calculateFaceMetrics } from "@/lib/scoring/faceScoring";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

interface UseAuraDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  maxFrames?: number;
}

interface UseAuraDetectionReturn {
  auraScore: number;
  isReady: boolean;
  isDetecting: boolean;
  fps: number;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useAuraDetection({
  videoRef,
  enabled,
  maxFrames = 300,
}: UseAuraDetectionOptions): UseAuraDetectionReturn {
  const [auraScore, setAuraScore] = useState(5.0);
  const [isReady, setIsReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(0);

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const bufferRef = useRef(new FaceScoreBuffer(maxFrames));
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(-1);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(Date.now());

  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return;

    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    const landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL },
      runningMode: "VIDEO",
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
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

      const result: FaceLandmarkerResult = landmarker.detectForVideo(
        video,
        now
      );

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const metrics = calculateFaceMetrics(result.faceLandmarks[0], null);
        bufferRef.current.addFrame(metrics);
        setAuraScore(bufferRef.current.getScore());
      }

      // FPS counter
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

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { auraScore, isReady, isDetecting, fps, start, stop, reset };
}
