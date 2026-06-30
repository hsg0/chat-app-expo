// BACKEND/routes/mediaRouter.js

import express from "express";

import { protectUser } from "../middleware/authMiddleware.js";
import { getImageKitUploadAuth } from "../controllers/mediaController.js";

const mediaRouter = express.Router();

mediaRouter.get("/imagekit-auth", protectUser, getImageKitUploadAuth);

export default mediaRouter;