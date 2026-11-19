
import mongoose from "mongoose";

const FOOD_CATEGORIES = [
  "Burger",
  "Pizza",
  "Chinese",
  "Indian",
  "South Indian",
  "Italian",
  "Sandwich & Wraps",
  "Snacks & Fast Food",
  "Desserts",
  "Beverages",
  "Non-Veg Specials",
  "Healthy Food",
];

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: [true, "Please select a food category"],
      enum: {
        values: FOOD_CATEGORIES,
        message: "Please select a valid food category",
      },
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Food = mongoose.model("Food", foodSchema);

export default Food;
