
import { useEffect, useState } from "react";
import FoodCard from "../components/FoodCard";
// import api from "../services/api";
import api from "../api/axios";
import "./Home.css";

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/foods/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch foods whenever filters change
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (category !== "All") {
          params.category = category;
        }

        if (minPrice !== "") {
          params.minPrice = minPrice;
        }

        if (maxPrice !== "") {
          params.maxPrice = maxPrice;
        }

        if (sort) {
          params.sort = sort;
        }

        const response = await api.get("/foods", { params });

        setFoods(response.data.foods || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load foods"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [search, category, minPrice, maxPrice, sort]);

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">
            🍽️ FRESH • TASTY • DELICIOUS
          </span>

          <h1>
            Delicious food,
            <br />
            <span>delivered to you!</span> 🍔
          </h1>

          <p>
            Discover your favorite meals with Foodiee.
            Fresh flavors, amazing dishes, and happiness
            delivered straight to your door.
          </p>

          <a href="#popular-foods" className="hero-button">
            Explore Foods <span>→</span>
          </a>

          <div className="hero-features">
            <span>✓ Fresh Ingredients</span>
            <span>✓ Delicious Meals</span>
            <span>✓ Easy Ordering</span>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="hero-circle">
            <span>🍕</span>
          </div>
          <div className="hero-small-circle">🍔</div>
          <div className="hero-floating-item">🍟</div>
          <div className="hero-floating-text">
            Made with ❤️
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="filters-section">

        <div className="filter-heading">
          <div>
            <span className="filter-eyebrow">
              FIND YOUR FAVORITE
            </span>
            <h2>Explore Our Menu</h2>
            <p>Find something delicious to enjoy today.</p>
          </div>

          <span className="filter-food-icon">🥗</span>
        </div>

        {/* Search */}
        <div className="search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search for pizza, burger, dosa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="category-section">
          <h3>
            <span>🍽️</span> Categories
          </h3>

          <div className="category-buttons">
            <button
              className={
                category === "All"
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() => setCategory("All")}
            >
              All Foods
            </button>

            {categories.map((categoryName) => (
              <button
                key={categoryName}
                className={
                  category === categoryName
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => setCategory(categoryName)}
              >
                {categoryName}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-controls">

          {/* Price */}
          <div className="price-filter">
            <h3>💰 Price Range</h3>

            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min ₹"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />

              <span>to</span>

              <input
                type="number"
                placeholder="Max ₹"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Sort */}
          <div className="sort-filter">
            <label htmlFor="sort">
              ↕ Sort By
            </label>

            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="name">
                Name: A to Z
              </option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            className="clear-filters-button"
            onClick={clearFilters}
          >
            ↻ Clear Filters
          </button>

        </div>
      </section>

      {/* Food Section */}
      <section className="food-section" id="popular-foods">

        <div className="food-section-header">
          <div>
            <span className="food-section-eyebrow">
              MADE FRESH FOR YOU
            </span>

            <h2>
              {category === "All"
                ? "Popular Foods"
                : category}
              <span className="food-title-dot">.</span>
            </h2>

            <p>
              Explore our delicious collection of meals.
            </p>
          </div>

          {!loading && !error && (
            <span className="food-count">
              🍴 {foods.length}{" "}
              {foods.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading">
            <div className="home-loader"></div>
            <h3>Preparing something delicious...</h3>
            <p>Please wait while we load your foods.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && foods.length === 0 && (
          <div className="no-foods">
            <div className="no-foods-icon">🍽️</div>
            <h3>No Food Found!</h3>
            <p>
              We couldn't find any matching food.
              Try changing your search or filters.
            </p>

            <button
              onClick={clearFilters}
              className="clear-filters-button"
            >
              ↻ Clear Filters
            </button>
          </div>
        )}

        {/* Food Grid */}
        {!loading && !error && foods.length > 0 && (
          <div className="food-grid">
            {foods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
              />
            ))}
          </div>
        )}

      </section>

      {/* Bottom Banner */}
      <section className="home-bottom-banner">
        <div>
  <span>❤️ MADE FOR FOOD LOVERS</span>
  <h2>Good food. Good mood. Great moments.</h2>
  <p>
    Thank you for making Foodiee part of your day!
  </p>
  <p className="creator-name">
    Designed & Developed by <strong>Akshay Rajput</strong> ✨
  </p>
</div>

        <div className="banner-emoji">🍕</div>
      </section>

    </div>
  );
};

export default Home;
