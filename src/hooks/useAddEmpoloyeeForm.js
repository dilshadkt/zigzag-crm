import { useFormik } from "formik";
import * as Yup from "yup";

export const useAddEmpoloyeeForm = (defaultValue, onSubmit) => {
  const initialValues = {
    firstName: defaultValue?.firstName || "",
    lastName: defaultValue?.lastName || "",
    email: defaultValue?.email || "",
    password: defaultValue?.password || "",
    role: "employee",
    phoneNumber: defaultValue?.phoneNumber || "",
    position: defaultValue?.position || "",
    level: defaultValue?.level || "",
  };

  // Create validation schema matching the employee form fields
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    position: Yup.string().required("Position is required"),
    level: Yup.string().required("Level is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return formik;
};
