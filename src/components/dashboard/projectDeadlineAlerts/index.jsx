import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetNotifications, useMarkNotificationAsRead } from "../../../api/hooks";
import { MdOutlineTimer } from "react-icons/md";
import apiClient from "../../../api/client";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const AlertCard = ({ alert }) => {
  const navigate = useNavigate();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleExtend = async (months) => {
    setIsUpdating(true);
    try {
      const currentEndDate = new Date(alert.data.dueDate);
      const newEndDate = new Date(currentEndDate.setMonth(currentEndDate.getMonth() + months));
      
      await apiClient.patch(`/projects/${alert.data.projectId}`, { endDate: newEndDate });
      
      markAsRead(alert._id);
      toast.success(`Deadline extended by ${months} ${months === 1 ? 'month' : 'months'}`);
      
      queryClient.invalidateQueries({ queryKey: ["companyProjects"] });
      queryClient.invalidateQueries({ queryKey: ["employeeProjects"] });
      queryClient.invalidateQueries({ queryKey: ["projectDetails", alert.data.projectId] });
    } catch (err) {
      toast.error("Failed to extend deadline");
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-[#E4E6E8] flex flex-col gap-y-3 relative overflow-hidden">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="flex justify-between items-start">
        <span className="font-semibold text-gray-800 line-clamp-1">
          {alert.data?.projectName}
        </span>
        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full whitespace-nowrap">
          {(() => {
            const hours = alert.data?.hoursUntilDue || 0;
            const days = Math.ceil(hours / 24);
            if (days < 0) {
              return `${Math.abs(days)} days overdue`;
            } else if (days > 0) {
              return `${days} days left`;
            } else {
              return "Due today";
            }
          })()}
        </span>
      </div>
      <p className="text-xs text-gray-600">
        {alert.message}
      </p>
      
      <div className="mt-2 flex flex-col gap-y-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quick Extend</span>
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => handleExtend(3)}
            disabled={isUpdating}
            className="text-xs py-1.5 px-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium text-center"
          >
            3 Months
          </button>
          <button 
            onClick={() => handleExtend(6)}
            disabled={isUpdating}
            className="text-xs py-1.5 px-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium text-center"
          >
            6 Months
          </button>
          <button 
            onClick={() => handleExtend(12)}
            disabled={isUpdating}
            className="text-xs py-1.5 px-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium text-center"
          >
            1 Year
          </button>
        </div>
        <button 
          onClick={() => navigate(`/projects/${alert.data?.projectId}/edit`)}
          className="text-xs py-1.5 px-2 w-full mt-1 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          Custom (Edit Project)
        </button>
      </div>
    </div>
  );
};

const ProjectDeadlineAlerts = ({ activeProjects = [] }) => {
  const { data: notificationsData } = useGetNotifications(50);
  
  const notifications = notificationsData?.notifications || [];
  
  // Filter for unread project deadline reminders and ensure project is still active/not paused
  const deadlineAlerts = notifications.filter(
    (n) => n.type === "project_deadline_reminder" && 
           !n.read && 
           activeProjects.some(p => p._id === n.data?.projectId)
  );

  if (deadlineAlerts.length === 0) return null;

  return (
    <div className="w-full mt-3 bg-white pb-3 pt-5 px-4 flex flex-col rounded-3xl">
      <div className="flex items-center gap-x-2 mb-4">
        <MdOutlineTimer className="w-5 h-5 text-red-500" />
        <h4 className="font-semibold text-lg text-gray-800">
          Project Deadlines Approaching
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deadlineAlerts.map((alert) => (
          <AlertCard key={alert._id} alert={alert} />
        ))}
      </div>
    </div>
  );
};

export default ProjectDeadlineAlerts;
