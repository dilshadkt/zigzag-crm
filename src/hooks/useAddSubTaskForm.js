import { useFormik } from "formik";
import * as Yup from "yup";
import { processAttachments } from "../lib/attachmentUtils";
import { uploadSingleFile } from "../api/service";

export const useAddSubTaskForm = (defaultValue, onSubmit) => {
  const initialValues = {
    title: defaultValue?.title || "",
    startDate: defaultValue?.startDate || "",
    dueDate: defaultValue?.dueDate || "",
    priority: defaultValue?.priority || "Low",
    assignedTo: defaultValue?.assignedTo
      ? Array.isArray(defaultValue.assignedTo)
        ? defaultValue.assignedTo.map((user) => user._id || user)
        : [defaultValue.assignedTo._id || defaultValue.assignedTo]
      : [],
    description: defaultValue?.description || "",
    copyOfDescription: defaultValue?.copyOfDescription || "",
    ideas: defaultValue?.ideas || "",
    publishUrls: defaultValue?.publishUrls || {},
    parentTaskId: defaultValue?.parentTaskId || "",
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Subtask name is required"),
    startDate: Yup.string().required("Start date is required"),
    dueDate: Yup.string().required("Due date is required"),
    priority: Yup.string().required("Priority is required"),
    assignedTo: Yup.array().min(1, "At least one assignee is required"),
    description: Yup.string(),
    copyOfDescription: Yup.string(),
    ideas: Yup.string(),
    publishUrls: Yup.object(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  return formik;
};
