import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../LoadingSpinner";
import { PUBLIC_LANDING_PATH } from "../../pages/public/publicSite";

export const ProtectedRoute = ({ children, requireProfileComplete = true, allowedRoles = [] }) => {
  const { isAuthenticated, loading, isProfileComplete, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    const isPortalRoute = window.location.pathname.includes('client') || 
                          window.location.pathname.includes('portal');
    if (isPortalRoute) {
      return <Navigate to="/portal/login" />;
    }
    if (window.location.pathname === "/" || window.location.pathname === "") {
      return <Navigate to={PUBLIC_LANDING_PATH} replace />;
    }
    return <Navigate to="/auth/signin" />;
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
