import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  req.headers["Content-Type"] = "application/json";
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging
    console.error("[API Error]", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      console.warn("Access denied: insufficient permissions");
    }

    if (!error.response) {
      console.error(
        "Network error: Unable to connect to API. Check your connection and API server status.",
      );
    }

    return Promise.reject(error);
  },
);

export default API;
