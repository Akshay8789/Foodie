
import { useEffect, useState } from "react";
// import api from "../services/api";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

// Available food categories
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

const initialFoodForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: null,
  isAvailable: true,
};

const AdminDashboard = () => {
  const { user } = useAuth();

  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingFoodId, setEditingFoodId] = useState(null);
  const [foodForm, setFoodForm] = useState(initialFoodForm);

  // FETCH FOODS AND ORDERS
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [foodResponse, orderResponse] = await Promise.all([
        api.get("/foods"),
        api.get("/orders"),
      ]);

      setFoods(
        Array.isArray(foodResponse.data)
          ? foodResponse.data
          : foodResponse.data.foods || []
      );

      setOrders(orderResponse.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load admin dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // DASHBOARD STATISTICS
  const totalRevenue = orders.reduce(
    (total, order) =>
      total + Number(order.totalAmount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) =>
      !["delivered", "cancelled"].includes(order.orderStatus)
  ).length;

  const availableFoods = foods.filter(
    (food) => food.isAvailable
  ).length;

  // FOOD FORM HANDLING
  const handleFoodChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFoodForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0] || null
          : value,
    }));
  };

  // ADD OR UPDATE FOOD
  const handleFoodSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      // Validate category
      if (!FOOD_CATEGORIES.includes(foodForm.category)) {
        setError("Please select a valid food category.");
        return;
      }

      const formData = new FormData();

      formData.append("name", foodForm.name.trim());
      formData.append(
        "description",
        foodForm.description.trim()
      );
      formData.append("price", foodForm.price);
      formData.append(
        "category",
        foodForm.category.trim()
      );
      formData.append(
        "isAvailable",
        String(foodForm.isAvailable)
      );

      if (foodForm.image) {
        formData.append("image", foodForm.image);
      }

      if (editingFoodId) {
        await api.put(
          `/foods/${editingFoodId}`,
          formData
        );

        setMessage("Food updated successfully!");
      } else {
        if (!foodForm.image) {
          setError("Please select a food image.");
          return;
        }

        await api.post("/foods", formData);

        setMessage("Food added successfully!");
      }

      setFoodForm({ ...initialFoodForm });
      setEditingFoodId(null);

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save food"
      );
    }
  };

  // EDIT FOOD
  const handleEditFood = (food) => {
    setEditingFoodId(food._id);

    // Match category without case sensitivity
    const selectedCategory = FOOD_CATEGORIES.find(
      (category) =>
        category.toLowerCase() ===
        food.category?.trim().toLowerCase()
    );

    setFoodForm({
      name: food.name || "",
      description: food.description || "",
      price: food.price ?? "",
      category: selectedCategory || "",
      image: null,
      isAvailable: food.isAvailable ?? true,
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // CANCEL EDIT
  const handleCancelEdit = () => {
    setEditingFoodId(null);
    setFoodForm({ ...initialFoodForm });
    setError("");
    setMessage("");
  };

  // DELETE FOOD
  const handleDeleteFood = async (foodId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this food?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/foods/${foodId}`);

      setMessage("Food deleted successfully!");

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete food"
      );
    }
  };

  // UPDATE ORDER STATUS
  const handleStatusChange = async (orderId, status) => {
    try {
      setError("");
      setMessage("");

      await api.put(`/orders/${orderId}/status`, {
        status,
        note: `Admin updated order status to ${status.replaceAll(
          "_",
          " "
        )}`,
      });

      setMessage("Order status updated successfully!");

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update order status"
      );
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* DASHBOARD HEADER */}
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">
            FOODIEE MANAGEMENT
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Welcome back,{" "}
            <strong>{user?.name || "Admin"}</strong>!
            Here's what's happening with your restaurant.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          type="button"
          onClick={fetchData}
        >
          ↻ Refresh Data
        </button>
      </header>

      {/* MESSAGES */}
      {message && (
        <div className="admin-alert admin-success">
          <span>✓</span> {message}

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="admin-alert admin-error">
          <span>!</span> {error}

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <section className="admin-stats">
        <div className="stat-card stat-orange">
          <div className="stat-icon">🍔</div>
          <div>
            <p>Total Foods</p>
            <h2>{foods.length}</h2>
            <span>Food items in menu</span>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">✓</div>
          <div>
            <p>Available Foods</p>
            <h2>{availableFoods}</h2>
            <span>Currently available</span>
          </div>
        </div>

        <div className="stat-card stat-blue">
          <div className="stat-icon">📦</div>
          <div>
            <p>Total Orders</p>
            <h2>{orders.length}</h2>
            <span>Orders received</span>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">⏳</div>
          <div>
            <p>Active Orders</p>
            <h2>{pendingOrders}</h2>
            <span>Not yet completed</span>
          </div>
        </div>

        <div className="stat-card stat-revenue">
          <div className="stat-icon">₹</div>
          <div>
            <p>Total Order Value</p>
            <h2>
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h2>
            <span>Value of all orders</span>
          </div>
        </div>
      </section>

      {/* ADD / EDIT FOOD */}
      <section className="admin-section" id="add-food">
        <div className="section-heading">
          <div>
            <span className="admin-eyebrow">
              MENU MANAGEMENT
            </span>

            <h2>
              {editingFoodId
                ? "Edit Food Item"
                : "Add New Food"}
            </h2>

            <p>
              {editingFoodId
                ? "Update your existing food details."
                : "Add delicious new items to your Foodiee menu."}
            </p>
          </div>

          <span className="section-heading-icon">
            🍕
          </span>
        </div>

        <form
          className="admin-food-form"
          onSubmit={handleFoodSubmit}
        >
          <div className="food-form-grid">
            {/* FOOD NAME */}
            <div className="form-group">
              <label htmlFor="food-name">
                Food Name{" "}
                <span className="required-star">*</span>
              </label>

              <input
                id="food-name"
                type="text"
                name="name"
                placeholder="e.g. Cheese Burger"
                value={foodForm.name}
                onChange={handleFoodChange}
                required
              />
            </div>

            {/* FOOD PRICE */}
            <div className="form-group">
              <label htmlFor="food-price">
                Price (₹){" "}
                <span className="required-star">*</span>
              </label>

              <input
                id="food-price"
                type="number"
                name="price"
                placeholder="e.g. 199"
                min="0"
                step="0.01"
                value={foodForm.price}
                onChange={handleFoodChange}
                required
              />
            </div>

            {/* FOOD DESCRIPTION */}
            <div className="form-group form-full">
              <label htmlFor="food-description">
                Food Description{" "}
                <span className="required-star">*</span>
              </label>

              <textarea
                id="food-description"
                name="description"
                placeholder="Describe your delicious food..."
                value={foodForm.description}
                onChange={handleFoodChange}
                required
              />
            </div>

            {/* FOOD CATEGORY */}
            <div className="form-group">
              <label htmlFor="food-category">
                Food Category{" "}
                <span className="required-star">*</span>
              </label>

              <select
                id="food-category"
                name="category"
                value={foodForm.category}
                onChange={handleFoodChange}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>

                {FOOD_CATEGORIES.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>

              <small>
                Select the category that best matches your food.
              </small>
            </div>

            {/* FOOD IMAGE */}
            <div className="form-group">
              <label htmlFor="food-image">
                Food Image{" "}
                <span className="required-star">*</span>
              </label>

              <input
                id="food-image"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFoodChange}
                required={!editingFoodId}
              />

              {editingFoodId && (
                <small>
                  Leave empty to keep the existing image.
                </small>
              )}
            </div>
          </div>

          {/* AVAILABILITY */}
          <label className="availability-label">
            <input
              type="checkbox"
              name="isAvailable"
              checked={foodForm.isAvailable}
              onChange={handleFoodChange}
            />

            <span>Food is currently available</span>
          </label>

          {/* FORM BUTTONS */}
          <div className="food-form-actions">
            <button
              className="admin-primary-btn"
              type="submit"
            >
              {editingFoodId
                ? "✓ Update Food"
                : "+ Add Food"}
            </button>

            {editingFoodId && (
              <button
                className="admin-cancel-btn"
                type="button"
                onClick={handleCancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {/* FOOD MANAGEMENT */}
      <section
        className="admin-section"
        id="manage-foods"
      >
        <div className="section-heading">
          <div>
            <span className="admin-eyebrow">
              YOUR RESTAURANT MENU
            </span>

            <h2>Manage Foods</h2>
            <p>
              View, edit, and manage your food items.
            </p>
          </div>

          <span className="section-count">
            {foods.length} Items
          </span>
        </div>

        {foods.length === 0 ? (
          <div className="admin-empty">
            <span>🍽️</span>
            <h3>No food items yet</h3>
            <p>
              Add your first food item using the form above.
            </p>
          </div>
        ) : (
          <div className="admin-food-list">
            {foods.map((food) => (
              <div
                className="admin-food-card"
                key={food._id}
              >
                <div className="food-card-image">
                  <img
                    src={food.image}
                    alt={food.name}
                  />

                  <span
                    className={
                      food.isAvailable
                        ? "food-status available"
                        : "food-status unavailable"
                    }
                  >
                    {food.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>

                <div className="admin-food-info">
                  <span className="food-category">
                    {food.category}
                  </span>

                  <h3>{food.name}</h3>

                  <p className="food-description">
                    {food.description}
                  </p>

                  <div className="food-card-bottom">
                    <strong>₹{food.price}</strong>

                    <div className="food-card-actions">
                      <button
                        className="food-edit-btn"
                        type="button"
                        onClick={() =>
                          handleEditFood(food)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="food-delete-btn"
                        type="button"
                        onClick={() =>
                          handleDeleteFood(food._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ORDER MANAGEMENT */}
      <section
        className="admin-section"
        id="manage-orders"
      >
        <div className="section-heading">
          <div>
            <span className="admin-eyebrow">
              ORDER MANAGEMENT
            </span>

            <h2>Manage Orders</h2>

            <p>
              Track customer orders and update their status.
            </p>
          </div>

          <span className="section-count">
            {orders.length} Orders
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="admin-empty">
            <span>📦</span>
            <h3>No orders available</h3>
            <p>Customer orders will appear here.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => (
              <div
                className="admin-order-card"
                key={order._id}
              >
                <div className="order-card-header">
                  <div>
                    <span className="admin-eyebrow">
                      ORDER ID
                    </span>

                    <h3>
                      #{order._id.slice(-6).toUpperCase()}
                    </h3>
                  </div>

                  <span
                    className={`order-status-badge status-${order.orderStatus}`}
                  >
                    {order.orderStatus?.replaceAll(
                      "_",
                      " "
                    )}
                  </span>
                </div>

                <div className="order-details-grid">
                  <div>
                    <span>Customer</span>
                    <strong>
                      {order.user?.name || "Unknown"}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {order.user?.email || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong className="order-total">
                      ₹{order.totalAmount}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Method</span>
                    <strong>
                      {order.paymentMethod}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Status</span>
                    <strong
                      className={`payment-status payment-${order.paymentStatus}`}
                    >
                      {order.paymentStatus}
                    </strong>
                  </div>
                </div>

                <div className="admin-order-items">
                  <strong>Ordered Items</strong>

                  <div className="order-items-list">
                    {order.items?.map((item, index) => (
                      <span key={item._id || index}>
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="order-status-control">
                  <label
                    htmlFor={`status-${order._id}`}
                  >
                    Update Order Status
                  </label>

                  <select
                    id={`status-${order._id}`}
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(
                        order._id,
                        e.target.value
                      )
                    }
                    disabled={[
                      "delivered",
                      "cancelled",
                    ].includes(order.orderStatus)}
                  >
                    <option value="placed">
                      Placed
                    </option>
                    <option value="confirmed">
                      Confirmed
                    </option>
                    <option value="preparing">
                      Preparing
                    </option>
                    <option value="out_for_delivery">
                      Out for Delivery
                    </option>
                    <option value="delivered">
                      Delivered
                    </option>
                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="admin-footer">
        <p>
          Made with ❤️ for <strong>Foodiee</strong> Admin
        </p>

        <span>
          Manage your restaurant. Serve happiness.
        </span>
      </footer>
    </div>
  );
};

export default AdminDashboard;
