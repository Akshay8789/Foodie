
import {
  Routes,
  Route,
} from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FoodDetails from "./pages/FoodDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import AdminDashboard from "./pages/AdminDashboard";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <>
      {/* Navigation Bar */}
      <Navbar />

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Food Details - FIXED ROUTE */}
        <Route
          path="/foods/:id"
          element={<FoodDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />


        {/* =========================
            PROTECTED USER ROUTES
        ========================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/orders"
            element={<MyOrders />}
          />

          <Route
            path="/orders/:id"
            element={<OrderDetails />}
          />

        </Route>


        {/* =========================
            PROTECTED ADMIN ROUTES
        ========================= */}

        <Route element={<AdminRoute />}>

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

        </Route>


        {/* =========================
            404 PAGE
        ========================= */}

        <Route
          path="*"
          element={
            <div className="not-found">
              <h1>404</h1>
              <p>Page not found.</p>
            </div>
          }
        />

      </Routes>
    </>
  );
};

export default App;
