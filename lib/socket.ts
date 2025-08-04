import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL as string, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected globally:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected globally");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error globally:", err);
    });
  }

  return socket;
};
