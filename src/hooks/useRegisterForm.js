import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { register } from "../api/service";

export const useRegisterForm = (currentStep, setCurrentStep) => {
  const navigate = useNavigate();

  const initialValue = {
    phone: "",
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
      phone: Yup.number().required("Phone Number is required"),
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
      if (currentStep >= 4) {
        const { success } = await register(values);
        if (success) {
          navigate("/auth/sign-up-success");
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    },
  });

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

  // Function to get required fields for current step
  const getRequiredFieldsForStep = () => {
    const stepFields = {
      1: ["phone", "email", "password"],
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
  };
};
