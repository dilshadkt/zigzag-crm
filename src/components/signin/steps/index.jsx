import InviteTeam from "./inviteTeam";
import ValidPhone from "./validPhone";
import YourCompany from "./yourCompany";
import YourSelf from "./yourSelf";

const StepRenderer = ({
  currentStep,
  values,
  handleChange,
  errors,
  touched,
}) => {
  const stepComponents = {
    1: (
      <ValidPhone
        values={values}
        handleChange={handleChange}
        errors={errors}
        touched={touched}
      />
    ),
    2: (
      <YourSelf
        values={values}
        handleChange={handleChange}
        errors={errors}
        touched={touched}
      />
    ),
    3: (
      <YourCompany
        values={values}
        handleChange={handleChange}
        errors={errors}
        touched={touched}
      />
    ),
    4: (
      <InviteTeam
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
