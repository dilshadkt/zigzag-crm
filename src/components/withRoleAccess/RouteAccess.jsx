import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

function RouteAccess({ children, fallbackPath = "/unauthorized" }) {
  const { user } = useAuth();
  const { hasAdminDashboardAccess } = usePermissions();
  const location = useLocation();
  const currentPath = location.pathname;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Company admins have full access regardless of position
  if (user.role === "company-admin") {
    return children;
  }

  // Client access
  if (user.role === "client") {
    const isAllowed = [
      "/portal/dashboard",
      "/leads",
      "/campaigns",
    ].some(
      (path) => currentPath === path || currentPath.startsWith(path + "/")
    );

    return isAllowed ? children : <Navigate to="/portal/dashboard" replace />;
  }

  // For employees, check position and position details
  if (!user.position || !user.positionDetails) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If position is inactive, deny access
  if (!user.positionDetails.isActive) {
    return <Navigate to={fallbackPath} replace />;
  }

  const allowedRoutes = user.positionDetails.allowedRoutes || [];
  const canAccessAdminDashboard = hasAdminDashboardAccess();

  // Dashboard, Board, Settings, and Company Dashboard (if has permission) are always accessible
  if (
    currentPath === "/" ||
    currentPath === "/board" ||
    currentPath.startsWith("/settings") ||
    (currentPath === "/company-dashboard" && canAccessAdminDashboard)
  ) {
    return children;
  }

  // Admin dashboard related routes - allow if user has accessAdminDashboard permission
  const adminDashboardRoutes = [
    "/company-tasks",
    "/company-today-tasks",
    "/projects-analytics",
    "/task-on-review",
    "/task-on-publish",
    "/client-review",
  ];

  if (canAccessAdminDashboard) {
    const isAdminDashboardRoute = adminDashboardRoutes.some((route) =>
      currentPath.startsWith(route)
    );
    if (isAdminDashboardRoute) {
      return children;
    }
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
      calendar: "/calender",
      calender: "/calender",
      vacations: "/vacations",
      employees: "/employees",
      messenger: "/messenger",
      "task-on-review": "/task-on-review",
      leads: "/leads",
      settings: "/settings",
      "lead-dashboard": "/lead-dashboard",
      "employee-dashboard": "/employee-dashboard",
      "cost-dashboard": "/cost-dashboard",
      "company-dashboard": "/company-dashboard",
      "sticky-notes": "/sticky-notes",
      timer: "/timer",
      notifications: "/notifications",
      "activity-stream": "/activity-stream",
      "pending-works": "/pending-works",
      attendance: "/attendance",
      campaigns: "/campaigns",
      infoPortal: "/infoPortal",
      events: "/events",
      workload: "/workload",
      "task-on-publish": "/task-on-publish",
      "client-review": "/client-review",
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
