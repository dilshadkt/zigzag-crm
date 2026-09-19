import React, { useState } from "react";
import { SIDE_MENU, SETTINGS } from "../../constants";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useRouteAccess } from "../../hooks/useRouteAccess";
import { usePermissions } from "../../hooks/usePermissions";
import {
  MdDashboard,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
} from "react-icons/md";
import {
  useSidebarTaskCounts,
  useGetUnreadMessageCount,
  useIsDepartmentHead,
} from "../../api/hooks";
import { useTicketCounts } from "../../features/tickets/hooks/useTickets";
import SupportSection from "./SupportSection";
import SidebarMenuItem from "./SidebarMenuItem";

const ALWAYS_ACCESSIBLE_ROUTES = ["dashboard", "board", "settings", "tickets"];

const Sidebar = () => {
  const { user, companyId } = useAuth();
  const effectiveCompanyId = companyId || user?.company;
  const { userPosition } = useRouteAccess();
  const { hasAdminDashboardAccess, hasPermission } = usePermissions();
  const { isDepartmentHead, totalActionRequiredCount } = useIsDepartmentHead(effectiveCompanyId, !!user);

  // Get current month in YYYY-MM format for tasks on review
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  // Badge counts (totals only, no task payloads)
  const {
    tasksOnReview: tasksOnReviewCount,
    tasksOnPublish: tasksOnPublishCount,
    clientReview: clientReviewCount,
  } = useSidebarTaskCounts(getCurrentMonth(), !!user);

  // Fetch unread messages count
  const { data: unreadMessageCount = 0 } = useGetUnreadMessageCount();
  const { data: ticketCounts } = useTicketCounts(!!user);
  const issueCount = ticketCounts?.active || 0;

  // Check if user has admin dashboard access permission
  const isCompanyAdmin = user?.role === "company-admin";
  const canAccessAdminDashboard = !isCompanyAdmin && hasAdminDashboardAccess();

  const sidebarMenuItems = SIDE_MENU.map((item) => {
    // If the item is "Dashboard", construct its children
    if (item.routeKey === "dashboard") {
      const allowedRoutes = userPosition?.allowedRoutes || [];

      let children = [];

      // 1. Add "Main Dashboard" only if user is NOT an admin
      if (!isCompanyAdmin) {
        children.push({
          id: 101,
          title: "Main Dashboard",
          path: "/",
          routeKey: "dashboard",
        });
      }

      // 2. Insert "Company Dashboard" if user has access
      if (isCompanyAdmin) {
        children.push({
          id: 1301,
          title: "Dashboard", // Admins see it simply as "Dashboard"
          path: "/",
          routeKey: "dashboard",
        });
      } else if (canAccessAdminDashboard) {
        children.push({
          id: 1301,
          title: "Company Dashboard",
          path: "/company-dashboard",
          routeKey: "company-dashboard",
        });
      }

      // 3. Add other dashboard sub-items template
      const dashboardTemplate = SIDE_MENU.find(i => i.routeKey === "dashboard");
      const otherDashboards = dashboardTemplate?.children?.filter(
        child => child.routeKey !== "dashboard"
      ) || [];

      otherDashboards.forEach(child => {
        if (isCompanyAdmin || allowedRoutes.includes(child.routeKey)) {
          children.push(child);
        }
      });

      if (isDepartmentHead || isCompanyAdmin) {
        children.push({
          id: 107,
          title: "Department Dashboard",
          path: "/department-dashboard",
          routeKey: "department-dashboard",
        });
      }

      return {
        ...item,
        children,
        path: undefined // So it becomes a collapsible/dropdown menu instead of a direct link
      };
    }

    // Transform Settings for all users into a dropdown
    if (item.routeKey === "settings") {
      let settingsChildren = [];

      if (isCompanyAdmin) {
        // For admins, show all settings from the constant
        settingsChildren = SETTINGS.map(s => ({
          id: 1200 + s.id,
          title: s.title,
          path: `/settings/${s.path}`,
          routeKey: "settings"
        }));
      } else {
        // For employees, show based on permissions
        settingsChildren = [
          {
            id: 1201,
            title: "Profile",
            path: "/settings/account",
            routeKey: "settings",
          },
          {
            id: 1207,
            title: "Integration",
            path: "/settings/integration",
            routeKey: "settings",
          },
        ];

        // My Company related management
        if (
          hasPermission("settings", "manageCompany") ||
          hasPermission("settings", "managePositions") ||
          hasPermission("settings", "manageTaskFlows")
        ) {
          settingsChildren.push({
            id: 1204,
            title: "My Company",
            path: "/settings/company",
            routeKey: "settings",
          });
        }

        // Security (Security Hub)
        if (hasPermission("settings", "manageSecurity") || hasPermission("settings", "manageRoles")) {
          settingsChildren.push({
            id: 1205,
            title: "Security",
            path: "/settings/safety",
            routeKey: "settings",
          });
        }

        // Master configuration
        if (hasPermission("settings", "manageMaster")) {
          settingsChildren.push({
            id: 1206,
            title: "Master",
            path: "/settings/master",
            routeKey: "settings",
          });
        }
      }

      // Return a collapsible settings menu
      return {
        ...item,
        children: settingsChildren,
        path: undefined // Remove direct path so it only toggles
      };
    }

    return item;
  });

  // Filter sidebar items based on user's position allowed routes
  const filteredSidebar = sidebarMenuItems.filter((item) => {
    // Company admins have full access to all menu items
    if (isCompanyAdmin) {
      return true;
    }

    // Certain routes are always accessible to everyone
    if (ALWAYS_ACCESSIBLE_ROUTES.includes(item.routeKey)) {
      return true;
    }

    // For other menu items, check if the routeKey is in their allowed routes
    const allowedRoutes = userPosition?.allowedRoutes || [];
    return allowedRoutes.includes(item.routeKey);
  });

  // Additional debug for each menu item
  if (user?.role !== "company-admin") {
    SIDE_MENU.forEach((item) => {
      const allowedRoutes = userPosition?.allowedRoutes || [];
      const isAlwaysAccessible = ALWAYS_ACCESSIBLE_ROUTES.includes(item.routeKey);
      const hasRouteAccess = allowedRoutes.includes(item.routeKey);
      const hasAccess = isAlwaysAccessible || hasRouteAccess;
    });
  }

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showDebug, setShowDebug] = useState(false);
  const [openMenus, setOpenMenus] = useState(() => {
    const initialOpenMenus = {};
    filteredSidebar.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => pathname === child.path
        );
        if (isChildActive) {
          initialOpenMenus[item.title] = true;
        }
      }
    });
    return initialOpenMenus;
  });

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = () => {
    navigate("/auth/signin");
  };
  return (
    <section
      className=" flex-col min-w-[240px] hidden lg:flex  my-3 ml-3 justify-between
     rounded-[24px] gap-y-10 bg-white p-3"
    >
      <div className="flex flex-col  overflow-y-auto scrollbar-hide">
        <ul className="flex flex-col gap-y-1  text-[#7D8592] ">
          {filteredSidebar.length > 0 ? (
            filteredSidebar.map((item, index) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.title];
              const isActive = pathname === item.path || (hasChildren && item.children.some(child => pathname === child.path));

              // Get count for "Task on Review", "Task on Publish", and "Client Review" menu items
              const getTaskCount = (menuItem) => {
                if (menuItem.routeKey === "task-on-review") {
                  return tasksOnReviewCount || null;
                }
                if (menuItem.routeKey === "task-on-publish") {
                  return tasksOnPublishCount || null;
                }
                if (menuItem.routeKey === "client-review") {
                  return clientReviewCount || null;
                }
                if (menuItem.routeKey === "messenger" && unreadMessageCount > 0) {
                  return unreadMessageCount;
                }
                if (menuItem.routeKey === "tickets" && issueCount > 0) {
                  return issueCount;
                }
                if (menuItem.routeKey === "department-dashboard" && totalActionRequiredCount > 0) {
                  return totalActionRequiredCount;
                }
                return null;
              };

              const taskCount = getTaskCount(item);

              return (
                <SidebarMenuItem
                  key={index}
                  item={item}
                  isActive={isActive}
                  isOpen={isOpen}
                  hasChildren={hasChildren}
                  taskCount={taskCount}
                  onToggle={toggleMenu}
                  onNavigate={navigate}
                  pathname={pathname}
                  getTaskCount={getTaskCount}
                />
              );
            })
          ) : (
            <li className="px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] text-[#7D8592] text-[13px]">
              <span>No accessible menu items</span>
            </li>
          )}
        </ul>
      </div>
      <SupportSection handleLogout={handleLogout} />
    </section>
  );
};

export default Sidebar;
