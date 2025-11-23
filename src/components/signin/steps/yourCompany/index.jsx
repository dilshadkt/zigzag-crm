import React, { useState } from "react";
import Select from "../../../shared/Field/select";
import Input from "../../../shared/Field/input";

const YourCompany = ({ errors, values, handleChange, touched }) => {
  const team = [
    "Only me",
    "2-5",
    "6-10",
    "11-20",
    "21-40",
    "41-50",
    "51-100",
    "101-500",
  ];
  
  const handleTeamSizeChange = (item) => {
    handleChange({
      target: {
        name: "teamSize",
        value: item,
      },
    });
  };

  return (
    <form action="" className="flex flex-col gap-y-4 mt-6">
      <div className="flex flex-col gap-y-4">
        <Input
          name={"companyName"}
          value={values}
          onchange={handleChange}
          touched={touched}
          errors={errors}
          title="Your Company's Name"
          placeholder="Company's Name"
        />
        <Select
          name={"businessDirection"}
          errors={errors}
          value={values.businessDirection}
          touched={touched}
          onChange={handleChange}
          title="Business Direction"
          options={["IT and programming", "Digital Marketing"]}
        />
        <div className="flex flex-col">
          <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
            How many people in your team?
          </label>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {team.map((item, index) => (
              <div
                key={index}
                onClick={() => handleTeamSizeChange(item)}
                className={`${
                  values.teamSize === item
                    ? `border-none bg-[#3F8CFF] text-white`
                    : `text-[#7D8592] border border-[#D8E0F0]`
                } h-12 rounded-[10px]
                     cursor-pointer flexCenter text-sm `}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};

export default YourCompany;
