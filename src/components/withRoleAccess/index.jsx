// import { Navigate } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// // HOC for role-based route protection
// export const WithRoleAccess = (allowedRoles) => (Component) => {
//   const WithRoleAccess = (props) => {
//     const { user } = useAuth(); // Custom hook to access auth context
//     if (!user || !allowedRoles.includes(user.role)) {
//       return <Navigate to="/unauthorized" />;
//     }

//     return <Component {...props} />;
//   };

//   return WithRoleAccess;
// };

function WithRoleAcess({ children, allowedRoles, allowedRoutes }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check route-based access if allowedRoutes is provided and user has position details
  if (allowedRoutes && user.positionDetails?.allowedRoutes) {
    const currentPath = location.pathname;
    const hasRouteAccess = user.positionDetails.allowedRoutes.some(route => {
      // Handle exact matches and wildcard routes
      if (route === "*" || route === "/") return true;
      if (route.endsWith("*")) {
        const routePrefix = route.slice(0, -1);
        return currentPath.startsWith(routePrefix);
      }
      return currentPath === route;
    });

    if (!hasRouteAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export default WithRoleAcess;
