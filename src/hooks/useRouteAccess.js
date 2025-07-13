import { useAuth } from "./useAuth";
import { useLocation } from "react-router-dom";

export const useRouteAccess = () => {
  const { user } = useAuth();
  const location = useLocation();

  const hasAccessToRoute = (route) => {
    if (!user?.positionDetails?.allowedRoutes) {
      return false;
    }

    const allowedRoutes = user.positionDetails.allowedRoutes;
    console.log(route.split("/")[1])
    console.log(allowedRoutes)
    return allowedRoutes.some(allowedRoute => {
      // Handle exact matches and wildcard routes
      if (allowedRoute === "*" || allowedRoute === "/") return true;
      if (allowedRoute.endsWith("*")) {
        const routePrefix = allowedRoute.slice(0, -1);
        return route.startsWith(routePrefix);
      }
      return route.split("/")[1] === allowedRoute;
    });
  };

  // Helper function to check if a route pattern matches a given route
  const routeMatches = (pattern, route) => {
    if (pattern === "*" || pattern === "/") return true;
    if (pattern.endsWith("*")) {
      const routePrefix = pattern.slice(0, -1);
      return route.startsWith(routePrefix);
    }
    return route === pattern;
  };

  const hasAccessToCurrentRoute = () => {
    return hasAccessToRoute(location.pathname);
  };

  const getAllowedRoutes = () => {
    return user?.positionDetails?.allowedRoutes || [];
  };

  const canAccessAnyRoute = (routes) => {
    return routes.some(route => hasAccessToRoute(route));
  };

  return {
    hasAccessToRoute,
    hasAccessToCurrentRoute,
    getAllowedRoutes,
    canAccessAnyRoute,
    routeMatches,
    userPosition: user?.positionDetails,
    isPositionActive: user?.positionDetails?.isActive || false
  };
}; 