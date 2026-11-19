
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import loadRazorpay from "../utils/loadRazorpay";

import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryFee = 40;
  const totalAmount = subtotal + deliveryFee;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate checkout form
  const validateForm = () => {
    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.pincode.trim()
    ) {
      setError("Please fill all delivery details.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Enter a valid 10-digit phone number.");
      return false;
    }

    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      setError("Enter a valid 6-digit pincode.");
      return false;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return false;
    }

    return true;
  };

  // Prepare order data
  const getOrderData = () => ({
    items: cartItems.map((item) => ({
      food: item._id || item.food,
      quantity: Number(item.quantity),
    })),

    deliveryAddress: {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      pincode: formData.pincode.trim(),
    },
  });

  // ========================================
  // CASH ON DELIVERY
  // ========================================
  const handleCOD = async () => {
    try {
      const response = await api.post("/orders", {
        ...getOrderData(),
        paymentMethod: "COD",
      });

      const order = response.data.order;

      if (!order?._id) {
        throw new Error("Order creation failed.");
      }

      clearCart();

      alert("Order placed successfully!");

      navigate(`/orders/${order._id}`);
    } catch (err) {
      console.error(
        "COD order error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to place your order."
      );
    }
  };

  // ========================================
  // RAZORPAY ONLINE PAYMENT
  // ========================================
  const handleRazorpay = async () => {
    try {
      // Step 1: Load Razorpay SDK
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error("Razorpay SDK failed to load.");
      }

      // Step 2: Create Foodie order and Razorpay order
      const response = await api.post(
        "/orders/razorpay/create",
        getOrderData()
      );

      console.log(
        "Razorpay backend response:",
        response.data
      );

      // Backend response fields from your orderController.js
      const {
        key,
        orderId,
        razorpayOrderId,
        amount,
        currency,
      } = response.data;

      // Step 3: Validate response
      if (!key || !orderId || !razorpayOrderId || !amount) {
        throw new Error(
          "Invalid Razorpay order response. Check backend response."
        );
      }

      // Step 4: Open Razorpay checkout
      const options = {
        key: key,

        amount: amount,
        currency: currency,

        name: "Foodie",
        description: "Food Order Payment",

        // Razorpay gateway order ID
        order_id: razorpayOrderId,

        prefill: {
          name: formData.fullName,
          email: user?.email || "",
          contact: formData.phone,
        },

        theme: {
          color: "#ff6b35",
        },

        // Step 5: Verify payment on backend
        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await api.post(
              "/orders/razorpay/verify",
              {
                // MongoDB Foodie order ID
                orderId: orderId,

                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              clearCart();

              alert(
                "Payment successful! Your order is confirmed."
              );

              navigate(`/orders/${orderId}`);
            } else {
              setError("Payment verification failed.");
              setLoading(false);
            }
          } catch (verifyError) {
            console.error(
              "Payment verification error:",
              verifyError.response?.data || verifyError
            );

            setError(
              verifyError.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );

            setLoading(false);
          }
        },

        // User closes Razorpay window
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      // Handle payment failure
      paymentObject.on(
        "payment.failed",
        function (paymentError) {
          console.error(
            "Payment failed:",
            paymentError.error
          );

          setError(
            paymentError.error?.description ||
              "Payment failed. Please try again."
          );

          setLoading(false);
        }
      );

      paymentObject.open();
    } catch (err) {
      console.error(
        "Razorpay payment error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start payment."
      );

      setLoading(false);
    }
  };

  // ========================================
  // PLACE ORDER
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "COD") {
        await handleCOD();
      } else if (paymentMethod === "RAZORPAY") {
        await handleRazorpay();
      }
    } finally {
      // Razorpay remains loading while its checkout is open.
      // Its success, failure and dismissal handlers reset it.
      if (paymentMethod === "COD") {
        setLoading(false);
      }
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {error && (
        <div className="checkout-error">
          {error}
        </div>
      )}

      <div className="checkout-container">

        {/* DELIVERY DETAILS */}
        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          <h2>Delivery Address</h2>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength="10"
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House number, street, area"
              required
            />
          </div>

          <div className="form-group">
            <label>City</label>

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              required
            />
          </div>

          <div className="form-group">
            <label>Pincode</label>

            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              maxLength="6"
              required
            />
          </div>

          {/* PAYMENT METHOD */}
          <h2>Payment Method</h2>

          <div className="payment-options">

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              Cash on Delivery
            </label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="RAZORPAY"
                checked={paymentMethod === "RAZORPAY"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              Pay Online (Razorpay)
            </label>

          </div>

          <button
            type="submit"
            className="place-order-btn"
            disabled={loading || cartItems.length === 0}
          >
            {loading
              ? "Processing..."
              : paymentMethod === "COD"
              ? "Place Order"
              : "Pay Now"}
          </button>
        </form>

        {/* ORDER SUMMARY */}
        <div className="checkout-summary">

          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div
              className="summary-item"
              key={item._id || item.food}
            >
              <span>
                {item.name} × {item.quantity}
              </span>

              <strong>
                ₹
                {Number(item.price) *
                  Number(item.quantity)}
              </strong>
            </div>
          ))}

          <hr />

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>₹{subtotal}</strong>
          </div>

          <div className="summary-row">
            <span>Delivery Fee</span>
            <strong>₹{deliveryFee}</strong>
          </div>

          <hr />

          <div className="summary-row total">
            <span>Total</span>
            <strong>₹{totalAmount}</strong>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
