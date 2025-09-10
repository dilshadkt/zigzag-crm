import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import WithRoleAcess from "../components/withRoleAccess";
import RouteAccess from "../components/withRoleAccess/RouteAccess";

// Route permissions
export const ROLES = {
  ADMIN: "company-admin",
  EMPLOYEE: "employee",
};

// Protected Route Component
export const ProtectedRoute = ({
  children,
  allowedRoles,
  requireProfileComplete = true,
}) => {
  const { user, isAuthenticated, isProfileComplete } = useSelector(
    (state) => state.auth
  );

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Check if profile completion is required
  if (requireProfileComplete && !isProfileComplete) {
    return <Navigate to="/welcome" replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Role-based Route Wrapper
export const RoleBasedRoute = ({
  children,
  allowedRoles,
  fallback = <Navigate to="/unauthorized" replace />,
}) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  return <WithRoleAcess allowedRoles={allowedRoles}>{children}</WithRoleAcess>;
};

// Route Access Wrapper (for general route access)
export const RouteAccessWrapper = ({ children }) => {
  return <RouteAccess>{children}</RouteAccess>;
};

// Helper function to check if user has required role
export const hasRole = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};

// Helper function to check if user is authenticated
export const isUserAuthenticated = (authState) => {
  return authState.isAuthenticated;
};

// Helper function to check if profile is complete
export const isProfileComplete = (authState) => {
  return authState.isProfileComplete;
};
