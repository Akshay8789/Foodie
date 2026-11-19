
import mongoose from "mongoose";
import crypto from "crypto";

import Order from "../models/Order.js";
import Food from "../models/Food.js";
import createRazorpayInstance from "../config/razorpay.js";

// ========================================
// CREATE COD ORDER
// ========================================
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    const {
      fullName,
      phone,
      address,
      city,
      pincode,
    } = deliveryAddress;

    if (!fullName || !phone || !address || !city || !pincode) {
      return res.status(400).json({
        message: "Please provide complete delivery address",
      });
    }

    if (paymentMethod && paymentMethod !== "COD") {
      return res.status(400).json({
        message: "Use Razorpay endpoint for online payments",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (
        !mongoose.Types.ObjectId.isValid(item.food) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid food ID or quantity",
        });
      }

      const food = await Food.findById(item.food);

      if (!food) {
        return res.status(404).json({
          message: `Food not found: ${item.food}`,
        });
      }

      if (!food.isAvailable) {
        return res.status(400).json({
          message: `${food.name} is currently unavailable`,
        });
      }

      subtotal += food.price * item.quantity;

      orderItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: item.quantity,
        image: food.image,
      });
    }

    const deliveryFee = 40;
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,

      deliveryAddress: {
        fullName,
        phone,
        address,
        city,
        pincode,
      },

      subtotal,
      deliveryFee,
      totalAmount,

      paymentMethod: "COD",
      paymentStatus: "pending",
      orderStatus: "placed",

      // Initial tracking history
      statusHistory: [
        {
          status: "placed",
          note: "Your order has been placed successfully",
          updatedAt: new Date(),
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// GET MY ORDERS
// ========================================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// GET ORDER BY ID
// ========================================
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const isOwner =
      order.user._id.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Not authorized to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// GET ALL ORDERS (ADMIN)
// ========================================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// UPDATE ORDER STATUS (ADMIN)
// ========================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = [
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (["delivered", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "This order is already completed or cancelled",
      });
    }

    if (order.orderStatus === status) {
      return res.status(200).json({
        success: true,
        message: "Order already has this status",
        order,
      });
    }

    // Prevent delivery of an unpaid Razorpay order.
    if (
      status === "delivered" &&
      order.paymentMethod === "RAZORPAY" &&
      order.paymentStatus !== "paid"
    ) {
      return res.status(400).json({
        message: "Cannot deliver an unpaid online order",
      });
    }

    order.orderStatus = status;

    order.statusHistory.push({
      status,
      note:
        typeof note === "string" && note.trim()
          ? note.trim()
          : `Order status updated to ${status.replaceAll("_", " ")}`,
      updatedAt: new Date(),
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// CREATE RAZORPAY ORDER
// ========================================
export const createRazorpayOrder = async (req, res) => {
  let order;

  try {
    const { items, deliveryAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    const {
      fullName,
      phone,
      address,
      city,
      pincode,
    } = deliveryAddress;

    if (!fullName || !phone || !address || !city || !pincode) {
      return res.status(400).json({
        message: "Please provide complete delivery address",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (
        !mongoose.Types.ObjectId.isValid(item.food) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid food ID or quantity",
        });
      }

      const food = await Food.findById(item.food);

      if (!food) {
        return res.status(404).json({
          message: `Food not found: ${item.food}`,
        });
      }

      if (!food.isAvailable) {
        return res.status(400).json({
          message: `${food.name} is currently unavailable`,
        });
      }

      subtotal += food.price * item.quantity;

      orderItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: item.quantity,
        image: food.image,
      });
    }

    const deliveryFee = 40;
    const totalAmount = subtotal + deliveryFee;

    // Create local order
    order = await Order.create({
      user: req.user._id,
      items: orderItems,

      deliveryAddress: {
        fullName,
        phone,
        address,
        city,
        pincode,
      },

      subtotal,
      deliveryFee,
      totalAmount,

      paymentMethod: "RAZORPAY",
      paymentStatus: "pending",
      orderStatus: "placed",

      // Initial tracking history
      statusHistory: [
        {
          status: "placed",
          note: "Your order has been placed successfully",
          updatedAt: new Date(),
        },
      ],
    });

    const razorpay = createRazorpayInstance();

    // Create Razorpay order (amount is in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),

      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    // Mark local order as cancelled if gateway order creation fails.
    if (order) {
      order.orderStatus = "cancelled";

      order.statusHistory.push({
        status: "cancelled",
        note: "Payment gateway order creation failed",
        updatedAt: new Date(),
      });

      await order.save().catch((saveError) => {
        console.error("Failed to update cancelled order:", saveError);
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// VERIFY RAZORPAY PAYMENT
// ========================================
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification details are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        message: "Razorpay order ID mismatch",
      });
    }

    if (order.paymentStatus === "paid") {
      if (order.razorpayPaymentId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          order,
        });
      }

      return res.status(400).json({
        message: "A different payment has already been recorded",
      });
    }

    if (
      !process.env.RAZORPAY_KEY_SECRET ||
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    const generatedBuffer = Buffer.from(generatedSignature, "hex");

    if (
      receivedBuffer.length !== generatedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, generatedBuffer)
    ) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const razorpay = createRazorpayInstance();

    // Confirm payment directly with Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        message: "Payment details could not be verified",
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = "paid";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
