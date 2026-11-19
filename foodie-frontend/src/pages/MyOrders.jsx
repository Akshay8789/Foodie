
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// import api from "../services/api";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./MyOrders.css";

const MyOrders = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError("");

        const response = await api.get("/orders/my-orders");

        setOrders(response.data.orders || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const formatStatus = (status) => {
    return status
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "delivered":
        return "delivered";

      case "out_for_delivery":
        return "out-for-delivery";

      case "preparing":
        return "preparing";

      case "confirmed":
        return "confirmed";

      case "cancelled":
        return "cancelled";

      default:
        return "placed";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="orders-message-page">
        <div className="orders-message-card">
          <div className="orders-message-icon">🔐</div>
          <h2>Please Login First</h2>
          <p>Login to view and track your food orders.</p>

          <Link to="/login" className="orders-shop-btn">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-message-page">
        <div className="orders-message-card">
          <div className="orders-loader"></div>
          <h2>Loading Your Orders</h2>
          <p>Please wait while we fetch your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-hero">
        <div>
          <span className="orders-eyebrow">
            FOODIEE • ORDER HISTORY
          </span>

          <h1>My Orders</h1>

          <p>
            Track your delicious moments and manage your
            previous orders.
          </p>
        </div>

        <div className="orders-hero-icon">🛍️</div>
      </div>

      <div className="orders-content">
        <div className="orders-summary">
          <div>
            <span className="summary-icon">📦</span>
            <div>
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div>
            <span className="summary-icon">🍽️</span>
            <div>
              <h3>
                {orders.filter(
                  (order) => order.orderStatus === "delivered"
                ).length}
              </h3>
              <p>Delivered</p>
            </div>
          </div>

          <div>
            <span className="summary-icon">🚚</span>
            <div>
              <h3>
                {orders.filter((order) =>
                  ["placed", "confirmed", "preparing", "out_for_delivery"]
                    .includes(order.orderStatus)
                ).length}
              </h3>
              <p>Active Orders</p>
            </div>
          </div>
        </div>

        <div className="orders-section-heading">
          <div>
            <h2>Recent Orders</h2>
            <p>Your complete food ordering history</p>
          </div>

          <Link to="/" className="orders-browse-link">
            + Order More
          </Link>
        </div>

        {error && (
          <div className="orders-error">
            ⚠️ {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-order-icon">🍔</div>
            <h2>No Orders Yet!</h2>
            <p>
              Looks like you haven't ordered anything.
              Explore our delicious menu and place your first order.
            </p>

            <Link to="/" className="orders-shop-btn">
              Explore Foods →
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-card-top">
                  <div className="order-number">
                    <span className="order-box-icon">📦</span>

                    <div>
                      <strong>
                        Order #{order._id.slice(-6).toUpperCase()}
                      </strong>

                      <p>
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`order-status ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    <span className="status-dot"></span>
                    {formatStatus(order.orderStatus)}
                  </span>
                </div>

                <div className="order-card-divider"></div>

                <div className="order-card-bottom">
                  <div className="order-total">
                    <span>Total Amount</span>
                    <strong>
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </strong>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="view-order-btn"
                  >
                    View Details <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="orders-footer">
        <span>❤️</span> Thank you for choosing Foodiee!
      </div>
    </div>
  );
};

export default MyOrders;
