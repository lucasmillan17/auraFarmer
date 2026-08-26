import type { Server, Socket } from "socket.io";

export function setupSignaling(io: Server) {
  io.on("connection", (socket) => {
    socket.on("webrtc:join-room", (roomId: string) => {
      socket.join(roomId);

      const room = io.sockets.adapter.rooms.get(roomId);
      const size = room ? room.size : 0;

      if (size === 2) {
        io.to(roomId).emit("webrtc:user-joined", { socketId: socket.id });
      }
    });

    socket.on("webrtc:offer", (data: { roomId: string; sdp: unknown }) => {
      socket
        .to(data.roomId)
        .emit("webrtc:offer", { sdp: data.sdp, from: socket.id });
    });

    socket.on("webrtc:answer", (data: { roomId: string; sdp: unknown }) => {
      socket
        .to(data.roomId)
        .emit("webrtc:answer", { sdp: data.sdp, from: socket.id });
    });

    socket.on(
      "webrtc:ice-candidate",
      (data: { roomId: string; candidate: unknown }) => {
        socket.to(data.roomId).emit("webrtc:ice-candidate", {
          candidate: data.candidate,
          from: socket.id,
        });
      }
    );

    socket.on("webrtc:leave-room", (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit("webrtc:user-left", { socketId: socket.id });
    });
  });
}
