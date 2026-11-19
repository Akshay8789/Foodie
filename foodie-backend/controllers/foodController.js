
import mongoose from "mongoose";
import Food from "../models/Food.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// All valid food categories (must match Food.js)
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

// Normalize category capitalization and whitespace
const normalizeCategory = (value) => {
  if (typeof value !== "string") return null;

  const normalizedValue = value.trim().toLowerCase();

  return (
    FOOD_CATEGORIES.find(
      (category) =>
        category.toLowerCase() === normalizedValue
    ) || null
  );
};

// Escape special regex characters
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Parse boolean values
const parseBoolean = (value, defaultValue = true) => {
  if (value === undefined) return defaultValue;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
};

// GET /api/foods
// Search, category, price filters and sorting
export const getFoods = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;

    const filter = { isAvailable: true };

    if (search?.trim()) {
      const term = escapeRegex(search.trim());

      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ];
    }

    if (category?.trim() && category.trim() !== "All") {
      filter.category = {
        $regex: `^${escapeRegex(category.trim())}$`,
        $options: "i",
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        const min = Number(minPrice);

        if (
          minPrice.trim() === "" ||
          !Number.isFinite(min) ||
          min < 0
        ) {
          return res.status(400).json({
            message: "minPrice must be a valid non-negative number",
          });
        }

        filter.price.$gte = min;
      }

      if (maxPrice !== undefined) {
        const max = Number(maxPrice);

        if (
          maxPrice.trim() === "" ||
          !Number.isFinite(max) ||
          max < 0
        ) {
          return res.status(400).json({
            message: "maxPrice must be a valid non-negative number",
          });
        }

        filter.price.$lte = max;
      }

      if (
        filter.price.$gte !== undefined &&
        filter.price.$lte !== undefined &&
        filter.price.$gte > filter.price.$lte
      ) {
        return res.status(400).json({
          message: "minPrice cannot exceed maxPrice",
        });
      }
    }

    const sortOptions = {
      low: { price: 1 },
      high: { price: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      name: { name: 1 },
      newest: { createdAt: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    const foods = await Food.find(filter).sort(sortBy);

    return res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Get foods error:", error);

    return res.status(500).json({
      message: "Failed to fetch foods",
    });
  }
};

// GET /api/foods/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Food.distinct("category", {
      isAvailable: true,
    });

    categories.sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      message: "Failed to fetch food categories",
    });
  }
};

// GET /api/foods/:id
export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid food ID",
      });
    }

    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    return res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    console.error("Get food by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch food",
    });
  }
};

// POST /api/foods
// Admin only; expects multipart/form-data with image field
export const createFood = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      price === undefined ||
      price === "" ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        message: "Name, description, price and category are required",
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    const normalizedCategory = normalizeCategory(category);

    if (!normalizedCategory) {
      return res.status(400).json({
        message: "Please select a valid food category",
        validCategories: FOOD_CATEGORIES,
      });
    }

    const available = parseBoolean(isAvailable);

    if (available === null) {
      return res.status(400).json({
        message: "isAvailable must be true or false",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: "Food image is required. Please select an image file.",
      });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer);

    if (!uploadResult?.secure_url) {
      throw new Error("Cloudinary did not return a secure image URL");
    }

    const food = await Food.create({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: normalizedCategory,
      image: uploadResult.secure_url,
      isAvailable: available,
    });

    return res.status(201).json({
      success: true,
      message: "Food created successfully",
      food,
    });
  } catch (error) {
    console.error("Create food error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(409).json({
        message: "A food with this unique value already exists",
      });
    }

    return res.status(500).json({
      message: error.message || "Failed to create food",
    });
  }
};

// PUT /api/foods/:id
// Admin only; image is optional when updating
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid food ID",
      });
    }

    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    const { name, description, price, category, isAvailable } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      food.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          message: "Description cannot be empty",
        });
      }

      food.description = description.trim();
    }

    if (price !== undefined) {
      if (price === "") {
        return res.status(400).json({
          message: "Price is required",
        });
      }

      const numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          message: "Price must be a valid non-negative number",
        });
      }

      food.price = numericPrice;
    }

    if (category !== undefined) {
      const normalizedCategory = normalizeCategory(category);

      if (!normalizedCategory) {
        return res.status(400).json({
          message: "Please select a valid food category",
          validCategories: FOOD_CATEGORIES,
        });
      }

      food.category = normalizedCategory;
    }

    if (isAvailable !== undefined) {
      const available = parseBoolean(isAvailable, null);

      if (available === null) {
        return res.status(400).json({
          message: "isAvailable must be true or false",
        });
      }

      food.isAvailable = available;
    }

    // Keep existing image unless a new image is uploaded
    if (req.file) {
      if (!req.file.buffer) {
        return res.status(400).json({
          message: "Uploaded image buffer is missing",
        });
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer);

      if (!uploadResult?.secure_url) {
        throw new Error("Cloudinary did not return a secure image URL");
      }

      food.image = uploadResult.secure_url;
    }

    await food.save();

    return res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    console.error("Update food error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: error.message || "Failed to update food",
    });
  }
};

// DELETE /api/foods/:id
// Admin only
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid food ID",
      });
    }

    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    await food.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    console.error("Delete food error:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete food",
    });
  }
};
