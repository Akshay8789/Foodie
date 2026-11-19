
import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("foodieUser");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem("foodieUser");
      localStorage.removeItem("token");
      return null;
    }
  });

  // Login
  const login = (userData) => {
    if (!userData || !userData.token) {
      console.error("Invalid login response");
      return;
    }

    localStorage.setItem(
      "foodieUser",
      JSON.stringify(userData)
    );

    localStorage.setItem("token", userData.token);

    setUser(userData);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("foodieUser");
    localStorage.removeItem("token");

    setUser(null);
  };

  // Authentication checks
  const isAuthenticated = Boolean(user?.token);

  const isAdmin = user?.type === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


