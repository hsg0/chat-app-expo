// BACKEND/routes/storeRouter.js
import express from "express";

import {
	createStoreItem,
	deleteStoreItem,
	getMyStoreItems,
	getStoreItemById,
	getStoreItems,
	updateStoreItem,
} from "../controllers/storeController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// public store routes
router.get("/", getStoreItems);

// authenticated store routes
router.get("/mine", protectUser, getMyStoreItems);
router.post("/", protectUser, createStoreItem);
router.put("/:id", protectUser, updateStoreItem);
router.delete("/:id", protectUser, deleteStoreItem);
router.get("/:id", getStoreItemById);


export default router;