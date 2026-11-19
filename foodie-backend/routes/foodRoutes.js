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

// Public
router.get(
  "/categories",
  getCategories
);

router.get("/", getFoods);

router.get("/:id", getFoodById);

// Admin
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  createFood
);

router.put(
  "/:id",
  protect,
  admin,
  upload.single("image"),
  updateFood
);

router.delete(
  "/:id",
  protect,
  admin,
  deleteFood
);

export default router;