
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // User must be logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only admins can access
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
