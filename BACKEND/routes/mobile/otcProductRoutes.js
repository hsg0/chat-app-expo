//
// WHAT:
// Defines the mobile OTC product API routes.
//
// WHY:
// Keeps OTC product URLs separate from controller logic.
//
// HOW:
// Each route calls one controller function.
//

import express from "express";

import {
  getOtcProductByDin,
  getOtcProducts,
  searchOtcProducts,
} from "../../controllers/mobile/otcProductController.js";

const otcProductRouter = express.Router();

otcProductRouter.get("/", getOtcProducts);

otcProductRouter.get("/search", searchOtcProducts);

otcProductRouter.get("/:din", getOtcProductByDin);

export default otcProductRouter;
