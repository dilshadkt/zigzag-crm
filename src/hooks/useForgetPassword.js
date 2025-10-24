import * as Yup from "yup";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgetPassword, verifyOTP, resetPassword } from "../api/service";

export const useForgetPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [values, setValues] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Step 1: Email validation schema
  const emailValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  });

  // Step 2: OTP validation schema
  const otpValidationSchema = Yup.object().shape({
    otp: Yup.string()
      .required("OTP is required")
      .length(6, "OTP must be 6 digits"),
  });

  // Step 3: Password reset validation schema
  const passwordValidationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  // Step 1: Send OTP to email
  const emailFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: emailValidationSchema,
    onSubmit: async (values, { setErrors }) => {
      const { success, message } = await forgetPassword(values);
      if (success) {
        setEmail(values.email);
        setCurrentStep(2);
        setErrors({ general: null });
      } else {
        setErrors({ general: message || "Failed to send OTP" });
      }
    },
  });

  // Step 2: Verify OTP
  const otpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otpValidationSchema,
    onSubmit: async (values, { setErrors }) => {
      const { success, message, token } = await verifyOTP({
        email,
        otp: values.otp,
      });
      if (success) {
        setResetToken(token);
        setCurrentStep(3);
        setErrors({ general: null });
      } else {
        setErrors({ general: message || "Invalid OTP" });
      }
    },
  });

  // Step 3: Reset Password
  const passwordFormik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { setErrors }) => {
      const { success, message } = await resetPassword({
        token: resetToken,
        newPassword: values.newPassword,
      });
      if (success) {
        // Set success state
        setIsSuccess(true);

        // Reset all form states
        setCurrentStep(1);
        setEmail("");
        setResetToken("");
        emailFormik.resetForm();
        otpFormik.resetForm();
        passwordFormik.resetForm();

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate("/auth/signin");
        }, 3000); // 3 second delay to show the success message
      } else {
        setErrors({ general: message || "Failed to reset password" });
      }
    },
  });

  const goBackToStep1 = () => {
    setCurrentStep(1);
    setEmail("");
    setResetToken("");
    emailFormik.resetForm();
    otpFormik.resetForm();
    passwordFormik.resetForm();
  };

  const handleNextStep = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      if (currentStep === 1) {
        // Validate email
        await emailValidationSchema.validate({ email: values.email });
        const { success, message } = await forgetPassword({
          email: values.email,
        });
        if (success) {
          setEmail(values.email);
          setCurrentStep(2);
        } else {
          setErrors({ general: message || "Failed to send OTP" });
        }
      } else if (currentStep === 2) {
        // Validate OTP
        await otpValidationSchema.validate({ otp: values.otp });
        const { success, message, token } = await verifyOTP({
          email: values.email,
          otp: values.otp,
        });
        if (success) {
          setResetToken(token);
          setCurrentStep(3);
        } else {
          setErrors({ general: message || "Invalid OTP" });
        }
      } else if (currentStep === 3) {
        // Validate passwords
        await passwordValidationSchema.validate({
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        const { success, message } = await resetPassword({
          token: resetToken,
          newPassword: values.newPassword,
        });
        if (success) {
          setIsSuccess(true);
          setTimeout(() => {
            navigate("/auth/signin");
          }, 3000);
        } else {
          setErrors({ general: message || "Failed to reset password" });
        }
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        setErrors({ [error.path]: error.message });
      } else {
        setErrors({ general: error.message || "An error occurred" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  return {
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
  };
};
