import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  register,
  sendRegistrationEmailOTP,
  verifyRegistrationEmailOTP,
} from "../api/service";

export const useRegisterForm = (currentStep, setCurrentStep) => {
  const navigate = useNavigate();
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [emailOTPVerified, setEmailOTPVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const previousEmailRef = useRef("");
  const initialValue = {
    email: "",
    password: "",
    service: "Work",
    describe: "Business Owner",
    companyName: "",
    businessDirection: "IT and programming",
    teamSize: "6-10",
    membersEmail: "",
  };

  const validationSchema = [
    Yup.object().shape({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    Yup.object().shape({
      service: Yup.string().required("Field is required"),
      describe: Yup.string().required("Field is required"),
    }),
    Yup.object().shape({
      companyName: Yup.string().required("Company Name is required"),
      businessDirection: Yup.string().required("Field is required"),
      teamSize: Yup.string().required("Team size is required"),
    }),
    Yup.object().shape({
      membersEmail: Yup.string().email("Invalid email format"),
    }),
  ];

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: validationSchema[currentStep - 1],
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      // For step 1, require email OTP verification
      if (currentStep === 1) {
        if (!emailOTPVerified) {
          formik.setFieldError("email", "Please verify your email first");
          return;
        }
        // Also check password is filled
        if (!values.password || values.password.length < 6) {
          formik.setFieldError("password", "Password must be at least 6 characters");
          return;
        }
        setCurrentStep(currentStep + 1);
        return;
      }

      // For final step (step 4), register the company
      if (currentStep >= 4) {
        // Ensure email OTP is still verified before registration
        if (!emailOTPVerified) {
          formik.setFieldError("email", "Please verify your email first");
          return;
        }
        const { success } = await register(values);
        if (success) {
          navigate("/auth/sign-up-success");
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    },
  });

  // Reset OTP state when email changes
  useEffect(() => {
    const currentEmail = formik.values.email;
    if (previousEmailRef.current && previousEmailRef.current !== currentEmail) {
      // Email changed, reset OTP state
      setEmailOTPSent(false);
      setEmailOTPVerified(false);
      setOtp("");
      setOtpError("");
    }
    previousEmailRef.current = currentEmail;
  }, [formik.values.email]);

  // Function to check if current step is valid
  const isCurrentStepValid = () => {
    const currentSchema = validationSchema[currentStep - 1];
    if (!currentSchema) return true;

    try {
      currentSchema.validateSync(formik.values, { abortEarly: false });
      return true;
    } catch (validationErrors) {
      return false;
    }
  };

  // Function to send email OTP
  const handleSendEmailOTP = async () => {
    if (!formik.values.email) {
      formik.setFieldError("email", "Email is required");
      return;
    }

    // Clear previous errors
    formik.setFieldError("email", "");
    setOtpError("");

    setIsSendingOTP(true);
    const result = await sendRegistrationEmailOTP({ email: formik.values.email });
    setIsSendingOTP(false);

    if (result.success) {
      setEmailOTPSent(true);
      formik.setFieldError("email", ""); // Clear any previous errors
    } else {
      const errorMessage = result.message || "Failed to send OTP";
      formik.setFieldError("email", errorMessage);
      // Also set OTP error for more visibility
      if (errorMessage.includes("already exists")) {
        setOtpError(errorMessage);
      }
    }
  };

  // Function to verify email OTP
  const handleVerifyEmailOTP = async (otpToVerify = null) => {
    // Use provided OTP or fall back to state
    const otpString = (otpToVerify || otp).trim();
    
    // Only validate length if OTP is provided and incomplete
    // If called from auto-verify, we trust it has 6 digits
    if (otpToVerify === null && (!otpString || otpString.length !== 6)) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    // If OTP is provided directly (from auto-verify), validate it
    if (otpToVerify && otpToVerify.length !== 6) {
      return; // Don't show error, just return silently
    }

    setIsVerifyingOTP(true);
    setOtpError("");
    const result = await verifyRegistrationEmailOTP({
      email: formik.values.email,
      otp: otpString,
    });
    setIsVerifyingOTP(false);

    if (result.success) {
      setEmailOTPVerified(true);
      setOtpError("");
      // Clear OTP after successful verification
      setOtp("");
    } else {
      setOtpError(result.message || "Invalid OTP. Please try again.");
      // Clear OTP inputs on failure so user can re-enter
      setOtp("");
    }
  };

  // Function to get required fields for current step
  const getRequiredFieldsForStep = () => {
    const stepFields = {
      1: ["email", "password"],
      2: ["service", "describe"],
      3: ["companyName", "businessDirection", "teamSize"],
      4: [], // Step 4 is optional
    };
    return stepFields[currentStep] || [];
  };

  // Function to check if all required fields for current step are filled
  const areRequiredFieldsFilled = () => {
    const requiredFields = getRequiredFieldsForStep();
    return requiredFields.every((field) => {
      const value = formik.values[field];
      return value && value.toString().trim() !== "";
    });
  };

  return {
    ...formik,
    isCurrentStepValid,
    areRequiredFieldsFilled,
    getRequiredFieldsForStep,
    // Email OTP related
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
  };
};
