
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// import api from "../services/api";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await api.post(
        "/auth/login",
        formData
      );

      // Save logged-in user and token
      login(response.data);

      // Redirect according to account type
      if (response.data.type === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container login-container">

      <form
        className="auth-form login-form"
        onSubmit={handleSubmit}
      >

        {/* Header */}
        <div className="login-header">
          <div className="login-logo">🍔</div>

          <h2>Welcome Back!</h2>

          <p>Login to your Foodie account</p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        {/* Email */}
        <div className="login-group">
          <label htmlFor="email">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="login-group">
          <label htmlFor="password">
            Password
          </label>

          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="login-button"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Register Link */}
        <p className="login-register">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </form>
    </div>
  );
};

export default Login;
