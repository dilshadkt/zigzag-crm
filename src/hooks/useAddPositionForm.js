import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreatePosition, useUpdatePosition } from "../api/hooks";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Position name is required"),
  allowedRoutes: Yup.array()
    .min(1, "At least one route must be selected")
    .required("Allowed routes are required"),
});

export const useAddPositionForm = (initialValues) => {
  const { mutate: createPosition } = useCreatePosition();
  const { mutate: updatePosition } = useUpdatePosition();

  const formik = useFormik({
    initialValues: initialValues || {
      name: "",
      allowedRoutes: [],
    },
    validationSchema,
    onSubmit: (values) => {
      if (initialValues) {
        updatePosition({ id: initialValues._id, ...values });
      } else {
        createPosition(values);
      }
    },
  });

  return {
    values: formik.values,
    touched: formik.touched,
    errors: formik.errors,
    handleChange: (e) => {
      if (e.target.type === "checkbox") {
        const { name, value, checked } = e.target;
        const currentValues = formik.values[name] || [];

        if (checked) {
          formik.setFieldValue(name, [...currentValues, value]);
        } else {
          formik.setFieldValue(
            name,
            currentValues.filter((v) => v !== value)
          );
        }
      } else {
        formik.handleChange(e);
      }
    },
    handleSubmit: formik.handleSubmit,
    resetForm: formik.resetForm,
  };
};
