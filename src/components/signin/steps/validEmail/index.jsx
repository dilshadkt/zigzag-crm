import React, { useState, useEffect } from "react";
import Input from "../../../shared/Field/input";

const ValidEmail = ({
  errors,
  values,
  handleChange,
  touched,
  emailOTPSent,
  emailOTPVerified,
  isSendingOTP,
  isVerifyingOTP,
  otp,
  setOtp,
  otpError,
  setOtpError,
  handleSendEmailOTP,
  handleVerifyEmailOTP,
}) => {
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);

  // Reset OTP inputs when OTP is cleared from parent
  useEffect(() => {
    if (!otp && emailOTPSent && !emailOTPVerified) {
      setOtpInputs(["", "", "", "", "", ""]);
      // Focus first input
      document.getElementById("otp-input-0")?.focus();
    }
  }, [otp, emailOTPSent, emailOTPVerified]);

  // Start countdown when OTP is sent
  useEffect(() => {
    if (emailOTPSent && countdown === 0 && !emailOTPVerified) {
      setCountdown(600); // 10 minutes = 600 seconds
    }
  }, [emailOTPSent, emailOTPVerified]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (emailOTPSent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailOTPSent, countdown]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    // Clear error when user starts typing
    if (otpError) {
      setOtpError("");
    }

    const newOtp = [...otpInputs];
    newOtp[index] = value;
    setOtpInputs(newOtp);
    const otpString = newOtp.join("");
    setOtp(otpString);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (otpString.length === 6 && newOtp.every((digit) => digit !== "")) {
      // Pass OTP directly to avoid state timing issues
      setTimeout(() => {
        handleVerifyEmailOTP(otpString);
      }, 200);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleSendOTP = async () => {
    setOtpError("");
    await handleSendEmailOTP();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <form action="" className="flex flex-col gap-y-4 mt-6">
      <Input
        value={values}
        name={"email"}
        type="email"
        touched={touched}
        errors={errors}
        onchange={handleChange}
        title="Email Address"
        placeholder="youremail@gmail.com"
        disabled={emailOTPSent}
      />

      {!emailOTPSent && (
        <>
          {errors?.email && touched?.email && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-red-700 flex-1">
                {errors.email}
              </p>
            </div>
          )}
          {otpError && !emailOTPSent && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-red-700 flex-1">
                {otpError}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={!values.email || isSendingOTP}
            className={`w-full h-11 rounded-full text-white text-sm font-semibold transition-colors ${
              !values.email || isSendingOTP
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#3f8cff] hover:bg-[#2f6bff]"
            }`}
          >
            {isSendingOTP ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}

      {emailOTPSent && !emailOTPVerified && (
        <>
          <div className="flex flex-col gap-y-2">
            <label htmlFor="" className="text-sm font-bold text-[#7D8592]">
              Code from Email
            </label>
            <div className="flexStart gap-x-3">
              {otpInputs.map((value, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={value}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-[58px] h-[50px] border rounded-[14px] border-[#D8E0F0] text-center text-lg font-semibold"
                />
              ))}
            </div>
            {isVerifyingOTP && (
              <p className="text-xs text-[#3F8CFF] mt-2">Verifying OTP...</p>
            )}
            {otpError && !isVerifyingOTP && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2 flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-red-700 flex-1">{otpError}</p>
              </div>
            )}
          </div>

          <div className="bg-[#F4F9FD] gap-x-3 rounded-xl p-6 flex items-center">
            <img src="/icons/alertBlue.svg" alt="" className="flex-shrink-0" />
            <span className="text-sm font-medium text-[#3F8CFF]">
              OTP was sent to your email {values.email}. It will be valid for{" "}
              {countdown > 0 ? formatTime(countdown) : "10:00"}
            </span>
          </div>

          {countdown === 0 && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={isSendingOTP}
              className="w-full h-11 rounded-full bg-[#3f8cff] text-white text-sm font-semibold hover:bg-[#2f6bff] transition-colors"
            >
              {isSendingOTP ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </>
      )}

      {emailOTPVerified && (
        <>
          <div className="bg-green-50 border border-green-200 gap-x-3 rounded-xl p-6 flex items-center">
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium text-green-700">
              Email verified successfully!
            </span>
          </div>
          <Input
            name={"password"}
            value={values}
            errors={errors}
            onchange={handleChange}
            title="Create Password"
            placeholder="password"
            type="password"
          />
        </>
      )}
    </form>
  );
};

export default ValidEmail;

