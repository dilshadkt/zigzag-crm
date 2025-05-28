import React from "react";
import { format, differenceInCalendarDays } from "date-fns";

const LeaveCard = ({ request }) => {
  // Set color based on leave type
  const getTypeColor = () => {
    switch (request?.type) {
      case "vacation":
        return "#15C0E6";
      case "sick_leave":
        return "#F65160";
      case "remote_work":
        return "#6D5DD3";
      default:
        return "#91929E";
    }
  };

  // Format type name for display
  const getTypeName = () => {
    return request?.type
      ?.replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get button style based on status
  const getStatusStyle = () => {
    switch (request?.status) {
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "pending":
      default:
        return "bg-[#FDC748] text-white";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Calculate duration in days
  const calculateDuration = () => {
    if (!request?.startDate || !request?.endDate) return 1;

    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    // Add 1 to include both start and end dates
    return differenceInCalendarDays(endDate, startDate) + 1;
  };

  // Get duration from request or calculate it
  const duration = request?.duration || calculateDuration();

  return (
    <div className="bg-white rounded-3xl p-6 grid grid-cols-3 mb-3">
      <div className="flex flex-col max-w-sm w-full">
        <span className="text-xs font-medium text-[#91929E]">Request Type</span>
        <div className="flexStart gap-x-2 mt-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getTypeColor() }}
          ></div>
          <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
            {getTypeName()}
          </span>
        </div>
        {request?.project && (
          <span className="text-xs text-gray-500 mt-1">
            Project: {request.project}
          </span>
        )}
        {request?.reason && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            Reason: {request.reason}
          </p>
        )}
      </div>
      <div className="col-span-2 grid grid-cols-4 w-full">
        <div className="flex flex-col gap-y-2">
          <span className="text-xs font-medium text-[#91929E]">Duration</span>
          <span className="font-semibold text-gray-800 text-sm">
            {duration} {duration === 1 ? "day" : "days"}
          </span>
        </div>
        <div className="flex flex-col gap-y-2">
          <span className="text-xs font-medium text-[#91929E]">Start Day</span>
          <span className="font-semibold text-gray-800 text-sm">
            {request?.startDate ? formatDate(request.startDate) : "N/A"}
          </span>
        </div>
        <div className="flex flex-col gap-y-2">
          <span className="text-xs font-medium text-[#91929E]">End Day</span>
          <span className="font-semibold text-gray-800 text-sm">
            {request?.endDate ? formatDate(request.endDate) : "N/A"}
          </span>
        </div>
        <div className="flexEnd">
          <button
            className={`${getStatusStyle()}
            text-sm min-w-28 cursor-default font-medium rounded-lg p-2 w-fit h-fit`}
          >
            {request?.status?.charAt(0).toUpperCase() +
              request?.status?.slice(1) || "Pending"}
          </button>
          {/* {request?.approvedBy && request?.status !== "pending" && (
            <p className="text-xs text-right text-gray-500 mt-1">
              By: {request.approvedBy}
            </p>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default LeaveCard;
