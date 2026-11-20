
import express from "express";

import {
  getFoods,
  getFoodById,
  getCategories,
  createFood,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/categories", getCategories);
router.get("/", getFoods);
router.get("/:id", getFoodById);

// Admin: Create food
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  createFood
);

// Admin: Update food
router.put(
  "/:id",
  protect,
  admin,
  upload.single("image"),
  updateFood
);

// Admin: Delete food
router.delete(
  "/:id",
  protect,
  admin,
  deleteFood
);

export default router;
