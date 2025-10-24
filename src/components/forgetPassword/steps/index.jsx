import EmailStep from "./emailStep";
import OtpStep from "./otpStep";
import PasswordStep from "./passwordStep";

const StepRenderer = ({
  currentStep,
  values,
  handleChange,
  errors,
  touched,
  email,
}) => {
  const stepComponents = {
    1: (
      <EmailStep
        values={values}
        handleChange={handleChange}
        errors={errors}
        touched={touched}
      />
    ),
    2: (
      <OtpStep
        values={values}
        handleChange={handleChange}
        errors={errors}
        touched={touched}
        email={email}
      />
    ),
    3: (
      <PasswordStep
        values={values}
        handleChange={handleChange}
        errors={errors}
        touched={touched}
      />
    ),
  };

  return stepComponents[currentStep] || null;
};

export default StepRenderer;
