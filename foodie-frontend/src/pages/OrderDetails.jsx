import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// import api from "../services/api";
import api from "../api/axios";
import OrderTracking from "../components/OrderTracking";

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/orders/${id}`);

        setOrder(response.data.order || response.data);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load order details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <p className="page-message">Loading order details...</p>;
  }

  if (error) {
    return (
      <div className="page-message">
        <p>{error}</p>
        <Link to="/orders">Back to My Orders</Link>
      </div>
    );
  }

  if (!order) {
    return <p className="page-message">Order not found.</p>;
  }

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <div className="order-details-header">
          <h1>Order Details</h1>

          <Link to="/orders" className="back-link">
            ← Back to My Orders
          </Link>
        </div>

        {/* Order Information */}
        <section className="order-info-section">
          <h2>Order Information</h2>

          <p>
            <strong>Order ID:</strong> {order._id}
          </p>

          <p>
            <strong>Order Date:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>

          <p>
            <strong>Order Status:</strong>{" "}
            <span className="order-status">
              {order.orderStatus?.replaceAll("_", " ")}
            </span>
          </p>

          <p>
            <strong>Payment Method:</strong>{" "}
            {order.paymentMethod}
          </p>

          <p>
            <strong>Payment Status:</strong>{" "}
            {order.paymentStatus}
          </p>
        </section>

        {/* Ordered Items */}
        <section className="order-items-section">
          <h2>Ordered Items</h2>

          {order.items?.map((item, index) => (
            <div
              className="order-item"
              key={item._id || `${item.food}-${index}`}
            >
              <img
                src={item.image || "/placeholder.png"}
                alt={item.name}
              />

              <div className="order-item-info">
                <h3>{item.name}</h3>

                <p>Quantity: {item.quantity}</p>

                <p>
                  Price: ₹{item.price} × {item.quantity}
                </p>

                <strong>
                  ₹{item.price * item.quantity}
                </strong>
              </div>
            </div>
          ))}
        </section>

        {/* Price Summary */}
        <section className="order-summary-section">
          <h2>Price Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₹{order.deliveryFee}</span>
          </div>

          <div className="summary-row total-row">
            <strong>Total Amount</strong>
            <strong>₹{order.totalAmount}</strong>
          </div>
        </section>

        {/* Delivery Address */}
        <section className="delivery-address-section">
          <h2>Delivery Address</h2>

          <p>
            <strong>{order.deliveryAddress?.fullName}</strong>
          </p>

          <p>{order.deliveryAddress?.phone}</p>

          <p>{order.deliveryAddress?.address}</p>

          <p>
            {order.deliveryAddress?.city} -{" "}
            {order.deliveryAddress?.pincode}
          </p>
        </section>

        {/* Order Tracking */}
        <OrderTracking orderId={order._id} />

      </div>
    </div>
  );
};

export default OrderDetails;