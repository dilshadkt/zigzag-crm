import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../LoadingSpinner";
import PublicHome from "../../pages/public/Home";

export const ProtectedRoute = ({ children, requireProfileComplete = true, allowedRoles = [] }) => {
  const { isAuthenticated, loading, isProfileComplete, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    const isExactHome = location.pathname === "/";
    if (isExactHome) {
      return <PublicHome />;
    }

    const isPortalRoute = window.location.pathname.includes('client') || 
                          window.location.pathname.includes('portal');
    return <Navigate to={isPortalRoute ? "/portal/login" : "/auth/signin"} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  if (requireProfileComplete && !isProfileComplete) {
    return <Navigate to="/welcome" />; // Redirect to profile page if profile is incomplete
  }

  if (!requireProfileComplete && isProfileComplete) {
    // If client, redirect to dashboard, otherwise home
    const redirectTo = user?.role === "client" ? "/client-dashboard" : "/";
    return <Navigate to={redirectTo} />;
  }

  return children; // Render the children if all conditions are met
};
