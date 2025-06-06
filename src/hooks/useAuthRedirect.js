// hooks/useAuthRedirect.js
("use client");

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

// Custom hook for redirecting authenticated users away from auth pages
export const useAuthRedirect = (redirectTo = "/dashboard") => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
};
