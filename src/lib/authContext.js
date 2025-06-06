"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

  const checkAuth = async () => {
    setLoading(true); // Set loading when checking auth
    try {
      // Call the /me endpoint to check if the user is authenticated via cookie
      // The browser will automatically send the HttpOnly cookie
      const data = await authAPI.getCurrentUser();
      setUser(data);
      setError(null); // Clear any previous errors on successful auth
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      // Only set error state or show toast for actual authentication failures,
      // not just when no cookie exists on initial load for public routes.
      // We might need a more specific error handling based on backend response.
      const errorMsg = error.message || "Session Expired. Please log in again.";
      setError(errorMsg);
      if (
        !error.message?.includes("Failed to fetch") &&
        !error.message?.includes("Failed to fetch current user") &&
        error.message !== "Could not validate credentials"
      ) {
        // Refined check to prevent toast on initial load or expected unauthenticated state
        toast({
          title: "Session Expired",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [toast]);

  const register = async (userData) => {
    setLoading(true);
    try {
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
      const detailedError =
        error.message && error.message.detail ? error.message.detail : errorMsg;
      setError(detailedError);
      toast({
        title: "Registration Failed",
        description: detailedError,
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
      // Make the login API call (backend sets HttpOnly cookie)
      const data = await authAPI.login(credentials);

      // Add a small delay before checking auth to ensure cookie is set/available
      // This is a potential workaround; the root cause might be backend/cookie settings.
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay

      // After successful login, check auth status (should read cookie)
      await checkAuth();

      toast({
        title: "Success",
        description: "Logged in successfully",
        variant: "success",
      });
      // The middleware should handle the redirect based on the cookie now
      // router.push("/dashboard"); // Removed direct push, middleware should handle
      return data;
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        error.message || "Login failed. Please check your credentials.";
      const detailedError =
        error.message && error.message.detail ? error.message.detail : errorMsg;
      setError(detailedError);
      toast({
        title: "Login Failed",
        description: detailedError,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true); // Set loading on logout
    try {
      // Call backend endpoint to clear HttpOnly cookie
      await authAPI.logout();
      setUser(null);
      setError(null); // Clear errors on logout
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
      router.push("/"); // Redirect to home or login after logout
    } catch (error) {
      console.error("Logout error:", error);
      setError("An error occurred during logout.");
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
