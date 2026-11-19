import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/orderController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Razorpay routes
router.post("/razorpay/create", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

// COD order
router.post("/", protect, createOrder);

// User orders
router.get("/my-orders", protect, getMyOrders);

// Admin orders
router.get("/", protect, admin, getAllOrders);

// Single order
router.get("/:id", protect, getOrderById);

// Update order status
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;