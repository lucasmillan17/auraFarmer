"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { FaceScoringState } from "@/lib/scoring/faceScoring";
import type { AuraEvent } from "@/lib/scoring/events";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

interface UseAuraDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
}

interface UseAuraDetectionReturn {
  auraScore: number;
  isReady: boolean;
  isDetecting: boolean;
  fps: number;
  events: AuraEvent[];
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useAuraDetection({
  videoRef,
  enabled,
}: UseAuraDetectionOptions): UseAuraDetectionReturn {
  const [auraScore, setAuraScore] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(0);
  const [events, setEvents] = useState<AuraEvent[]>([]);

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const scoringRef = useRef(new FaceScoringState());
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
        const frameResult = scoringRef.current.addFrame(result.faceLandmarks[0]);
        setAuraScore(frameResult.score);
        if (frameResult.events.length > 0) {
          setEvents(frameResult.events);
        }
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
    scoringRef.current.reset();
    setAuraScore(0);
    setEvents([]);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { auraScore, isReady, isDetecting, fps, events, start, stop, reset };
}
