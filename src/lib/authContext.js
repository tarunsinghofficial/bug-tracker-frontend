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
        toast({
          title: "Session Expired",
          description: "Please log in again",
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
      if (data.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        toast({
          title: "Success",
          description: "Logged in successfully",
          variant: "success",
        });
        router.push("/dashboard");
      } else {
        throw new Error("No token received from server");
      }
      return data;
    } catch (error) {
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
