import * as Yup from "yup";
import { useFormik } from "formik";
import { signIn } from "../api/service";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slice/authSlice";
export const useSignIn = () => {
  const dispatch = useDispatch();
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
    onSubmit: async (values, { setErrors }) => {
      const { success, message, user } = await signIn(values);
      if (success) {
        dispatch(
          loginSuccess({
            user: user._id,
            companyId: user.company,
            isProfileComplete: user?.isProfileComplete || false,
          })
        );

        const isDesktop =
          typeof window !== "undefined" && window.desktop && window.location;

        if (isDesktop) {
          const target = user?.role === "employee" ? "#/" : "#/";
          window.location.hash = target.replace("#", "");
        } else {
          window.location.href = user?.role === "employee" ? "/" : "/";
        }
      } else {
        setErrors({ general: message || "Something went wrong" });
      }
    },
  });
  return formik;
};
