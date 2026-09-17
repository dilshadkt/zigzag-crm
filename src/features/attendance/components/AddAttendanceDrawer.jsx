import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { attendanceApi } from "../api/attendanceApi";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/client"; // To fetch users

const AddAttendanceDrawer = ({ isOpen, onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    clockInTime: "",
    clockOutTime: "",
    workDescription: "",
    adminNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      // Reset form
      setFormData({
        employeeId: "",
        date: new Date().toISOString().split("T")[0],
        clockInTime: "",
        clockOutTime: "",
        workDescription: "",
        adminNotes: "",
      });
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await apiClient.get("/employee?view=select&limit=100");
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error("Failed to load employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.date || !formData.clockInTime) {
      toast.error("Employee, Date, and Clock In Time are required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const clockInDate = new Date(`${formData.date}T${formData.clockInTime}`);
      const clockOutDate = formData.clockOutTime 
        ? new Date(`${formData.date}T${formData.clockOutTime}`)
        : null;

      if (clockOutDate && clockOutDate < clockInDate) {
        toast.error("Clock out time must be after clock in time");
        return;
      }

      await attendanceApi.createAttendance({
        employeeId: formData.employeeId,
        date: formData.date,
        clockInTime: clockInDate.toISOString(),
        clockOutTime: clockOutDate ? clockOutDate.toISOString() : null,
        workDescription: formData.workDescription,
        adminNotes: formData.adminNotes,
      });

      toast.success("Attendance record added successfully");
      queryClient.invalidateQueries({ queryKey: ["dailyReport"] });
      queryClient.invalidateQueries({ queryKey: ["dateRangeReport"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceSummary"] });
      
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[80] backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#F8FAFC] z-[90] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">
              Manual Attendance
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add a custom attendance record
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-6">
          <form id="attendance-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                disabled={loadingEmployees}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clock In Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="clockInTime"
                  value={formData.clockInTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clock Out Time
                </label>
                <input
                  type="time"
                  name="clockOutTime"
                  value={formData.clockOutTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Description
              </label>
              <textarea
                name="workDescription"
                value={formData.workDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                placeholder="What did the employee work on?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes
              </label>
              <textarea
                name="adminNotes"
                value={formData.adminNotes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                placeholder="Any internal notes?"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="attendance-form"
            disabled={isSubmitting}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white bg-[#3F8CFF] hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddAttendanceDrawer;
