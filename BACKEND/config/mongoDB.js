// BACKEND/config/db.js

import mongoose from "mongoose";

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const mongoDbName = process.env.MONGO_DB_NAME || "chat_app_expo";

    if (!mongoUri) {
      console.log("MongoDB connection skipped: MONGO_URI is missing.");
      return;
    }

    await mongoose.connect(mongoUri, {
      dbName: mongoDbName,
      maxPoolSize: 20,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB connected: ${mongoDbName}`);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  }
}

export function getDBStatus() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    readyState: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState] || "unknown",
    database: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
  };
}