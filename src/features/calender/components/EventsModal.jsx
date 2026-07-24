import React from "react";
import { IoClose } from "react-icons/io5";
import { FaGift } from "react-icons/fa";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import CalendarEventItem from "./CalendarEventItem";

const EventsModal = ({
  isOpen,
  selectedDayData,
  onClose,
  calendarData,
  isEmployee,
}) => {
  if (!isOpen || !selectedDayData) return null;

  const { projects, tasks, subtasks, birthdays, formattedDate } = selectedDayData;
  const totalEvents =
    projects.length + tasks.length + subtasks.length + birthdays.length;

  const allTasks = tasks || [];
  const stats = {
    pending: allTasks.filter(t => t.status === "todo").length,
    progressing: allTasks.filter(t => t.status === "in-progress").length,
    publishPending: allTasks.filter(t => t.isPublishPending).length,
  };

  return (
    <div className="fixed inset-0 bg-black/45 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Events for {formattedDate}
            </h2>
            <div className="flex gap-3 mt-2">
              <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md border border-purple-200 shadow-sm flex items-center gap-1.5">
                <span className="text-sm">🚀</span>
                <span className="text-[10px] uppercase font-bold">Ready to Publish: {stats.publishPending}</span>
              </div>
              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200 shadow-sm flex items-center gap-1.5">
                <span className="text-sm">🔄</span>
                <span className="text-[10px] uppercase font-bold">In Progress: {stats.progressing}</span>
              </div>
              <div className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-200 shadow-sm flex items-center gap-1.5">
                <span className="text-sm">⏳</span>
                <span className="text-[10px] uppercase font-bold">Pending: {stats.pending}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose className="text-xl text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto max-h-[75vh]">
          {/* Birthdays Section */}
          {birthdays.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaGift className="text-purple-500" />
                Birthdays ({birthdays.length})
              </h4>
              <div className="flex flex-col gap-y-1">
                {birthdays.map((birthday, idx) => (
                  <CalendarEventItem
                    key={`modal-birthday-${idx}`}
                    type="birthday"
                    data={birthday}
                    isEmployee={isEmployee}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Project Deadlines ({projects.length})
              </h4>
              <div className="flex flex-col gap-y-1">
                {projects.map((project, idx) => (
                  <CalendarEventItem
                    key={`modal-project-${idx}`}
                    type="project"
                    data={project}
                    isEmployee={isEmployee}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Parent Tasks Section */}
          {tasks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Task Due Dates ({tasks.length})
              </h4>
              <div className="flex flex-col gap-y-1">
                {tasks.map((task, idx) => (
                  <CalendarEventItem
                    showExtraDetails={true}
                    key={`modal-task-${idx}`}
                    type="task"
                    data={task}
                    isEmployee={isEmployee}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Subtasks Section */}
          {subtasks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MdSubdirectoryArrowRight className="text-green-600" />
                Subtask Due Dates ({subtasks.length})
              </h4>
              <div className="flex flex-col gap-y-1">
                {subtasks.map((subtask, idx) => (
                  <CalendarEventItem
                    showExtraDetails={true}
                    key={`modal-subtask-${idx}`}
                    type="subtask"
                    data={subtask}
                    isEmployee={isEmployee}
                  />
                ))}
              </div>
            </div>
          )}

          {totalEvents === 0 && (
            <div className="text-center py-8 text-gray-500">
              No events scheduled for this day
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsModal;
