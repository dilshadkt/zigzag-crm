import React from "react";

const ProjectFieldsSection = ({
  fields = [],
  isLoading,
  error,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="mt-4">
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-32 bg-white rounded-xl border border-gray-200 shadow-sm">
          <img
            src="/icons/loading.svg"
            alt="Loading"
            className="w-8 h-8 mb-2"
          />
          <p className="text-gray-500 text-xs">Loading custom fields...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-red-800">
              Error loading custom fields: {error.message}
            </div>
          </div>
        </div>
      ) : !fields || fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 bg-white rounded-xl border border-gray-200 shadow-sm">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No custom fields found
          </h3>
          <p className="text-xs text-gray-500 text-center max-w-sm">
            Create custom fields to capture additional details when adding new projects.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                  Field Label
                </h3>
              </div>
              <div className="col-span-3">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </h3>
              </div>
              <div className="col-span-3">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                  Is Required
                </h3>
              </div>
              <div className="col-span-2">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider text-right">
                  Actions
                </h3>
              </div>
            </div>
          </div>

          {/* Custom Field Rows */}
          <div className="divide-y divide-gray-100">
            {fields.map((field) => (
              <div
                key={field._id || field.id}
                className={`px-4 py-4 hover:bg-gray-50 transition-colors duration-150`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Field Label */}
                  <div className="col-span-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {field.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Field Type */}
                  <div className="col-span-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {field.type}
                    </span>
                  </div>

                  {/* Required Status */}
                  <div className="col-span-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border ${field.isRequired
                        ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                    >
                      {field.isRequired ? "Yes" : "Optional"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onEdit(field)}
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors duration-150"
                        title="Edit custom field"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                      <button
                        onClick={() => onDelete(field)}
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
                        title="Delete custom field"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {fields && fields.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-600">
              Showing {fields.length} custom field{fields.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectFieldsSection;
