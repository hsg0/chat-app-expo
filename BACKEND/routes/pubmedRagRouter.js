// BACKEND/routes/pubmedRagRouter.js

import express from "express";

import { chatWithPubMedRag } from "../controllers/pubmedRagController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const pubmedRagRouter = express.Router();

pubmedRagRouter.post("/chat", protectUser, chatWithPubMedRag);

export default pubmedRagRouter;
