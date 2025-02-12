import React, { useState } from "react";
import GetStarted from "../../../components/signin/getStart";
import StepRenderer from "../../../components/signin/steps";
import StepNavigation from "../../../components/signin/steps/navigation";
import { useRegisterForm } from "../../../hooks/useRegisterForm";
const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const { values, errors, touched, handleChange, handleSubmit } =
    useRegisterForm(currentStep, setCurrentStep);

  const handleNextStep = () => {
    handleSubmit();
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { id: 1, text: "Valid your phone" },
    { id: 2, text: "Tell about yourself" },
    { id: 3, text: "Tell about your company" },
    { id: 4, text: "Invite Team Members" },
  ];

  return (
    <section className="flex gap-x-6 h-full">
      <GetStarted
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        steps={steps}
      />
      <div className="flex-1 bg-white flex overflow-hidden pt-5  h-full flex-col rounded-3xl">
        <div className="h-full  items-center     flex flex-col  overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col my-10 max-w-md w-full   h-full"
          >
            <span className="text-sm text-[#3F8CFF] font-bold text-center">
              STEP {currentStep}/4
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
            />
          </form>
        </div>
        <StepNavigation
          currentStep={currentStep}
          handlePreviousStep={handlePreviousStep}
          handleNextStep={handleNextStep}
        />
      </div>
    </section>
  );
};

export default Register;
