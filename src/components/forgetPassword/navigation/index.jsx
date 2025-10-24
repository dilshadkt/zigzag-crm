import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { Link } from "react-router-dom";

const Navigation = ({
  currentStep,
  handlePreviousStep,
  handleNextStep,
  isSubmitting,
  isSuccess,
}) => {
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-y-3 p-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
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
        </div>
        <h4 className="text-xl font-bold text-center text-green-600">
          Password Reset Successful!
        </h4>
        <p className="text-[#7D8592] text-sm text-center">
          Your password has been successfully reset. You will be redirected to
          the login page shortly.
        </p>
        <Link
          to="/auth/signin"
          className="text-sm text-[#3F8CFF] font-semibold hover:underline"
        >
          Go to Login Page Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center p-6 border-t border-[#D8E0F0]">
      <div className="flex gap-x-3">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePreviousStep}
            className="px-6 py-2 border border-[#D8E0F0] rounded-xl text-[#7D8592] hover:bg-gray-50"
          >
            Back
          </button>
        )}
        <Link
          to="/auth/signin"
          className="px-6 py-2 border border-[#D8E0F0] rounded-xl text-[#7D8592] hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
      <PrimaryButton
        loading={isSubmitting}
        onclick={handleNextStep}
        title={currentStep === 3 ? "Reset Password" : "Continue"}
        className="px-8 text-white"
      />
    </div>
  );
};

export default Navigation;
