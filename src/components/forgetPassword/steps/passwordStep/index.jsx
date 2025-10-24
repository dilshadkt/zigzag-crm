import React from "react";
import Input from "../../../shared/Field/input";

const PasswordStep = ({ values, handleChange, errors, touched }) => {
  const handleInputChange = (name) => (e) => {
    handleChange(name, e.target.value);
  };

  return (
    <div className="flex flex-col gap-y-4 mt-6">
      <Input
        name="newPassword"
        value={values}
        touched={touched}
        onchange={handleInputChange("newPassword")}
        errors={errors}
        title="New Password"
        placeholder="Enter new password"
        type="password"
      />
      <Input
        name="confirmPassword"
        value={values}
        touched={touched}
        onchange={handleInputChange("confirmPassword")}
        errors={errors}
        title="Confirm New Password"
        placeholder="Confirm new password"
        type="password"
      />
      <div className="bg-[#F4F9FD] gap-x-3 rounded-xl p-6 flex">
        <img src="/icons/alertBlue.svg" alt="" />
        <span className="text-sm font-medium text-[#3F8CFF]">
          Your new password must be at least 6 characters long.
        </span>
      </div>
    </div>
  );
};

export default PasswordStep;
