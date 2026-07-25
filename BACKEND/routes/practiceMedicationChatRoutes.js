// BACKEND/routes/practiceMedicationChatRoutes.js
//
// WHAT:
// Defines the HTTP route for the fictional medication chat agent.
//
// WHY:
// Gives Postman, Expo, or another frontend one clean endpoint
// for sending messages to the LangGraph workflow.
//
// HOW:
// POST /api/practice-medications/chat
//   ↓
// practiceMedicationChatController
//   ↓
// LangGraph medication agent
//
// IMPORTANT:
// This route is for fictional software-development data only.

import express from "express";

import { chatWithPracticeMedicationAgent } from "../controllers/practiceMedicationChatController.js";

const practiceMedicationChatRouter = express.Router();

practiceMedicationChatRouter.post(
  "/chat",
  chatWithPracticeMedicationAgent
);

export default practiceMedicationChatRouter;
