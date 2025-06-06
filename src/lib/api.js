// This file will contain all API service functions for making requests to backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const authAPI = {
  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        const errorDetail = data.detail || data.message || "Login failed";
        throw new Error(errorDetail);
      }
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        const errorDetail =
          data.detail || data.message || "Failed to fetch current user";
        throw new Error(errorDetail);
      }
      return data;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        const errorDetail = data.detail || data.message || "Logout failed";
        throw new Error(errorDetail);
      }
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
};
