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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const data = await authAPI.getCurrentUser(token);
          setUser(data);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        setUser(null);
        const errorMsg =
          error.message || "Session Expired. Please log in again.";
        const detailedError =
          error.message && error.message.detail
            ? error.message.detail
            : errorMsg;
        toast({
          title: "Session Expired",
          description: detailedError,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

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
      const data = await authAPI.login(credentials);
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        setUser(data.user);
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
      variant: "default",
    });
    router.push("/");
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
