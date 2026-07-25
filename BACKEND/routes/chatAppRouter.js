// BACKEND/routes/chatAppRouter.js
//
// WHAT:
// Chat session routes for the fictional medication agent.
//
// HOW:
// POST /api/chat/chat              → start a new thread
// POST /api/chat/chat/:threadId    → continue an existing thread
// POST /api/chat/chat-history      → return stored messages
// POST /api/chat/chat-summary      → summarize a thread

import express from "express";

import {
  chatAppController,
  chatAppHistoryController,
  chatAppSummaryController,
  chatThreadIdController,
} from "../controllers/chatAppController.js";

const chatAppRouter = express.Router();

chatAppRouter.post("/chat", chatAppController);
chatAppRouter.post("/chat/:threadId", chatThreadIdController);
chatAppRouter.post("/chat-history", chatAppHistoryController);
chatAppRouter.post("/chat-summary", chatAppSummaryController);

export default chatAppRouter;
