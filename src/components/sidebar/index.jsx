import React, { useState } from "react";
import { TbLogout } from "react-icons/tb";
import { SIDE_MENU } from "../../constants";
import { useLocation, useNavigate } from "react-router-dom";
import PrimaryButton from "../shared/buttons/primaryButton";
import { useAuth } from "../../hooks/useAuth";
import { useRouteAccess } from "../../hooks/useRouteAccess";
const Sidebar = () => {
  const { user } = useAuth();
  const { hasAccessToRoute, userPosition } = useRouteAccess();
  // Filter sidebar items based on user's position allowed routes
  const filteredSidebar = SIDE_MENU.filter((item) => {
    // Company admins have full access to all menu items
    if (user?.role === "company-admin") {
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

    // For other users, check if the routeKey is in their allowed routes
    const allowedRoutes = userPosition?.allowedRoutes || [];
    return allowedRoutes.includes(item.routeKey);
  });

  // Debug information (can be removed in production)
  const debugInfo = {
    userRole: user?.role,
    userPosition: userPosition?.name,
    allowedRoutes: userPosition?.allowedRoutes || [],
    totalMenuItems: SIDE_MENU.length,
    accessibleItems: filteredSidebar.length,
  };

  // Additional debug for each menu item
  if (user?.role !== "company-admin") {
    console.log("Menu item access details:");
    SIDE_MENU.forEach((item) => {
      const allowedRoutes = userPosition?.allowedRoutes || [];
      const isAlwaysAccessible =
        item.routeKey === "dashboard" ||
        item.routeKey === "board" ||
        item.routeKey === "settings";
      const hasRouteAccess = allowedRoutes.includes(item.routeKey);
      const hasAccess = isAlwaysAccessible || hasRouteAccess;
      console.log(
        `${item.title}: routeKey=${item.routeKey}, alwaysAccessible=${isAlwaysAccessible}, hasRouteAccess=${hasRouteAccess}, hasAccess=${hasAccess}, path=${item.path}`
      );
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
      className="flex flex-col min-w-[220px]  my-3 ml-3 justify-between
     rounded-[24px] bg-white p-3"
    >
      <div className="flex flex-col">
        {/* <div className="h-[40px] flexCenter "></div> */}
        <ul className="flex flex-col gap-y-1  text-[#7D8592] ">
          {filteredSidebar.length > 0 ? (
            filteredSidebar.map((item, index) => (
              <li
                key={index}
                onClick={() => navigate(item.path)}
                className={` relative cursor-pointer px-2 py-[10px] flexStart
        gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] group ${
          pathname === item.path && `bg-[#ECF3FF] text-[#3F8CFF]`
        }`}
              >
                <item.icon className="text-lg group-hover:text-[#3F8CFF]" />
                <span
                  className="group-hover:text-[#3F8CFF] group-hover:translate-x-1
          transition-all duration-300 text-[15px]"
                >
                  {item.title}
                </span>
                <span
                  className="absolute hidden group-hover:block
          -right-2.5 h-full w-1 bg-[#3F8CFF]"
                ></span>
              </li>
            ))
          ) : (
            <li className="px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] text-[#7D8592] text-[13px]">
              <span>No accessible menu items</span>
            </li>
          )}
        </ul>

        {/* Debug Panel (Development Only) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded-lg">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-gray-600 hover:text-gray-800 mb-2"
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
            {showDebug && (
              <div className="text-xs text-gray-600 space-y-1">
                <div>Role: {debugInfo.userRole}</div>
                <div>Position: {debugInfo.userPosition || 'None'}</div>
                <div>Allowed Routes: {debugInfo.allowedRoutes.length}</div>
                <div>Menu Items: {debugInfo.accessibleItems}/{debugInfo.totalMenuItems}</div>
                <div className="text-[10px] mt-1">
                  Routes: {debugInfo.allowedRoutes.join(', ')}
                </div>
              </div>
            )}
          </div>
        )} */}
      </div>

      <div className="flex flex-col">
        <div className="h-[130px] justify-center  w-full flex items-end bg-[#F4F9FD] relative rounded-[24px] p-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="flexCenter  
       gap-x-2 rounded-[14px] cursor-pointer bg-[#3F8CFF] text-white w-fit px-5 py-2
    text-sm font-medium"
          >
            <img src="/icons/chat.svg" alt="" className="w-6" />
            <span>Support</span>
          </button>
          <img
            src="/image/support.svg"
            alt=""
            className="absolute w-27 -top-10"
          />
        </div>
        <button
          onClick={handleLogout}
          className="text-[#7D8592] mt-2 px-2 py-[10px] rounded-[10px]  
  flexStart gap-x-3.5 hover:text-[#3F8CFF] text-sm"
        >
          <TbLogout className="text-xl" />
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
                  src="/icons/cancel.svg"
                  alt=""
                  className="w-5"
                  loading="lazy"
                />
              </button>
            </div>
            <div className="mt-4">
              <img src="/image/support.png" alt="" />
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
