import React from "react";
import { useRouteAccess } from "../../hooks/useRouteAccess";

const PositionAccessInfo = () => {
  const { userPosition, getAllowedRoutes, hasAccessToCurrentRoute } = useRouteAccess();

  if (!userPosition) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              No Position Assigned
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>You don't have a position assigned. Please contact your administrator.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allowedRoutes = getAllowedRoutes();
  const currentRouteAccess = hasAccessToCurrentRoute();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Your Position: {userPosition.name}
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p className="mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                userPosition.isActive 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {userPosition.isActive ? "Active" : "Inactive"}
              </span>
            </p>
            <p className="mb-2">
              <strong>Allowed Routes ({allowedRoutes.length}):</strong>
            </p>
            <div className="flex flex-wrap gap-1">
              {allowedRoutes.length > 0 ? (
                allowedRoutes.map((route, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {route}
                  </span>
                ))
              ) : (
                <span className="text-yellow-600 text-xs">No routes assigned</span>
              )}
            </div>
            <p className="mt-2 text-xs">
              <span className={`font-medium ${currentRouteAccess ? 'text-green-600' : 'text-red-600'}`}>
                Current page access: {currentRouteAccess ? 'Allowed' : 'Denied'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionAccessInfo; 