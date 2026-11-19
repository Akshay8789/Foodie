
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Food from "../models/Food.js";

// Recalculate food rating and review count
const updateFoodRating = async (foodId) => {
  const result = await Review.aggregate([
    {
      $match: {
        food: new mongoose.Types.ObjectId(foodId),
      },
    },
    {
      $group: {
        _id: "$food",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const rating = result.length > 0
    ? Number(result[0].averageRating.toFixed(1))
    : 0;

  const numReviews = result.length > 0
    ? result[0].totalReviews
    : 0;

  await Food.findByIdAndUpdate(foodId, {
    rating,
    numReviews,
  });
};

// Create review
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        message: "Invalid food ID",
      });
    }

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    const parsedRating = Number(rating);

    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Please write a review",
      });
    }

    if (comment.trim().length > 1000) {
      return res.status(400).json({
        message: "Review cannot exceed 1000 characters",
      });
    }

    const existingReview = await Review.findOne({
      food: foodId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this food",
      });
    }

    const review = await Review.create({
      food: foodId,
      user: req.user._id,
      rating: parsedRating,
      comment: comment.trim(),
    });

    await updateFoodRating(foodId);

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name");

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this food",
      });
    }

    console.error("Create review error:", error);

    return res.status(500).json({
      message: "Failed to submit review",
    });
  }
};

// Get reviews for one food item
export const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        message: "Invalid food ID",
      });
    }

    const reviews = await Review.find({ food: foodId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      message: "Failed to fetch reviews",
    });
  }
};

// Update your own review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only edit your own review",
      });
    }

    const parsedRating = Number(rating);

    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Please write a review",
      });
    }

    if (comment.trim().length > 1000) {
      return res.status(400).json({
        message: "Review cannot exceed 1000 characters",
      });
    }

    review.rating = parsedRating;
    review.comment = comment.trim();

    await review.save();
    await updateFoodRating(review.food);

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return res.status(500).json({
      message: "Failed to update review",
    });
  }
};

// Delete your own review or any review as admin
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const isOwner =
      review.user.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to delete this review",
      });
    }

    const foodId = review.food;

    await review.deleteOne();
    await updateFoodRating(foodId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      message: "Failed to delete review",
    });
  }
};
