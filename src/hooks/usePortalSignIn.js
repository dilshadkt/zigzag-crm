import * as Yup from "yup";
import { useFormik } from "formik";
import { useSearchParams } from "react-router-dom";
import { portalLogin } from "../api/service";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slice/authSlice";

export const usePortalSignIn = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const initialValues = {
    username: searchParams.get("username") || "",
    password: searchParams.get("password") || "",
  };
  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      const { success, message, user } = await portalLogin(values);
      if (success) {
        dispatch(
          loginSuccess({
            user: user,
            companyId: user.company,
            isProfileComplete: true,
          })
        );
        window.location.href = "/portal/dashboard";
      } else {
        setErrors({ general: message || "Something went wrong" });
      }
    },
  });
  return formik;
};
