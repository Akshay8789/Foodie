
import "./FoodCard.css";
import { Link } from "react-router-dom";

const FoodCard = ({ food }) => {
  const imageUrl = food.image;
  const isAvailable = food.isAvailable !== false;

  return (
    <div className="food-card">

      {/* Food Image - Click to open details */}
      <Link
        to={`/foods/${food._id}`}
        className="food-card-image-link"
      >
        <div className="food-image-container">
          <img
            src={imageUrl || "/placeholder-food.png"}
            alt={food.name || "Food"}
            className="food-card-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder-food.png";
            }}
          />

          <span
            className={`food-availability ${
              isAvailable ? "available" : "not-available"
            }`}
          >
            {isAvailable ? "● Available" : "● Unavailable"}
          </span>

          <div className="food-image-overlay">
            <span>View Food Details →</span>
          </div>
        </div>
      </Link>

      {/* Food Information */}
      <div className="food-info">

        <div className="food-title-row">
          <h3>{food.name}</h3>
        </div>

        {/* Rating */}
        <div className="food-rating">
          <span className="rating-star">★</span>

          <strong>
            {Number(food.rating || 0).toFixed(1)}
          </strong>

          <small>
            ({food.numReviews || 0} reviews)
          </small>
        </div>

        {/* Description */}
        <p className="food-description">
          {food.description || "Delicious food made fresh for you."}
        </p>

        {/* Price and Button */}
        <div className="food-bottom">

          <div className="food-price">
            <small>Price</small>
            <strong>₹{Number(food.price || 0).toFixed(0)}</strong>
          </div>

          <Link
            to={`/foods/${food._id}`}
            className="food-view-btn"
          >
            View Details
            <span>→</span>
          </Link>

        </div>

        {!isAvailable && (
          <p className="unavailable-message">
            Currently unavailable. Please check back later.
          </p>
        )}

      </div>
    </div>
  );
};

export default FoodCard;
