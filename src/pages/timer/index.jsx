import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Progress from "../../components/shared/progress";
import {
  setTotalTime,
  startTimer,
  stopTimer,
  resetTimer,
  updateTimer,
  syncTimer,
} from "../../store/slice/timerSlice";

const Timer = () => {
  const dispatch = useDispatch();
  const { totalTime, remainingTime, isRunning } = useSelector(
    (state) => state.timer
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("05:00");
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/src/assets/audio/timer.mp3");
    audioRef.current.preload = "auto";
  }, []);

  // Sync timer state on component mount (handles navigation/refresh)
  useEffect(() => {
    dispatch(syncTimer());
  }, [dispatch]);

  // Main timer logic
  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
    } else {
      clearInterval(intervalRef.current);

      // Play sound when timer completes
      if (remainingTime === 0 && !isRunning) {
        playTimerSound();
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, remainingTime, dispatch]);

  const playTimerSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {});
    }
  };

  const handleStartStop = () => {
    if (isRunning) {
      dispatch(stopTimer());
    } else if (remainingTime > 0) {
      dispatch(startTimer());
    }
  };

  const handleReset = () => {
    dispatch(resetTimer());
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const parseTimeInput = (timeString) => {
    const [mins, secs] = timeString.split(":").map((num) => parseInt(num) || 0);
    return Math.max(0, Math.min(5999, mins * 60 + secs)); // Max 99:59
  };

  const handleTimeEdit = () => {
    if (isRunning) return;

    if (isEditing) {
      const newTime = parseTimeInput(editValue);
      if (newTime > 0) {
        dispatch(setTotalTime(newTime));
      }
      setIsEditing(false);
    } else {
      setEditValue(formatTime(totalTime));
      setIsEditing(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTimeEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(formatTime(totalTime));
    }
  };

  const progressValue = totalTime - remainingTime;
  const progressPercentage =
    totalTime > 0 ? (progressValue / totalTime) * 100 : 0;

  return (
    <div className="  flex items-center justify-center p-4">
      <div
        className=" rounded-2xl  p-8 max-w-md
       w-full backdrop-blur-sm"
      >
        {/* Main Progress Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Progress
              currentValue={progressValue}
              target={totalTime}
              size={280}
              strokeWidth={12}
              DefaultPathColor={
                remainingTime === 0
                  ? "#10B981"
                  : isRunning
                  ? "#3F8CFF"
                  : "#6B7280"
              }
            />

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {/* Time Display/Input */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleTimeEdit}
                    onKeyDown={handleKeyPress}
                    className="text-4xl font-mono font-bold bg-transparent text-gray-800 text-center border-b-2 border-blue-400 outline-none w-32"
                    placeholder="MM:SS"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={handleTimeEdit}
                    className={`text-5xl font-mono font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors ${
                      !isRunning ? "hover:scale-105" : ""
                    } transform transition-transform`}
                  >
                    {formatTime(remainingTime)}
                  </div>
                )}

                {/* Status */}
                <div className="mt-2 text-lg text-gray-600 font-medium">
                  {remainingTime === 0
                    ? "Complete!"
                    : isRunning
                    ? "Running..."
                    : "Click time to edit"}
                </div>

                {/* Progress Percentage */}
                <div className="mt-1 text-sm text-gray-500">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleStartStop}
            disabled={remainingTime === 0 && !isRunning}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg ${
              isRunning
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/25"
                : remainingTime === 0
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/25"
            }`}
          >
            {isRunning ? "Stop" : remainingTime === 0 ? "Finished" : "Start"}
          </button>

          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-gray-500/25"
          >
            Reset
          </button>
        </div>

        {/* Quick Timer Presets */}
        {!isRunning && (
          <div className="flex justify-center space-x-3 mb-6">
            {[1, 5, 10, 15, 25].map((minutes) => (
              <button
                key={minutes}
                onClick={() => {
                  const newTime = minutes * 60;
                  dispatch(setTotalTime(newTime));
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg text-sm font-medium transition-all border border-blue-200 hover:border-blue-300"
              >
                {minutes}m
              </button>
            ))}
          </div>
        )}

        {/* Timer Info */}
        <div className="text-center text-gray-500 text-sm border-t border-gray-100 pt-4">
          <p>
            Total: {formatTime(totalTime)} • Elapsed:{" "}
            {formatTime(progressValue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Timer;
