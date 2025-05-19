import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Navigator from "../../components/shared/navigator";
import { useEmpoyees } from "../../api/hooks";
import Progress from "../../components/shared/progress";

const WorkLoad = () => {
  const { data } = useEmpoyees(1);
  const navigate = useNavigate();
  const employees = data?.employees || [];

  return (
    <section className="flex flex-col">
      <Navigator path={"/"} title={"Back to Dashboard"} />
      <div className="flexBetween mb-6">
        <Header>Current Workload</Header>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {employees.map((employee, index) => (
          <div
            onClick={() => {
              navigate(`/employees/${employee._id}`);
            }}
            key={employee._id || index}
            className="flex flex-col items-center cursor-pointer rounded-3xl bg-white p-4 py-4"
          >
            <div className="relative">
              <Progress
                size={69}
                strokeWidth={2}
                currentValue={employee?.progress_value || 50}
              />
              <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full rounded-full w-6 h-6 scale-85 flexCenter overflow-hidden">
                <img
                  src={employee?.profile || `/image/dummy/avatar1.svg`}
                  alt=""
                  className="w-full h-full object-cover"
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
        ))}
      </div>
    </section>
  );
};

export default WorkLoad;
