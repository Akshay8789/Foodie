
import { useEffect, useState } from "react";
import api from "../api/axios";

const trackingSteps = [
  {
    value: "placed",
    label: "Order Placed",
    description: "Your order has been placed successfully.",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    description: "The restaurant has confirmed your order.",
  },
  {
    value: "preparing",
    label: "Preparing",
    description: "Your food is being prepared.",
  },
  {
    value: "out_for_delivery",
    label: "Out for Delivery",
    description: "Your order is on its way.",
  },
  {
    value: "delivered",
    label: "Delivered",
    description: "Your order has been delivered.",
  },
];

const OrderTracking = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }

    let active = true;

    const fetchTracking = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);

        if (active) {
          setOrder(response.data.order || response.data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load order tracking information"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTracking();

    const interval = setInterval(fetchTracking, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-tracking">
        <p>Loading order tracking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking tracking-error">
        <h2>Order Tracking</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!order) return null;

  const currentIndex = trackingSteps.findIndex(
    (step) => step.value === order.orderStatus
  );

  const isCancelled = order.orderStatus === "cancelled";
  const history = order.statusHistory || [];

  const getHistoryEntry = (status) =>
    history.filter((item) => item.status === status).slice(-1)[0];

  return (
    <section className="order-tracking">
      <div className="tracking-header">
        <h2>Track Your Order</h2>
        <p className="tracking-order-id">
          Order ID: {order._id}
        </p>
      </div>

      <div className="tracking-current">
        <span>Current Status: </span>
        <strong
          className={
            isCancelled ? "status-cancelled" : "status-active"
          }
        >
          {isCancelled
            ? "Cancelled"
            : trackingSteps[currentIndex]?.label ||
              order.orderStatus?.replaceAll("_", " ")}
        </strong>
      </div>

      {isCancelled ? (
        <div className="cancelled-message">
          <h3>Order Cancelled</h3>
          <p>Unfortunately, this order has been cancelled.</p>

          {getHistoryEntry("cancelled") && (
            <>
              <p>{getHistoryEntry("cancelled").note}</p>
              <small>
                {new Date(
                  getHistoryEntry("cancelled").updatedAt
                ).toLocaleString()}
              </small>
            </>
          )}
        </div>
      ) : (
        <div className="tracking-timeline">
          {trackingSteps.map((step, index) => {
            const completed =
              currentIndex >= 0 && index <= currentIndex;

            const historyEntry = getHistoryEntry(step.value);

            return (
              <div
                className={`tracking-step ${
                  completed ? "completed" : ""
                }`}
                key={step.value}
              >
                <div className="tracking-marker">
                  {completed ? "✓" : index + 1}
                </div>

                <div className="tracking-content">
                  <h3>{step.label}</h3>
                  <p>{step.description}</p>

                  {historyEntry && (
                    <>
                      {historyEntry.note && (
                        <p className="tracking-note">
                          {historyEntry.note}
                        </p>
                      )}

                      <small>
                        {new Date(
                          historyEntry.updatedAt
                        ).toLocaleString()}
                      </small>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="tracking-history">
        <h3>Status History</h3>

        {history.length === 0 ? (
          <p>No tracking history available.</p>
        ) : (
          [...history].reverse().map((item, index) => (
            <div
              className="history-item"
              key={`${item.status}-${item.updatedAt}-${index}`}
            >
              <strong>
                {item.status.replaceAll("_", " ").toUpperCase()}
              </strong>

              {item.note && <p>{item.note}</p>}

              <small>
                {new Date(item.updatedAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>

      <p className="tracking-refresh">
        <span>●</span> Tracking automatically refreshes every
        15 seconds.
      </p>
    </section>
  );
};

export default OrderTracking;
