import Progress from "../progress";

const EmployeeCard = ({ employee, index, className }) => {
  return (
    <div
      key={employee._id || index}
      className={`flex flex-col items-center rounded-3xl bg-[#F4F9FD] p-4 py-4 ${className}`}
    >
      <div className="relative">
        <Progress
          size={69}
          strokeWidth={2}
          currentValue={employee?.progress_value || 50}
        />
        <div
          className="absolute
     top-0 left-0 right-0 bottom-0 w-full h-full 
      rounded-full rounded-full w-6 h-6  scale-85 flexCenter overflow-hidden"
        >
          <img
            src={employee?.profile || `/image/dummy/avatar1.svg`}
            alt=""
            className="w-full h-full object-cover "
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-y-1 mt-2">
        <h4 className="font-medium">{employee.name}</h4>
        <span className="text-sm text-gray-500">{employee.position}</span>
        <div className="text-[#7D8592] border-2 text-xs border-[#7D8592]/60 rounded-lg px-2 mt-2">
          {employee.level || "Middle"}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
