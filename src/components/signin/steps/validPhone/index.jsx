import React from "react";
import Input from "../../../shared/Field/input";
import OtpValidator from "../../otpValidator";

const ValidPhone = ({ errors, values, handleChange, touched }) => {
  return (
    <form action="" className="flex flex-col gap-y-4 mt-6">
      <div className="flex flex-col gap-y-2">
        <label htmlFor="" className="text-sm font-bold text-[#7D8592]">
          Mobile Number
        </label>
        <div className="flexStart gap-x-3">
          <div className="rounded-xl py-2 px-4 border border-[#D8E0F0]">
            {" "}
            +1
          </div>
          <div className="w-full relative ">
            <input
              type="number"
              name="phone"
              value={values.phone}
              maxLength={10}
              onChange={handleChange}
              className={` ${
                errors?.phone && touched?.phone && `border-red-400/50 `
              } rounded-xl w-full border-[#D8E0F0]  py-2 px-5 border`}
            />
            {errors?.phone && touched?.phone && (
              <span
                className="text-[10px] text-red-500 bg-white absolute whitespace-nowrap
            left-10 px-3 -bottom-[6px] w-fit mx-auto"
              >
                {errors?.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      <OtpValidator />
      <div className="bg-[#F4F9FD] gap-x-3 rounded-xl p-6 flex">
        <img src="/icons/alertBlue.svg" alt="" />
        <span className="text-sm font-medium text-[#3F8CFF]">
          SMS was sent to your number +1 345 673-56-67 It will be valid for
          01:25
        </span>
      </div>
      <Input
        value={values}
        name={"email"}
        type="email"
        touched={touched}
        errors={errors}
        onchange={handleChange}
        title="Email Address"
        placeholder="youremail@gmail.com"
      />
      <Input
        name={"password"}
        value={values}
        errors={errors}
        onchange={handleChange}
        title="Create Password"
        placeholder="password"
        type="password"
      />
    </form>
  );
};

export default ValidPhone;
