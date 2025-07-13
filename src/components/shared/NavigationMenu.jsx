import React from "react";
import { useRouteAccess } from "../../hooks/useRouteAccess";

const NavigationMenu = ({ menuItems, onItemClick }) => {
  const { hasAccessToRoute } = useRouteAccess();

  const filteredMenuItems = menuItems.filter(item => {
    // If no route specified, show the item
    if (!item.route) return true;
    
    // Check if user has access to this route
    return hasAccessToRoute(item.route);
  });

  return (
    <nav className="space-y-1">
      {filteredMenuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => onItemClick(item)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
            item.isActive
              ? "bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          {item.icon && (
            <span className="mr-3 flex-shrink-0">
              {item.icon}
            </span>
          )}
          {item.label}
          {item.badge && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {item.badge}
            </span>
          )}
        </button>
      ))}
      
      {filteredMenuItems.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-500">
          No accessible menu items
        </div>
      )}
    </nav>
  );
};

export default NavigationMenu; 