import React, { useEffect, useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useEmpoyees } from "../../../api/hooks";

const AddEmployee = ({ onChange, defaultSelectedEmployee }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState(
    defaultSelectedEmployee || []
  );
  const { data: employeesList, isLoading } = useEmpoyees();
  // Filter employees based on search term
  const filteredEmployees = employeesList?.filter((employee) =>
    employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee?.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    if (!selectedEmployees.some((emp) => emp._id === employee._id)) {
      setSelectedEmployees([...selectedEmployees, employee]);
    } else {
      setSelectedEmployees(
        selectedEmployees.filter((emp) => emp._id !== employee._id)
      );
    }
  };

  // Handle add button click
  const handleAddClick = () => {
    setShowDropdown(false);
    setSearchTerm("");
  };

  useEffect(() => {
    onChange(selectedEmployees);
  }, [selectedEmployees]);

  if (isLoading) {
    return <h2>Loading ....</h2>;
  }

  return (
    <div className="flex relative flex-col gap-y-2 min-h-60">
      <label className="text-sm pl-2 font-bold text-gray-500">Team</label>
      <div className="w-full gap-x-2 relative flex items-start">
        <div className="w-full">
          <input
            type="text"
            className="rounded-lg text-sm border-2 text-gray-500 border-gray-200/80 py-2 px-4 outline-none focus:outline-none w-full"
            placeholder="Search by name, position or email"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
          />

          {/* Dropdown Results */}
          {showDropdown && searchTerm && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredEmployees?.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={selectedEmployees.some(
                        (emp) => emp._id === employee._id
                      )}
                      onChange={() => {}}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-800">
                          {employee?.name}
                        </span>
                        <span className="text-xs rounded-lg ml-3 bg-gray-100 px-2">
                          {employee?.position}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {employee?.email}
                        </span>
                        <span className="text-xs rounded-lg ml-3 bg-blue-100 text-blue-800 px-2">
                          {employee?.level || 'No Level'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500">No employees found</div>
              )}
            </div>
          )}

          {/* Selected Employees */}
          {selectedEmployees.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedEmployees.map((employee) => (
                <div
                  key={employee?._id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="text-sm">{employee?.name}</span>
                  <button
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <PrimaryButton
          title={"Add"}
          className="px-7 text-white"
          onclick={handleAddClick}
        />
      </div>
    </div>
  );
};

export default AddEmployee;
