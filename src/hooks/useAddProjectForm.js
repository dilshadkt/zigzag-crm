import { useFormik } from "formik";
import * as Yup from "yup";
export const useAddProjectForm = (defaultValue, onSubmit) => {
  const initialValues = {
    name: defaultValue?.name || "",
    thumbImg: defaultValue?.thumbImg || null,
    startDate: defaultValue?.startDate || "",
    dueDate: defaultValue?.dueDate || "",
    periority: defaultValue?.periority || "",
    assignee: defaultValue?.assignee || "",
    attachments: defaultValue?.attachments || [],
    description: defaultValue?.description || "",
    teams: defaultValue?.teams || [],
  };
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    startDate: Yup.string().required("Start date is required"),
    dueDate: Yup.string().required("Due date is required"),
    periority: Yup.string().required("Periority is required"),
    assignee: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        firstName: Yup.string(),
      })
    ),
    description: Yup.string().required("Description is required"),
  });
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });
  return formik;
};
