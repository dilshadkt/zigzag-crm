import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../LoadingSpinner";

export const ProtectedRoute = ({ children, requireProfileComplete = true }) => {
  const { isAuthenticated, loading, isProfileComplete } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" />; // Redirect to login if not authenticated
  }

  if (requireProfileComplete && !isProfileComplete) {
    return <Navigate to="/welcome" />; // Redirect to profile page if profile is incomplete
  }

  if (!requireProfileComplete && isProfileComplete) {
    return <Navigate to="/" />; // Redirect to home if profile is already complete
  }

  return children; // Render the children if all conditions are met
};
