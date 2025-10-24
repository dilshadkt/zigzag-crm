import React from "react";
import OtpValidator from "../../otpValidator";

const OtpStep = ({ values, handleChange, errors, touched, email }) => {
  return (
    <div className="flex flex-col gap-y-4 mt-6">
      <OtpValidator
        value={values.otp}
        onChange={handleChange}
        errors={errors}
        touched={touched}
      />
      <div className="bg-[#F4F9FD] gap-x-3 rounded-xl p-6 flex">
        <img src="/icons/alertBlue.svg" alt="" />
        <span className="text-sm font-medium text-[#3F8CFF]">
          OTP sent to <strong>{email}</strong>. It will be valid for 10 minutes.
        </span>
      </div>
    </div>
  );
};

export default OtpStep;
