// CHATAPP/src/socketsSetup/socket.js
import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.25:5020";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: false,
});