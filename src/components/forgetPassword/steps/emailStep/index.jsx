import React from "react";
import Input from "../../../shared/Field/input";

const EmailStep = ({ values, handleChange, errors, touched }) => {
  const handleInputChange = (e) => {
    handleChange("email", e.target.value);
  };

  return (
    <div className="flex flex-col gap-y-4 mt-6">
      <Input
        name="email"
        value={values}
        touched={touched}
        onchange={handleInputChange}
        errors={errors}
        title="Email Address"
        placeholder="youremail@gmail.com"
        type="email"
      />
      <div className="bg-[#F4F9FD] gap-x-3 rounded-xl p-6 flex">
        <img src="/icons/alertBlue.svg" alt="" />
        <span className="text-sm font-medium text-[#3F8CFF]">
          We'll send a 6-digit OTP to your email address to verify your
          identity.
        </span>
      </div>
    </div>
  );
};

export default EmailStep;
