import InviteTeam from "./inviteTeam";
import ValidEmail from "./validEmail";
import YourCompany from "./yourCompany";
import YourSelf from "./yourSelf";

const StepRenderer = ({
  currentStep,
  values,
  handleChange,
  errors,
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
  const stepComponents = {
    1: (
      <ValidEmail
        values={values}
        handleChange={handleChange}
        errors={errors}
        touched={touched}
        emailOTPSent={emailOTPSent}
        emailOTPVerified={emailOTPVerified}
        isSendingOTP={isSendingOTP}
        isVerifyingOTP={isVerifyingOTP}
        otp={otp}
        setOtp={setOtp}
        otpError={otpError}
        setOtpError={setOtpError}
        handleSendEmailOTP={handleSendEmailOTP}
        handleVerifyEmailOTP={handleVerifyEmailOTP}
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
