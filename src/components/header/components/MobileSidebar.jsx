import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import logo from "../../../assets/icons/logo.svg";
import {
  useGetTasksOnReview,
  useGetTasksOnPublish,
  useGetClientReviewTasks,
  useGetUnreadMessageCount,
} from "../../../api/hooks";

const MobileSidebar = ({
  isOpen,
  onClose,
  filteredSidebar,
  user,
  onLogout,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Get current month in YYYY-MM format for tasks count
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  // Fetch tasks and counts
  const { data: tasksOnReviewData } = useGetTasksOnReview({
    taskMonth: getCurrentMonth(),
  });
  const { data: tasksOnPublishData } = useGetTasksOnPublish({
    taskMonth: getCurrentMonth(),
  });
  const { data: clientReviewData } = useGetClientReviewTasks({
    taskMonth: getCurrentMonth(),
  });
  const { data: unreadMessageCount = 0 } = useGetUnreadMessageCount();

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

  const getTaskCount = (menuItem) => {
    if (
      menuItem.routeKey === "task-on-review" &&
      tasksOnReviewData?.tasks?.length
    ) {
      return tasksOnReviewData.tasks.length;
    }
    if (
      menuItem.routeKey === "task-on-publish" &&
      (tasksOnPublishData?.statistics?.publishPending ||
        tasksOnPublishData?.tasks?.length)
    ) {
      return (
        tasksOnPublishData.statistics?.publishPending ??
        tasksOnPublishData.tasks.filter(
          (task) => !task.parentTask && task.type !== "subtask"
        ).length
      );
    }
    if (
      menuItem.routeKey === "client-review" &&
      clientReviewData?.tasks?.length
    ) {
      return clientReviewData.tasks.length;
    }
    if (menuItem.routeKey === "messenger" && unreadMessageCount > 0) {
      return unreadMessageCount;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#2155A3]/20"
      />
      <aside
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="absolute top-0 left-0 z-[1] flex h-full w-[min(240px,85vw)] flex-col justify-between overflow-hidden bg-white p-3 shadow-2xl"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <img src={logo} alt="" className="w-10" />
          {/* Menu Items */}
          <ul className="flex flex-col  h-full
           overflow-y-auto gap-y-1 mt-5 text-[#7D8592]">
            {filteredSidebar.length > 0 ? (
              filteredSidebar.map((item, index) => {
                const hasChildren = item.children && item.children.length > 0;
                const isOpenMenu = openMenus[item.title];
                const isActive = pathname === item.path || (hasChildren && item.children.some(child => pathname === child.path));
                const taskCount = getTaskCount(item);

                return (
                  <li key={index} className="flex flex-col gap-y-1">
                    <div
                      onClick={(e) => {
                        if (hasChildren) {
                          toggleMenu(item.title);
                        } else {
                          onClose();
                          navigate(item.path);
                        }
                      }}
                      className={`relative cursor-pointer px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] group ${isActive && `bg-[#ECF3FF] text-[#3F8CFF]`
                        }`}
                    >
                      <item.icon className="text-lg group-hover:text-[#3F8CFF]" />
                      <span className="group-hover:text-[#3F8CFF] group-hover:translate-x-1 transition-all duration-300 text-sm flex-1">
                        {item.title}
                      </span>
                      {taskCount !== null && taskCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[20px] text-center">
                          {taskCount}
                        </span>
                      )}
                      {hasChildren && (
                        <div className="text-gray-400">
                          {isOpenMenu ? (
                            <MdKeyboardArrowDown className="text-xl" />
                          ) : (
                            <MdKeyboardArrowRight className="text-xl" />
                          )}
                        </div>
                      )}
                      <span className="absolute hidden group-hover:block -right-2.5 h-full w-1 bg-[#3F8CFF]"></span>
                    </div>

                    {/* Sub-items */}
                    {hasChildren && isOpenMenu && (
                      <ul className="flex flex-col gap-y-1 pl-10">
                        {item.children.map((child, childIdx) => {
                          const childTaskCount = getTaskCount(child);
                          const isChildActive = pathname === child.path;

                          return (
                            <li
                              key={childIdx}
                              onClick={() => {
                                onClose();
                                navigate(child.path);
                              }}
                              className={`relative cursor-pointer py-[8px] flexStart gap-x-3 rounded-[8px] hover:bg-[#ECF3FF] group ${isChildActive && `text-[#3F8CFF]`
                                }`}
                            >
                              <span
                                className={`group-hover:text-[#3F8CFF] group-hover:translate-x-1 transition-all duration-300 text-[13px] flex-1 ${isChildActive ? 'font-medium' : ''}`}
                              >
                                {child.title}
                              </span>
                              {childTaskCount !== null && childTaskCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-full min-w-[16px] text-center">
                                  {childTaskCount}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
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

        {/* Logout Button */}
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="relative text-[#7D8592] cursor-pointer px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] font-semibold group"
        >
          <IoLogOutOutline className="text-lg group-hover:text-[#3F8CFF]" />
          <span className="group-hover:text-[#3F8CFF] group-hover:translate-x-1 transition-all duration-300 text-sm">
            Logout
          </span>
          <span className="absolute hidden group-hover:block -right-2.5 h-full w-1 bg-[#3F8CFF]"></span>
        </button>
      </aside>
    </div>
  );
};

export default MobileSidebar;
