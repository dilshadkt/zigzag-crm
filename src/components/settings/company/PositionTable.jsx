import React from "react";

const PositionTable = ({
  positions,
  isLoading,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isDefaultPosition = (name) => {
    const defaultPositions = [
      "Admin",
      "Project Manager",
      "Team Lead",
      "Employee",
      "Designer",
      "Developer",
    ];
    return defaultPositions.includes(name);
  };

  return (
    <div className="flex-1 md:overflow-y-auto min-h-[500px] md:max-h-[300px]">
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-full bg-white rounded-xl border border-gray-200 shadow-sm">
          <img
            src="/icons/loading.svg"
            alt="Loading"
            className="w-10 h-10 mb-3"
          />
          <p className="text-gray-500 text-xs">Loading positions...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-fit md:h-full flex flex-col overflow-hidden">
          {/* Table Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                  Position Name
                </h3>
              </div>
              <div className="col-span-6">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                  Allowed Routes
                </h3>
              </div>
              <div className="col-span-2">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </h3>
              </div>
              <div className="col-span-1">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider text-right">
                  Actions
                </h3>
              </div>
            </div>
          </div>

          {/* Scrollable Table Body */}
          <div className="flex-1 h-full md:overflow-y-auto">
            {console.log(
              "Rendering table with positions:",
              positions?.positions?.length,
              "positions"
            )}
            {/* Debug: Show positions count */}
            <div className="bg-blue-100 p-2 text-xs">
              Found {positions?.positions?.length || 0} positions to display
            </div>
            {positions?.positions?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No positions found
                </h3>
                <p className="text-xs text-gray-500 text-center max-w-sm">
                  Get started by creating your first position to manage team
                  access and permissions.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {positions?.positions?.map((position, index) => (
                  <div
                    key={position._id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                      !position.isActive ? "bg-gray-25 opacity-75" : ""
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Position Name */}
                      <div className="col-span-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-semibold">
                              {position.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-900 flex items-center">
                              {position.name}
                              {isDefaultPosition(position.name) && (
                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Position #{index + 1}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Allowed Routes */}
                      <div className="col-span-6">
                        <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                          {position.allowedRoutes.slice(0, 4).map((route) => (
                            <span
                              key={route}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                              {route}
                            </span>
                          ))}
                          {position.allowedRoutes.length > 4 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              +{position.allowedRoutes.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            position.isActive
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full mr-1 ${
                              position.isActive ? "bg-green-400" : "bg-red-400"
                            }`}
                          ></span>
                          {position.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEdit(position)}
                            className="inline-flex items-center p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors duration-150"
                            title="Edit position"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {position.isActive ? (
                            <button
                              onClick={() => onDelete(position)}
                              className="inline-flex items-center p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-150"
                              title="Delete position"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => onRestore(position)}
                              className="inline-flex items-center p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-150"
                              title="Restore position"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {positions?.positions?.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  Showing {positions.positions.length} position
                  {positions.positions.length !== 1 ? "s" : ""}
                </span>
                <span>
                  {positions.positions.filter((p) => p.isActive).length} active,{" "}
                  {positions.positions.filter((p) => !p.isActive).length}{" "}
                  inactive
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PositionTable;
