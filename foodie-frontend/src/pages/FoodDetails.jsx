
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


// import api from "../services/api";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import ReviewSection from "../components/ReviewSection";

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/foods/${id}`);

        // Backend returns { success: true, food: {...} }
        const foodData = response.data.food;

        if (!foodData) {
          setError("Food not found");
          return;
        }

        setFood(foodData);
      } catch (error) {
        console.error("Fetch food error:", error);

        setError(
          error.response?.data?.message || "Food not found"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [id]);

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleAddToCart = () => {
    if (!food || food.isAvailable !== true) {
      return;
    }

    addToCart(food, quantity);
    navigate("/cart");
  };

  if (loading) {
    return <h2>Loading food details...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!food) {
    return <h2>Food not found</h2>;
  }

  return (
    <div className="food-details-page">

      {/* Food Details */}
      <div className="food-details">

        <div className="food-details-image">
          <img
            src={food.image}
            alt={food.name}
            onError={(e) => {
              e.currentTarget.alt = "Food image unavailable";
            }}
          />
        </div>

        <div className="food-details-info">

          <p className="category">{food.category}</p>

          <h1>{food.name}</h1>

          <p className="description">
            {food.description}
          </p>

          {/* Food Rating */}
          <div className="food-rating">
            <span>★</span>

            <strong>
              {Number(food.rating || 0).toFixed(1)}
            </strong>

            <small>
              ({food.numReviews || 0} reviews)
            </small>
          </div>

          <h2>
            {Number.isFinite(Number(food.price))
              ? Number(food.price).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 2,
                })
              : "Price unavailable"}
          </h2>

          {food.isAvailable === false && (
            <p className="error">
              Currently unavailable
            </p>
          )}

          {food.isAvailable === true && (
            <>
              <div className="quantity-selector">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

              <button
                type="button"
                className="add-cart-button"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </>
          )}

          {food.isAvailable !== true &&
            food.isAvailable !== false && (
              <p className="error">
                Availability information is missing.
                Please check the food data in MongoDB.
              </p>
            )}

        </div>
      </div>

      {/* Reviews and Ratings */}
      <ReviewSection foodId={id} />

    </div>
  );
};

export default FoodDetails;
