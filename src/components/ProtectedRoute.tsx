import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-[#1e40af]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Store the attempted URL to redirect back after login
    const currentPath = location.pathname + location.search;
    if (currentPath !== '/login' && currentPath !== '/register') {
      localStorage.setItem('redirect_after_login', currentPath);
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

