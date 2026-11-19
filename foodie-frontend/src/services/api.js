import axios from "axios";

const api = axios.create({
  baseURL: "https://foodie-backend-hamm.onrender.com",
});

// Add token automatically
api.interceptors.request.use(
  (config) => {
    try {
      const storedUser =
        localStorage.getItem("foodieUser");

      if (storedUser) {
        const user =
          JSON.parse(storedUser);

        if (user?.token) {
          config.headers.Authorization =
            `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error(
        "Failed to read user data:",
        error
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized requests
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(
        "foodieUser"
      );

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;