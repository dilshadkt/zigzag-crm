import React from "react";
import GetStarted from "../../../components/forgetPassword/getStarted";
import StepRenderer from "../../../components/forgetPassword/steps";
import Navigation from "../../../components/forgetPassword/navigation";
import { useForgetPassword } from "../../../hooks/useForgetPassword";

const ForgetPassword = () => {
  const {
    currentStep,
    email,
    isSuccess,
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleNextStep,
    handlePreviousStep,
  } = useForgetPassword();

  const steps = [
    { id: 1, text: "Enter your email" },
    { id: 2, text: "Verify OTP code" },
    { id: 3, text: "Set new password" },
  ];

  return (
    <section className="flex gap-x-6 h-full">
      <GetStarted currentStep={currentStep} steps={steps} />
      <div className="flex-1 bg-white flex overflow-hidden pt-5 h-full flex-col rounded-3xl">
        <div className="h-full items-center flex flex-col overflow-y-auto">
          <div className="flex flex-col my-10 max-w-md w-full h-full">
            {!isSuccess ? (
              <>
                <span className="text-sm text-[#3F8CFF] font-bold text-center">
                  STEP {currentStep}/3
                </span>
                <h4 className="text-xl font-bold text-center">
                  {steps[currentStep - 1].text}
                </h4>
                <StepRenderer
                  currentStep={currentStep}
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                  email={email}
                />
                {errors.general && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}
              </>
            ) : (
              <Navigation
                currentStep={currentStep}
                handlePreviousStep={handlePreviousStep}
                handleNextStep={handleNextStep}
                isSubmitting={isSubmitting}
                isSuccess={isSuccess}
              />
            )}
          </div>
        </div>
        {!isSuccess && (
          <Navigation
            currentStep={currentStep}
            handlePreviousStep={handlePreviousStep}
            handleNextStep={handleNextStep}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
          />
        )}
      </div>
    </section>
  );
};

export default ForgetPassword;
