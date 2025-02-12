import PrimaryButton from "../../../shared/buttons/primaryButton";

const StepNavigation = ({
  currentStep,
  handlePreviousStep,
  handleNextStep,
}) => {
  return (
    <div className="min-h-18 border-t border-[#E4E6E8] w-full flexBetween px-10">
      <PrimaryButton
        title="Previous"
        icon="/icons/arrowLeft.svg"
        iconPosition="left"
        className={`${
          currentStep > 1 ? `visible` : `invisible`
        }  px-5 bg-white text-[#3F8CFF]`}
        onclick={handlePreviousStep}
      />

      <PrimaryButton
        title="Next Step"
        icon="/icons/arrowRight.svg"
        iconPosition="right"
        className="px-5 text-white"
        onclick={handleNextStep}
      />
    </div>
  );
};

export default StepNavigation;
