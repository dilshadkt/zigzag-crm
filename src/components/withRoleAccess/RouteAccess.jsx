import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function RouteAccess({ children, fallbackPath = "/unauthorized" }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has no position or no position details, deny access
  if (!user.position || !user.positionDetails) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If position is inactive, deny access
  if (!user.positionDetails.isActive) {
    return <Navigate to={fallbackPath} replace />;
  }

  const currentPath = location.pathname;
  const allowedRoutes = user.positionDetails.allowedRoutes || [];

  // Dashboard, Board, and Settings are always accessible to everyone
  if (currentPath === "/" || currentPath === "/board" || currentPath.startsWith("/settings")) {
    return children;
  }

  // Check if user has access to current route
  const hasRouteAccess = allowedRoutes.some((route) => {
    // Handle exact matches and wildcard routes
    if (route === "*" || route === "/") return true;
    if (route.endsWith("*")) {
      const routePrefix = route.slice(0, -1);
      return currentPath.startsWith(routePrefix);
    }

    // Map route keys to actual paths
    const routeKeyToPath = {
      dashboard: "/",
      projects: "/projects",
      board: "/board",
      calender: "/calender",
      vacations: "/vacations",
      employees: "/employees",
      messenger: "/messenger",
      "task-on-review": "/task-on-review",
      settings: "/settings",
    };

    const expectedPath = routeKeyToPath[route];
    return (
      currentPath === expectedPath || currentPath.startsWith(expectedPath + "/")
    );
  });

  if (!hasRouteAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export default RouteAccess;
