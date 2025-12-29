import {
    FiAlertCircle,
    FiCalendar,
    FiFlag,
    FiPlay,
    FiPause,
    FiCheckCircle,
} from "react-icons/fi";

/**
 * Get the display title for a filter type
 */
export const getFilterTitle = (filter) => {
    switch (filter) {
        case "overdue":
            return "Overdue Tasks";
        case "in-progress":
            return "In Progress Tasks";
        case "pending":
            return "Pending Tasks";
        case "completed":
            return "Completed Tasks";
        case "approved":
            return "Approved Tasks";
        case "re-work":
            return "Re-work Tasks";
        case "today":
            return "Today's Tasks";
        case "unscheduled":
            return "Unscheduled Tasks";
        case "upcoming":
            return "Upcoming 3 Days Tasks";
        case "on-hold":
            return "On Hold Tasks";
        default:
            return "All Tasks";
    }
};

/**
 * Get the icon component for a filter type
 */
export const getFilterIcon = (filter) => {
    switch (filter) {
        case "overdue":
            return FiAlertCircle;
        case "in-progress":
            return FiPlay;
        case "pending":
            return FiPause;
        case "completed":
            return FiCheckCircle;
        case "approved":
            return FiCheckCircle;
        case "re-work":
            return FiAlertCircle;
        case "unscheduled":
            return FiCalendar;
        case "upcoming":
            return FiCalendar;
        default:
            return FiFlag;
    }
};

/**
 * Get the color class for a filter type
 */
export const getFilterColor = (filter) => {
    switch (filter) {
        case "overdue":
            return "text-red-600";
        case "in-progress":
            return "text-blue-600";
        case "pending":
            return "text-orange-600";
        case "completed":
            return "text-green-600";
        case "approved":
            return "text-teal-600";
        case "re-work":
            return "text-red-600";
        case "unscheduled":
            return "text-gray-600";
        case "upcoming":
            return "text-cyan-600";
        default:
            return "text-gray-600";
    }
};
