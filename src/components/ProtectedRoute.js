import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // If still loading auth context, wait
      if (loading) {
        return;
      }

      // If no user and not loading, redirect to login
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // User is authenticated
      setIsChecking(false);
    };

    checkAuth();
  }, [user, loading, router, redirectTo]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is authenticated, render the protected component
  return user ? children : null;
};

export default ProtectedRoute;
