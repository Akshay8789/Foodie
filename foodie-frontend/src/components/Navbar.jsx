import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const {
    user,
    logout,
    isAdmin,
  } = useAuth();

  const { totalItems } = useCart();

  return (
    <nav className="navbar">

      <Link
        to="/"
        className="navbar-logo"
      >
        🍔 Foodie
      </Link>

      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/cart">
          🛒 Cart ({totalItems})
        </Link>

        {user ? (
          <>
            <Link to="/orders">
              My Orders
            </Link>

            {isAdmin && (
              <Link to="/admin">
                Admin Dashboard
              </Link>
            )}

            <span>
              Hello, {user.name}
            </span>

            <button
              onClick={logout}
              className="logout-button"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </>
        )}

      </div>

    </nav>
  );
};

export default Navbar;