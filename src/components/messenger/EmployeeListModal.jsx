import React, { useState, useEffect } from "react";
import { getCompanyEmployees } from "../../api/chatService";

const EmployeeListModal = ({ onClose, onSelectEmployee }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const result = await getCompanyEmployees();
      if (result.success) {
        setEmployees(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      `${employee.firstName} ${employee.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (employee) => {
    onSelectEmployee(employee._id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Start New Conversation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Employee List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">
                {searchTerm
                  ? "No employees found matching your search"
                  : "No employees available"}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredEmployees.map((employee) => (
                <button
                  key={employee._id}
                  onClick={() => handleEmployeeSelect(employee)}
                  className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    {employee.profileImage ? (
                      <img
                        src={employee.profileImage}
                        alt={`${employee.firstName} ${employee.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {employee.firstName?.[0]}
                          {employee.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </p>
                    {employee.position && (
                      <p className="text-xs text-gray-500">
                        {employee.position}
                      </p>
                    )}
                    <div className="flex items-center mt-1">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          employee.isOnline ? "bg-green-400" : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {employee.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Select an employee to start a direct conversation
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeListModal;
