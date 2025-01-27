import React from "react";

const CircularProgressProfile = ({ currentValue = 0, target = 100 }) => {
  const percentage = Math.min((currentValue / target) * 100, 100);
  const size = 70;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const pathColor = "#3F8CFF";

  return (
    <div
      className=" cursor-pointer  rounded-xl
     backdrop-blur-md relative flexCenter flex-col "
    >
      <div className=" transition-all duration-300">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-slow">
              <svg width={size} height={size} className="transform -rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#7D8592"
                  strokeOpacity={0.2}
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={pathColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />
              </svg>
            </div>
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#7D8592"
                strokeOpacity={0.2}
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={pathColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute w-full scale-80 h-full rounded-full ">
        <img src="/icons/profile.svg" alt="" className="w-full h-full" />
      </div>
    </div>
  );
};

export default CircularProgressProfile;
