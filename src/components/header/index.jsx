import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PrimaryButton from "../shared/buttons/primaryButton";
import NotificationBar from "../notificationBar";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  useGetUnreadNotificationCount,
  useGetStickyNotes,
} from "../../api/hooks";
import { IoDocumentTextOutline, IoTimeOutline } from "react-icons/io5";
import { syncTimer, updateTimer } from "../../store/slice/timerSlice";

const DashboardHeader = () => {
  const [isNotifyMenuOpen, setNotifyMenuOpen] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { data: unreadData } = useGetUnreadNotificationCount();
  const { data: stickyNotes = [] } = useGetStickyNotes();
  const unreadCount = unreadData?.count || 0;
  const stickyNotesCount = stickyNotes.length || 0;

  // Get timer state from Redux
  const { remainingTime, isRunning } = useSelector((state) => state.timer);

  // Sync timer state on component mount
  useEffect(() => {
    dispatch(syncTimer());
  }, [dispatch]);

  // Update timer display when running
  useEffect(() => {
    let interval;
    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingTime, dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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
        <Link
          to="/timer"
          className={`flexCenter cursor-pointer rounded-[14px] bg-white relative transition-all ${
            isRunning ? "px-3 h-12" : "w-12 h-12"
          }`}
        >
          {isRunning ? (
            <div className="flex items-center gap-2">
              <IoTimeOutline className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-mono font-medium text-blue-600">
                {formatTime(remainingTime)}
              </span>
            </div>
          ) : (
            <IoTimeOutline className="w-5 h-5 text-gray-600" />
          )}
          {isRunning && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
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
