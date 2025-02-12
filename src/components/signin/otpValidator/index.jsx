import React, { useState } from "react";

const OtpValidator = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const handleChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };
  return (
    <div className="flex flex-col gap-y-2">
      <label htmlFor="" className="text-sm font-bold text-[#7D8592]">
        Code from SMS
      </label>
      <div className="flexStart gap-x-3">
        {otp.map((value, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            maxLength={1}
            value={value}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onChange={(e) => handleChange(index, e.target.value)}
            className="w-[58px] h-[50px] border rounded-[14px] border-[#D8E0F0] text-center"
          />
        ))}
      </div>
    </div>
  );
};

export default OtpValidator;
