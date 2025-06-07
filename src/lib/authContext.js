"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authAPI } from "./api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  // Check if token exists and is valid
  const isTokenValid = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }, []);

  // Clear auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Validate token expiration
      if (!isTokenValid()) {
        clearAuthData();
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Fetch current user data
      const data = await authAPI.getCurrentUser(token);
      setUser(data);
      setError(null);
    } catch (error) {
      console.error("Auth check failed:", error);
      clearAuthData();

      const errorMsg = error.message || "Session expired. Please log in again.";
      toast({
        title: "Authentication Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isTokenValid, clearAuthData, toast]);

  // Initialize auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up token refresh interval (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !isTokenValid()) {
        clearAuthData();
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        router.push("/login");
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, isTokenValid, clearAuthData, toast, router]);

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("AuthContext register: userData being sent:", userData);
      const data = await authAPI.register(userData);
      toast({
        title: "Success",
        description: "Account created successfully. Please log in.",
        variant: "success",
      });
      router.push("/login");
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg =
        error.message || "Registration failed. Please try again.";
      setError(errorMsg);
      toast({
        title: "Registration Failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authAPI.login(credentials);

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);

        // Fetch user data after successful login
        const userData = await authAPI.getCurrentUser(data.access_token);
        setUser(userData);

        toast({
          title: "Success",
          description: "Logged in successfully",
          variant: "success",
        });

        router.push("/dashboard");
      } else {
        throw new Error("Login successful but no access token received");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        error.message || "Login failed. Please check your credentials.";
      setError(errorMsg);
      toast({
        title: "Login Failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(
    (showToast = true) => {
      clearAuthData();

      if (showToast) {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully",
          variant: "default",
        });
      }

      router.push("/");
    },
    [clearAuthData, toast, router]
  );

  const refreshUser = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      if (token) {
        const userData = await authAPI.getCurrentUser(token);
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }, [user]);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isTokenValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
