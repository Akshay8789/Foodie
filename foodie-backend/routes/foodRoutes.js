
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

// Admin routes

router.post(
  "/",
  protect,
  admin,
  (req, res, next) => {
    console.log("Food POST route reached");
    console.log("Content-Type:", req.headers["content-type"]);
    next();
  },
  upload.single("image"),
  (req, res, next) => {
    console.log("Multer received file:", req.file);
    console.log("Multer received body:", req.body);
    next();
  },
  createFood
);


// router.put(
//   "/:id",
//   protect,
//   admin,
//   upload.single("image"),
//   updateFood
// );


router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  createFood
);

router.delete("/:id", protect, admin, deleteFood);

export default router;
