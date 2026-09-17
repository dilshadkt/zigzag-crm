import React, { useState } from "react";
import { format } from "date-fns";
import { RiCalendarEventLine, RiErrorWarningLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { useAuth } from "../../hooks/useAuth";
import { useUpdateSubTaskById, useGetAllEmployees } from "../../api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import SearchableSelect from "../pages/campaigns/SearchableSelect";

const DepartmentConflictCard = ({ conflict }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { _id, title, assignedTo, project, conflictVacationId, startDate, dueDate, parentTask } = conflict;
  const employee = assignedTo?.[0];

  const [newStartDate, setNewStartDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAssignee, setNewAssignee] = useState("");

  const { data: employeesData } = useGetAllEmployees(isModalOpen);
  const employeesList = employeesData?.employees || (Array.isArray(employeesData) ? employeesData : []);

  const hasNoReporters = !project?.reporters || project.reporters.length === 0;
  const isReporter = hasNoReporters || project?.reporters?.some(r => r === user?._id || r?._id === user?._id);

  const parentTaskId = typeof parentTask === 'object' ? parentTask?._id : parentTask;
  const updateTask = useUpdateSubTaskById(_id, parentTaskId);
  
  const handleSuccess = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries(["departmentConflicts"]);
  };

  const handleUpdateDate = (e) => {
    e.preventDefault();
    if (!newDueDate) return;
    
    const payload = {
      dueDate: newDueDate,
      isReportedConflict: false,
      conflictVacationId: null,
    };
    
    if (newStartDate) payload.startDate = newStartDate;
    if (newAssignee) payload.assignedTo = [newAssignee];
    
    updateTask.mutate(payload, {
      onSuccess: handleSuccess,
    });
  };

  return (
    <>
      <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-red-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-red-500 font-bold">
            {employee?.profileImage ? (
              <img src={employee.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              employee?.firstName?.charAt(0) || "U"
            )}
          </div>
          
          <div>
            <h4 className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5 line-clamp-1">
              <RiErrorWarningLine className="text-red-500" /> {parentTask?.title ? `${parentTask.title} - ${title}` : title}
            </h4>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Assigned to <span className="font-semibold">{employee?.firstName} {employee?.lastName}</span>
            </p>
            
            <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-medium">
              <span className="bg-white border border-red-100 text-red-600 px-2 py-1 rounded shadow-sm">
                Task Due: {dueDate ? format(new Date(dueDate), "MMM dd, yyyy") : "No date"}
              </span>
              {conflictVacationId && (
                <span className="bg-white border border-gray-100 text-gray-600 px-2 py-1 rounded shadow-sm flex items-center gap-1">
                  <RiCalendarEventLine /> Leave: {format(new Date(conflictVacationId.startDate), "MMM dd")} - {format(new Date(conflictVacationId.endDate), "MMM dd")}
                </span>
              )}
              {project && (
                <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                  Project: {project.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 mt-2 sm:mt-0">
          {isReporter ? (
            <button
              onClick={() => {
                setNewStartDate(startDate ? format(new Date(startDate), "yyyy-MM-dd") : "");
                setNewDueDate(dueDate ? format(new Date(dueDate), "yyyy-MM-dd") : "");
                setNewAssignee(employee?._id || "");
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 text-[11px] font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg shadow-sm transition-colors"
            >
              Modify Task
            </button>
          ) : (
            <span className="text-[10px] text-gray-400 italic">
              Only reporters can change date
            </span>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">Modify Task</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-all"
              >
                <RxCross2 size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateDate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Assignee</label>
                <SearchableSelect
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  options={employeesList.map(emp => ({ value: emp._id, label: emp.name }))}
                  placeholder="Select Assignee"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={updateTask.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {updateTask.isPending ? "Updating..." : "Update Date"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentConflictCard;
