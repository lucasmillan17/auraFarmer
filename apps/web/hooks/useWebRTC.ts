"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface UseWebRTCOptions {
  roomId: string | null;
  localStream: MediaStream | null;
  onRemoteStream: (stream: MediaStream) => void;
}

interface UseWebRTCReturn {
  remoteStream: MediaStream | null;
  isConnected: boolean;
  createOffer: () => Promise<void>;
  createAnswer: () => Promise<void>;
}

export function useWebRTC({
  roomId,
  localStream,
  onRemoteStream,
}: UseWebRTCOptions): UseWebRTCReturn {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const localStreamRef = useRef(localStream);
  localStreamRef.current = localStream;

  const onRemoteStreamRef = useRef(onRemoteStream);
  onRemoteStreamRef.current = onRemoteStream;

  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && roomIdRef.current) {
        getSocket().emit("webrtc:ice-candidate", {
          roomId: roomIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);
      onRemoteStreamRef.current(stream);
      setIsConnected(true);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected") {
        setIsConnected(false);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, []);

  const createOffer = useCallback(async () => {
    const pc = createPeer();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (roomIdRef.current) {
      getSocket().emit("webrtc:offer", {
        roomId: roomIdRef.current,
        sdp: offer,
      });
    }
  }, [createPeer]);

  const createAnswer = useCallback(async () => {
    // No-op: the persistent socket listener in the useEffect below
    // handles incoming offers and creates answers automatically.
  }, []);

  // Persistent listeners — registered once, never re-registered
  useEffect(() => {
    const socket = getSocket();

    socket.on("webrtc:offer", async (data: { sdp: RTCSessionDescriptionInit }) => {
      let pc = pcRef.current;
      if (!pc) pc = createPeer();
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (roomIdRef.current) {
        socket.emit("webrtc:answer", {
          roomId: roomIdRef.current,
          sdp: answer,
        });
      }
    });

    socket.on("webrtc:answer", async (data: { sdp: RTCSessionDescriptionInit }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
        );
      }
    });

    socket.on(
      "webrtc:ice-candidate",
      async (data: { candidate: RTCIceCandidateInit }) => {
        if (pcRef.current) {
          await pcRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      }
    );

    socket.on("webrtc:user-left", () => {
      setRemoteStream(null);
      setIsConnected(false);
      pcRef.current?.close();
      pcRef.current = null;
    });

    return () => {
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
      socket.off("webrtc:user-left");
    };
  }, [createPeer]);

  useEffect(() => {
    return () => {
      pcRef.current?.close();
    };
  }, []);

  return { remoteStream, isConnected, createOffer, createAnswer };
}
