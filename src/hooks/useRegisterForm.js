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
      email: Yup.string().required("Email is required"),
      password: Yup.string().required("Password is required"),
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
      membersEmail: Yup.string().email(),
    }),
  ];

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: validationSchema[currentStep - 1],
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

  return formik;
};
