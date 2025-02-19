import { useFormik } from "formik";
import * as Yup from "yup";
export const useAddTaskForm = () => {
  const initialValue = {
    name: "",
    taskGroup: "",
    startDate: "",
    dueDate: "",
    periority: "",
    assignee: "",
    description: "",
  };
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    taskGroup: Yup.string().required("Task group is required"),
    startDate: Yup.string().required("Start date is required"),
    dueDate: Yup.string().required("Due date is required"),
    periority: Yup.string().required("Periority is required"),
    assignee: Yup.string().required("Assignee is required"),
    description: Yup.string().required("Description is required"),
  });
  const formik = useFormik({
    initialValue,
    validationSchema,
    onSubmit: (value) => {},
  });
  return formik;
};
