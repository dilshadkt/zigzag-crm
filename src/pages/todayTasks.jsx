import React from "react";
import { useGetEmployeeTasks } from "../api/hooks";
import { useAuth } from "../hooks/useAuth";
import TaskList from "../components/shared/TaskList";

const TodayTasks = () => {
  const { user } = useAuth();
  const { data: employeeTasksData, isLoading } = useGetEmployeeTasks(
    user?._id ? user._id : null
  );

  const tasks = employeeTasksData?.tasks || [];

  // Filter tasks for today
  const todayTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  });
  console.log(todayTasks);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Today's Tasks</h1>
        <p className="text-gray-600 mt-1">
          {todayTasks.length} task{todayTasks.length !== 1 ? "s" : ""} due today
        </p>
      </div>

      {todayTasks.length > 0 ? (
        <TaskList tasks={todayTasks} />
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">📅</div>
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No tasks due today
          </h3>
          <p className="text-gray-500 text-sm">
            You're all caught up! Check back tomorrow for new tasks.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodayTasks;
