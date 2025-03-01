import { useFormik } from "formik";
import * as Yup from "yup";
import { processAttachments } from "../lib/attachmentUtils";
import { uploadSingleFile } from "../api/service";
export const useAddTaskForm = (defaultValue, onSubmit) => {
  const initialValues = {
    title: defaultValue?.title || "",
    taskGroup: "",
    startDate: defaultValue?.startDate || "",
    dueDate: defaultValue?.dueDate || "",
    periority: defaultValue?.priority || "",
    assignee: defaultValue?.assignedTo?.firstName || "",
    description: defaultValue?.description || "",
  };
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Name is required"),
    taskGroup: Yup.string().required("Task group is required"),
    startDate: Yup.string().required("Start date is required"),
    dueDate: Yup.string().required("Due date is required"),
    periority: Yup.string().required("Periority is required"),
    assignee: Yup.string().required("Assignee is required"),
    description: Yup.string().required("Description is required"),
  });
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });
  return formik;
};
