import React, { useState } from "react";
import { TbLogout } from "react-icons/tb";
import { SIDE_MENU } from "../../constants";
import { useLocation, useNavigate } from "react-router-dom";
import PrimaryButton from "../shared/buttons/primaryButton";
import { useAuth } from "../../hooks/useAuth";
import { useRouteAccess } from "../../hooks/useRouteAccess";
import { usePermissions } from "../../hooks/usePermissions";
import { MdDashboard } from "react-icons/md";
import {
  useGetTasksOnReview,
  useGetTasksOnPublish,
  useGetClientReviewTasks,
} from "../../api/hooks";
import { assetPath } from "../../utils/assetPath";
const Sidebar = () => {
  const { user } = useAuth();
  const { userPosition } = useRouteAccess();
  const { hasAdminDashboardAccess } = usePermissions();

  // Get current month in YYYY-MM format for tasks on review
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  // Fetch tasks on review count
  const { data: tasksOnReviewData } = useGetTasksOnReview({
    taskMonth: getCurrentMonth(),
  });

  // Fetch tasks on publish count
  const { data: tasksOnPublishData } = useGetTasksOnPublish({
    taskMonth: getCurrentMonth(),
  });

  // Fetch client review tasks count
  const { data: clientReviewData } = useGetClientReviewTasks({
    taskMonth: getCurrentMonth(),
  });

  // Check if user has admin dashboard access permission
  // IMPORTANT: Company admins should NOT see this option - only non-admin users with permission
  const isCompanyAdmin = user?.role === "company-admin";
  const canAccessAdminDashboard = !isCompanyAdmin && hasAdminDashboardAccess();

  // Build sidebar menu items - only add Company Dashboard if user has permission (but NOT for admins)
  const sidebarMenuItems = [...SIDE_MENU];

  // IMPORTANT: Only add Company Dashboard menu item if user has the permission AND is NOT a company admin
  if (canAccessAdminDashboard) {
    // Insert Company Dashboard after Dashboard
    const dashboardIndex = sidebarMenuItems.findIndex(
      (item) => item.routeKey === "dashboard"
    );
    if (dashboardIndex !== -1) {
      sidebarMenuItems.splice(dashboardIndex + 1, 0, {
        id: 13,
        title: "Company Dashboard",
        icon: MdDashboard,
        path: "/company-dashboard",
        routeKey: "company-dashboard",
      });
    }
  }

  // Filter sidebar items based on user's position allowed routes
  const filteredSidebar = sidebarMenuItems.filter((item) => {
    // Company admins have full access to all menu items EXCEPT Company Dashboard
    if (isCompanyAdmin) {
      // Hide Company Dashboard for admins
      if (item.routeKey === "company-dashboard") {
        return false;
      }
      return true;
    }

    // Dashboard, Board, and Settings are always accessible to everyone
    if (
      item.routeKey === "dashboard" ||
      item.routeKey === "board" ||
      item.routeKey === "settings"
    ) {
      return true;
    }

    // Company Dashboard is ONLY accessible if user has the permission (and is NOT an admin)
    if (item.routeKey === "company-dashboard") {
      return canAccessAdminDashboard;
    }

    // For other menu items, check if the routeKey is in their allowed routes
    const allowedRoutes = userPosition?.allowedRoutes || [];
    return allowedRoutes.includes(item.routeKey);
  });

  // Additional debug for each menu item
  if (user?.role !== "company-admin") {
    SIDE_MENU.forEach((item) => {
      const allowedRoutes = userPosition?.allowedRoutes || [];
      const isAlwaysAccessible =
        item.routeKey === "dashboard" ||
        item.routeKey === "board" ||
        item.routeKey === "settings";
      const hasRouteAccess = allowedRoutes.includes(item.routeKey);
      const hasAccess = isAlwaysAccessible || hasRouteAccess;
    });
  }

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleLogout = () => {
    navigate("/auth/signin");
  };
  return (
    <section
      className=" flex-col min-w-[220px] hidden lg:flex  my-3 ml-3 justify-between
     rounded-[24px] gap-y-10 bg-white p-3"
    >
      <div className="flex flex-col  overflow-y-auto scrollbar-hide">
        <ul className="flex flex-col gap-y-1  text-[#7D8592] ">
          {filteredSidebar.length > 0 ? (
            filteredSidebar.map((item, index) => {
              // Get count for "Task on Review", "Task on Publish", and "Client Review" menu items
              const getTaskCount = () => {
                if (
                  item.routeKey === "task-on-review" &&
                  tasksOnReviewData?.tasks?.length
                ) {
                  return tasksOnReviewData.tasks.length;
                }
                if (
                  item.routeKey === "task-on-publish" &&
                  tasksOnPublishData?.tasks?.length
                ) {
                  return tasksOnPublishData.tasks.length;
                }
                if (
                  item.routeKey === "client-review" &&
                  clientReviewData?.tasks?.length
                ) {
                  return clientReviewData.tasks.length;
                }
                return null;
              };

              const taskCount = getTaskCount();

              return (
                <li
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={` relative cursor-pointer px-2 py-[10px] flexStart
          gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] group ${pathname === item.path && `bg-[#ECF3FF] text-[#3F8CFF]`
                    }`}
                >
                  <item.icon className="text-lg group-hover:text-[#3F8CFF]" />
                  <span
                    className="group-hover:text-[#3F8CFF] group-hover:translate-x-1
            transition-all duration-300 text-sm flex-1"
                  >
                    {item.title}
                  </span>
                  {taskCount !== null && taskCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[20px] text-center">
                      {taskCount}
                    </span>
                  )}
                  <span
                    className="absolute hidden group-hover:block
            -right-2.5 h-full w-1 bg-[#3F8CFF]"
                  ></span>
                </li>
              );
            })
          ) : (
            <li className="px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] text-[#7D8592] text-[13px]">
              <span>No accessible menu items</span>
            </li>
          )}
        </ul>
      </div>
      <div className="flex flex-col ">
        <div className="h-[95px] mt-3 justify-center  w-full flex items-end bg-[#F4F9FD] relative rounded-[24px] p-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="flexCenter  
       gap-x-2 rounded-[14px] cursor-pointer bg-[#3F8CFF] text-white w-fit px-5 py-2
    text-sm font-medium"
          >
            <img src={assetPath("icons/chat.svg")} alt="" loading="lazy" className="w-4" />
            <span>Support</span>
          </button>
          <img
            src="/image/support.svg"
            alt=""
            loading="lazy"
            className="absolute w-22 -top-10"
          />
        </div>
        <button
          onClick={handleLogout}
          className="text-[#7D8592] mt-2 px-2 py-[10px] rounded-[10px]  
  flexStart gap-x-3.5 hover:text-[#3F8CFF] text-sm"
        >
          <TbLogout className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
      {/* support section  */}
      {isMenuOpen && (
        <div
          className="fixed left-0 right-0 top-0 
      bottom-0 m-auto bg-black/40 backdrop-blur-sm flexCenter z-[1000]"
        >
          <div className="max-w-lg bg-white w-full rounded-3xl p-7 px-9 flex flex-col">
            <div className="flexBetween">
              <h4 className="text-lg font-medium">Need some Help?</h4>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-11 h-11 flexCenter bg-[#F4F9FD] rounded-2xl"
              >
                <img
                  src={assetPath("icons/cancel.svg")}
                  alt=""
                  className="w-5"
                  loading="lazy"
                />
              </button>
            </div>
            <div className="mt-4">
              <img src="/image/support.png" alt="" loading="lazy" />
            </div>
            <p className="text-gray-600 mt-3">
              Describe your question and our specialists will answer you within
              24 hours.
            </p>
            <form
              action="
          "
              className="mt-4 flex flex-col gap-y-3"
            >
              <div className="flex flex-col gap-y-2">
                <span className="text-[#7D8592] font-medium text-sm">
                  Request Subject
                </span>
                <div className="p-3 border rounded-xl h-12 border-[#D8E0F0]"></div>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-[#7D8592] font-medium text-sm">
                  Description
                </span>
                <textarea
                  placeholder="Add some description of the request "
                  className="p-3 border rounded-xl h-28 text-sm border-[#D8E0F0]"
                />
              </div>
              <div className="flexEnd mt-2">
                <PrimaryButton title={"Send Request"} />
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Sidebar;
