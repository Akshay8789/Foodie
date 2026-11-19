
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./ReviewSection.css";

const ReviewSection = ({ foodId }) => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/reviews/${foodId}`);

      setReviews(data.reviews || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load reviews"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [foodId]);

  const myReview = reviews.find(
    (review) => review.user?._id === user?._id
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please login to submit a review");
      return;
    }

    if (!comment.trim()) {
      setMessage("Please write your review");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      if (editingId) {
        await api.put(`/reviews/${editingId}`, {
          rating,
          comment,
        });

        setMessage("Review updated successfully");
      } else {
        await api.post(`/reviews/${foodId}`, {
          rating,
          comment,
        });

        setMessage("Review submitted successfully");
      }

      setRating(5);
      setComment("");
      setEditingId(null);

      await fetchReviews();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/reviews/${reviewId}`);

      setMessage("Review deleted successfully");

      if (editingId === reviewId) {
        setEditingId(null);
        setRating(5);
        setComment("");
      }

      await fetchReviews();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to delete review"
      );
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="review-section">
      <h2>Customer Reviews</h2>

      <div className="review-summary">
        <h3>{averageRating} / 5</h3>

        <div className="review-stars">
          {"★".repeat(Math.round(Number(averageRating)))}
          {"☆".repeat(5 - Math.round(Number(averageRating)))}
        </div>

        <p>{reviews.length} reviews</p>
      </div>

      {user && !myReview && !editingId && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3>Write a Review</h3>

          <label>Your Rating</label>

          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={star <= rating ? "selected" : ""}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} out of 5`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            maxLength={1000}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {editingId && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3>Edit Your Review</h3>

          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={star <= rating ? "selected" : ""}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} out of 5`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update Review"}
          </button>

          <button
            type="button"
            className="cancel-edit"
            onClick={() => {
              setEditingId(null);
              setRating(5);
              setComment("");
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {!user && (
        <p className="login-review-message">
          Please login to write a review.
        </p>
      )}

      {message && <p className="review-message">{message}</p>}

      <div className="review-list">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => {
            const isOwner =
              review.user?._id === user?._id;

            const isAdmin = user?.role === "admin";

            return (
              <article className="review-card" key={review._id}>
                <div className="review-card-header">
                  <h4>{review.user?.name || "User"}</h4>

                  <span>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="review-stars">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>

                <p>{review.comment}</p>

                {(isOwner || isAdmin) && (
                  <div className="review-actions">
                    {isOwner && (
                      <button
                        onClick={() => handleEdit(review)}
                      >
                        Edit
                      </button>
                    )}

                    <button
                      className="delete-review"
                      onClick={() => handleDelete(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
