// BACKEND/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB, getDBStatus } from "./config/mongoDB.js";
import authRouter from "./routes/authRouter.js";
import mediaRouter from "./routes/mediaRouter.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5020;
const HOST = process.env.HOST || "localhost";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:8081";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
// Middleware to parse JSON request bodies
app.use(express.json());
//-----------------------------------------------------------------
// Routes

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
  await connectDB();

  app.listen(PORT, HOST, () => {
    console.log(`Backend running at http://${HOST}:${PORT}`);
  });
}

startServer();