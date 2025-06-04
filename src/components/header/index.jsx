import React, { useState } from "react";
import PrimaryButton from "../shared/buttons/primaryButton";
import NotificationBar from "../notificationBar";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  useGetUnreadNotificationCount,
  useGetStickyNotes,
} from "../../api/hooks";
import { IoDocumentTextOutline } from "react-icons/io5";

const DashboardHeader = () => {
  const [isNotifyMenuOpen, setNotifyMenuOpen] = useState(false);
  const { user } = useAuth();
  const { data: unreadData } = useGetUnreadNotificationCount();
  const { data: stickyNotes = [] } = useGetStickyNotes();
  const unreadCount = unreadData?.count || 0;
  const stickyNotesCount = stickyNotes.length || 0;

  return (
    <div className="flexBetween">
      <div className="relative  w-1/3">
        <input
          type="text"
          className="bg-white py-3 text-sm w-full  rounded-[14px] pr-3 pl-11 outline-none"
          placeholder="Search"
        />
        <img
          src="/icons/search.svg"
          alt=""
          className="absolute top-0 bottom-0 h-fit my-auto left-3"
        />
      </div>
      <div className="flexEnd gap-x-2  ">
        <Link
          to="/sticky-notes"
          className="flexCenter cursor-pointer w-12 h-12 rounded-[14px] bg-white relative"
        >
          <IoDocumentTextOutline className="w-5 h-5 text-gray-600" />
          {stickyNotesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {stickyNotesCount > 9 ? "9+" : stickyNotesCount}
            </span>
          )}
        </Link>
        <button
          onClick={() => setNotifyMenuOpen(true)}
          className="flexCenter cursor-pointer w-12 h-12 rounded-[14px] bg-white relative"
        >
          <img src={"/icons/alert.svg"} alt="" className="w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <div className="h-12 rounded-[14px] gap-x-2 px-3 w-fit bg-white flexCenter  ">
          <div className="w-[30px] aspect-square rounded-full overflow-hidden bg-black">
            <img
              src={user?.profileImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <Link
            to={"/settings/account"}
            className="flexStart gap-x-3.5 cursor-pointer"
          >
            <span className="text-sm font-medium ">{user?.firstName}</span>
            <img src="/icons/arrowDown.svg" alt="" className="w-5" />
          </Link>
        </div>
      </div>
      {isNotifyMenuOpen && (
        <NotificationBar setNotifyMenuOpen={setNotifyMenuOpen} />
      )}
    </div>
  );
};

export default DashboardHeader;
