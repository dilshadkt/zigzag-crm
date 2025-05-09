import React, { useState } from "react";
import { IoArrowUpOutline } from "react-icons/io5";
import Progress from "../../shared/progress";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useGetTaskTimeLogs, useCreateTimeLog } from "../../../api/hooks";
import Modal from "../../shared/modal";

const TaskInfo = ({ taskDetails }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const { data: timeLogData, isLoading, error } = useGetTaskTimeLogs(taskDetails?._id);
  const createTimeLog = useCreateTimeLog();

  const handleLogTime = () => {
    if (!duration || !description) return;

    createTimeLog.mutate({
      taskId: taskDetails._id,
      duration: parseInt(duration),
      description
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setDuration("");
        setDescription("");
      }
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const totalTime = timeLogData?.data?.totalTime || 0;
  const progress = taskDetails?.timeEstimate ? (totalTime / (taskDetails.timeEstimate * 60)) * 100 : 0;

  return (
    <div className="col-span-1 bg-white rounded-3xl px-2 justify-between py-5 flex flex-col">
      <div>
        <div className="gap-y-3 flex flex-col mx-3">
          <h4 className="font-medium">Task Info</h4>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-[#91929E]">Reporter</span>
            <div className="flexStart gap-x-3">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img src="/image/photo.png" alt="" />
              </div>
              <span>Evan Yates</span>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-[#91929E]">Assigned</span>
            <div className="flexStart gap-x-3">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={taskDetails?.assignedTo?.profileImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span>{taskDetails?.assignedTo?.firstName}</span>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-[#91929E]">Priority</span>
            <div className="flexStart gap-x-1 text-[#FFBD21]">
              <IoArrowUpOutline className="text-xl" />
              <span className="text-sm">{taskDetails?.priority}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl mt-5 p-4 bg-[#F4F9FD] flex flex-col">
          <h4 className="font-medium">Time tracking</h4>
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading time data...</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error loading time data</div>
          ) : (
            <>
              <div className="flexStart gap-x-3 my-3">
                <Progress size={33} strokeWidth={2} currentValue={progress} />
                <div className="flex flex-col">
                  <span className="text-sm">{formatTime(totalTime)} logged</span>
                  <span className="text-xs text-[#91929E]">
                    Original Estimate {formatTime(taskDetails?.timeEstimate * 60)}
                  </span>
                </div>
              </div>
              <PrimaryButton
                title="Log time"
                icon="/icons/time.svg"
                className="w-fit text-white"
                onclick={() => setIsModalOpen(true)}
              />
            </>
          )}
        </div>
        <div className="gap-y-3 mt-1 flex flex-col mx-3">
          <div className="flex flex-col gap-y-1">
            <span className="text-sm text-[#91929E]">Dead Line</span>
            <span className="text-sm text-[#0A1629]">Feb 23, 2020</span>
          </div>
        </div>
      </div>
      <div className="flexStart px-3">
        <img src="/icons/calender2.svg" alt="" className="w-4" />
        <span className="text-sm text-[#7D8592]">Created May 28, 2020</span>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Time"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="block w-full rounded-md border-gray-300 pr-12
                p-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min="1"
                placeholder="Enter time in minutes"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">min</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full p-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={3}
              placeholder="What did you work on?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleLogTime}
              disabled={!duration || !description}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Log Time
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskInfo;
