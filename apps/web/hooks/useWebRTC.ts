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

  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        getSocket().emit("webrtc:ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);
      onRemoteStream(stream);
      setIsConnected(true);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected") {
        setIsConnected(false);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  }, [localStream, roomId, onRemoteStream]);

  const createOffer = useCallback(async () => {
    const pc = createPeer();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (roomId) {
      getSocket().emit("webrtc:offer", { roomId, sdp: offer });
    }
  }, [createPeer, roomId]);

  const createAnswer = useCallback(async () => {
    const pc = createPeer();
    const offer = await new Promise<RTCSessionDescriptionInit>((resolve) => {
      getSocket().once("webrtc:offer", (data) => resolve(data.sdp));
    });
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (roomId) {
      getSocket().emit("webrtc:answer", { roomId, sdp: answer });
    }
  }, [createPeer, roomId]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("webrtc:offer", async (data: { sdp: RTCSessionDescriptionInit }) => {
      let pc = pcRef.current;
      if (!pc) pc = createPeer();
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (roomId) {
        socket.emit("webrtc:answer", { roomId, sdp: answer });
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
  }, [createPeer, roomId]);

  useEffect(() => {
    return () => {
      pcRef.current?.close();
    };
  }, []);

  return { remoteStream, isConnected, createOffer, createAnswer };
}
