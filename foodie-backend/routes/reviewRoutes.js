
import express from "express";

import {
  createReview,
  getFoodReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: get reviews for food
router.get("/:foodId", getFoodReviews);

// Logged-in user: create review
router.post("/:foodId", protect, createReview);

// Logged-in user: edit own review
router.put("/:reviewId", protect, updateReview);

// Owner or admin: delete review
router.delete("/:reviewId", protect, deleteReview);

export default router;
