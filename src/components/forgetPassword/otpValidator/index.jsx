import React, { useState, useEffect } from "react";

const OtpValidator = ({ value, onChange, errors, touched }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (value) {
      const otpArray = value.split("").slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = otpArray[i] || "";
      }
      setOtp(newOtp);
    }
  }, [value]);

  const handleChange = (index, inputValue) => {
    // Only allow single digit
    const digit = inputValue.replace(/\D/g, "").slice(0, 1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Call onChange with the complete OTP string
    const otpString = newOtp.join("");
    onChange("otp", otpString);

    // Auto-focus next input
    if (digit && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
    onChange("otp", pastedData);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <label htmlFor="" className="text-sm font-bold text-[#7D8592]">
        Enter OTP Code
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
            onPaste={handlePaste}
            className={`w-[58px] h-[50px] border rounded-[14px] text-center text-lg font-semibold ${
              errors?.otp && touched?.otp
                ? "border-red-400"
                : "border-[#D8E0F0]"
            } focus:border-[#3F8CFF] focus:outline-none`}
          />
        ))}
      </div>
      {errors?.otp && touched?.otp && (
        <span className="text-[10px] text-red-500">{errors.otp}</span>
      )}
    </div>
  );
};

export default OtpValidator;
