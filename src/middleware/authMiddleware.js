"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Client-side route protection middleware
export const withAuth = (WrappedComponent, options = {}) => {
  const { redirectTo = "/login", allowedRoles = [] } = options;

  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            router.push(redirectTo);
            return;
          }

          // Verify token with backend
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
            }/api/v1/auth/me`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Token validation failed");
          }

          const userData = await response.json();

          // Check role-based access if roles are specified
          if (
            allowedRoles.length > 0 &&
            !allowedRoles.includes(userData.role)
          ) {
            router.push("/unauthorized");
            return;
          }

          setIsAuthorized(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          router.push(redirectTo);
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };
};
