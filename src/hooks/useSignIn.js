import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import { signIn } from "../api/service";
export const useSignIn = () => {
  const navigate = useNavigate();
  const initialValues = {
    email: "",
    password: "",
  };
  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
  });
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const { success, message } = await signIn(values);
      if (success) {
        navigate("/");
      } else {
        console.log(message);
      }
    },
  });
  return formik;
};
