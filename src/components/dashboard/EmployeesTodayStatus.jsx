import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeesTodayStatus, useTodayTasks } from "../../api/hooks/dashboard";
import { FaUserCircle, FaCheckCircle, FaClock, FaExclamationCircle, FaListUl } from "react-icons/fa";
import Modal from "../shared/modal";
const EmployeesTodayStatus = () => {
  const { data, isLoading } = useEmployeesTodayStatus();
  const [selectedEmp, setSelectedEmp] = useState(null);
  const employees = data?.data || [];

  const workingEmployees = employees.filter(emp => emp.pendingCount > 0);
  const finishedEmployees = employees.filter(emp => emp.pendingCount === 0 && emp.completedCount > 0);
  const inactiveEmployees = employees.filter(emp => emp.pendingCount === 0 && emp.completedCount === 0);

  return (
    <>
    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 border border-gray-100 flex flex-col min-h-0 md:min-h-[420px] md:h-[550px]">
      <div className="mb-3">
        <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
          Team Daily Status
        </h3>
        {/* <p className="text-xs text-gray-500 line-clamp-1">Finished vs still working</p> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 md:overflow-hidden min-h-0">
        {/* Working / Pending Column */}
        <div className="flex flex-col bg-slate-50 rounded-2xl p-3 md:p-4 border border-slate-100 overflow-hidden min-h-[220px] md:min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Working ({workingEmployees.length})
            </h4>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 max-h-[280px] md:max-h-none pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {isLoading ? (
              <LoadingPulse count={2} />
            ) : workingEmployees.length === 0 ? (
              <EmptyState message="All done!" icon={<FaCheckCircle className="text-emerald-400 text-lg" />} />
            ) : (
              workingEmployees.map(emp => (
                <EmployeeCard key={emp._id} emp={emp} status="working" onViewTasks={() => setSelectedEmp(emp)} />
              ))
            )}
          </div>
        </div>

        {/* Finished / Completed Column */}
        <div className="flex flex-col bg-emerald-50 rounded-2xl p-3 md:p-4 border border-emerald-100 overflow-hidden min-h-[220px] md:min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-emerald-700 flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500" />
              Done ({finishedEmployees.length})
            </h4>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 max-h-[280px] md:max-h-none pr-1 scrollbar-thin scrollbar-thumb-emerald-200">
            {isLoading ? (
              <LoadingPulse count={2} />
            ) : finishedEmployees.length === 0 ? (
              <EmptyState message="None yet" icon={<FaClock className="text-slate-300 text-lg" />} />
            ) : (
              finishedEmployees.map(emp => (
                <EmployeeCard key={emp._id} emp={emp} status="finished" onViewTasks={() => setSelectedEmp(emp)} />
              ))
            )}
          </div>
        </div>
      </div>

      {inactiveEmployees.length > 0 && (
        <div className="mt-4 px-4 flex items-center gap-2 text-[11px] text-gray-400">
          <FaExclamationCircle />
          <span>{inactiveEmployees.length} employees have no tasks assigned for today</span>
        </div>
      )}
    </div>
    
    {selectedEmp && (
      <EmployeeTasksModal 
        isOpen={!!selectedEmp} 
        onClose={() => setSelectedEmp(null)} 
        emp={selectedEmp} 
      />
    )}
    </>
  );
};

const EmployeeCard = ({ emp, status, onViewTasks }) => (
  <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-transparent hover:border-blue-200 transition-all hover:shadow-md group min-w-0">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <Avatar user={emp} size="w-10 h-10 md:w-11 md:h-11" />
        <div className="min-w-0">
          <h5 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors truncate">
            {emp.firstName} {emp.lastName}
          </h5>
          <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <FaCheckCircle className="text-[10px]" /> {emp.completedCount} Done
            </span>
            <span className={`flex items-center gap-1 text-[11px] font-bold ${emp.pendingCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              <FaClock className="text-[10px]" /> {emp.pendingCount} Left
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {status === 'finished' ? (
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded-lg uppercase tracking-wider">
            Done
          </span>
        ) : (
          <div className="w-12 md:w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(100, (emp.completedCount / ((emp.completedCount + emp.pendingCount) || 1)) * 100)}%` }}
            ></div>
          </div>
        )}
        <button 
          onClick={onViewTasks}
          className="mt-1 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors tooltip tooltip-left"
          data-tip="View Tasks"
        >
          <FaListUl className="text-xs" />
        </button>
      </div>
    </div>
  </div>
);

const LoadingPulse = ({ count }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-20 bg-white rounded-2xl animate-pulse"></div>
    ))}
  </div>
);

const TaskListSkeleton = ({ count = 3 }) => (
  <div className="flex flex-col gap-6 pt-2">
    <div>
      <div className="h-4 w-32 bg-slate-200 rounded-md animate-pulse mb-3"></div>
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl border border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex-1 space-y-2.5 w-full">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-12 bg-slate-200 rounded-sm animate-pulse"></div>
                <div className="h-3.5 w-24 bg-slate-200 rounded-sm animate-pulse"></div>
              </div>
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="shrink-0 flex items-center mt-2 sm:mt-0">
              <div className="h-6 w-20 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EmptyState = ({ message, icon }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="text-3xl mb-2 opacity-30">{icon}</div>
    <p className="text-xs text-gray-400 font-medium px-4">{message}</p>
  </div>
);

const Avatar = ({ user, size = "w-10 h-10" }) => {
  const userName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "U";
  const firstLetter = userName.charAt(0).toUpperCase();

  return user?.profileImage ? (
    <img src={user.profileImage} alt={userName} className={`${size} rounded-full object-cover border-2 border-white shadow-sm`} />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-sm`}>
      {firstLetter}
    </div>
  );
};

const EmployeeTasksModal = ({ isOpen, onClose, emp }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useTodayTasks(emp._id);
  const tasks = data?.tasks || [];
  const subTasks = data?.subTasks || [];
  const reworkTasks = data?.reworkTasks || [];
  const reworkSubTasks = data?.reworkSubTasks || [];
  const completedTasks = data?.completedTasks || [];
  const completedSubTasks = data?.completedSubTasks || [];

  const pendingList = [...tasks, ...subTasks, ...reworkTasks, ...reworkSubTasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const completedList = [...completedTasks, ...completedSubTasks].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  const handleTaskClick = (task) => {
    onClose();
    if (task.parentTask && task.parentTask._id) {
      if (task.project) {
        navigate(`/projects/${task.project._id || task.project}/${task.parentTask._id || task.parentTask}`);
      } else {
        navigate(`/tasks/${task.parentTask._id || task.parentTask}`);
      }
    } else {
      if (task.project) {
        navigate(`/projects/${task.project._id || task.project}/${task._id}`);
      } else {
        navigate(`/tasks/${task._id}`);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${emp.firstName}'s Today's Tasks`} maxWidth="sm:max-w-3xl">
      {isLoading ? (
        <TaskListSkeleton count={3} />
      ) : (
        <div className="flex flex-col gap-6 pt-2">
          {/* Pending Tasks */}
          <div>
            <h4 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
              <FaClock /> Pending Tasks ({pendingList.length})
            </h4>
            {pendingList.length === 0 ? (
              <p className="text-xs text-gray-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">No pending tasks.</p>
            ) : (
              <div className="space-y-2">
                {pendingList.map(task => (
                  <TaskListItem key={task._id} task={task} onClick={() => handleTaskClick(task)} />
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          <div>
            <h4 className="text-sm font-bold text-emerald-600 mb-3 flex items-center gap-2">
              <FaCheckCircle /> Completed Tasks ({completedList.length})
            </h4>
            {completedList.length === 0 ? (
              <p className="text-xs text-gray-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">No completed tasks.</p>
            ) : (
              <div className="space-y-2">
                {completedList.map(task => (
                  <TaskListItem key={task._id} task={task} isCompleted={true} onClick={() => handleTaskClick(task)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

const TaskListItem = ({ task, isCompleted, onClick }) => {
  const isSubtask = !!task.parentTask;
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-xl border ${isCompleted ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm cursor-pointer hover:border-blue-300 transition-colors`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${isSubtask ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
            {isSubtask ? 'Subtask' : 'Task'}
          </span>
          {task.project && (
            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[150px]">
              Project: {task.project.name}
            </span>
          )}
        </div>
        <h5 className={`text-sm font-semibold truncate ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
          {task.title}
        </h5>
        {isSubtask && task.parentTask && (
          <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
            <span className="font-medium text-gray-400">Parent:</span> {task.parentTask.title}
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-center">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${
          isCompleted 
            ? 'bg-emerald-100 text-emerald-700' 
            : task.status === 'in-progress' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-amber-100 text-amber-700'
        }`}>
          {task.status.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
};

export default EmployeesTodayStatus;
