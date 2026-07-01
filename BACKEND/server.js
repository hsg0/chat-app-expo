// BACKEND/server.js
import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { connectDB, getDBStatus } from "./config/mongoDB.js";
import authRouter from "./routes/authRouter.js";
import mediaRouter from "./routes/mediaRouter.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5020;
const HOST = process.env.HOST || "0.0.0.0";

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  try {
    const rawToken = socket.handshake.auth?.token;
    const token = String(rawToken || "").replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return next(new Error("Socket auth token is missing."));
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return next(new Error("JWT_SECRET is missing on server."));
    }

    const decoded = jwt.verify(token, jwtSecret);

    socket.user = {
      id: decoded.id,
      email: decoded.email,
      handle: decoded.handle,
    };

    return next();
  } catch (error) {
    return next(new Error("Socket authentication failed."));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id, "user:", socket.user?.id);

  socket.on("join-room", (roomId) => {
    const cleanRoomId = String(roomId || "").trim();

    if (!cleanRoomId) {
      return;
    }

    socket.join(cleanRoomId);
    console.log(`Socket ${socket.id} joined room ${cleanRoomId}`);
  });

  socket.on("leave-room", (roomId) => {
    const cleanRoomId = String(roomId || "").trim();

    if (!cleanRoomId) {
      return;
    }

    socket.leave(cleanRoomId);
    console.log(`Socket ${socket.id} left room ${cleanRoomId}`);
  });

  socket.on("send-message", (data) => {
    const text = String(data?.text || "").trim();
    const conversationId = String(data?.conversationId || "").trim();

    if (!text || !conversationId) {
      return;
    }

    console.log("Message received:", { conversationId, sender: socket.user?.id });

    const messageData = {
      text,
      conversationId,
      senderId: socket.user?.id || "unknown",
      createdAt: new Date().toISOString(),
    };

    socket.to(conversationId).emit("receive-message", messageData);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use("/api/auth", authRouter);
app.use("/api/media", mediaRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat app backend is running.",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "chat-app-backend",
    mongooseVersion: mongoose.version,
    time: new Date().toISOString(),
  });
});

app.get("/db-health", (req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    success: dbStatus.status === "connected",
    database: dbStatus,
    time: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, HOST, () => {
      console.log(`Backend running at http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();