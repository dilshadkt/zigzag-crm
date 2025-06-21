import { useFormik } from "formik";
import * as Yup from "yup";
import { processAttachments } from "../lib/attachmentUtils";
import { uploadSingleFile } from "../api/service";

export const useAddTaskForm = (defaultValue, onSubmit) => {
  const initialValues = {
    title: defaultValue?.title || "",
    taskGroup: defaultValue?.taskGroup || "",
    extraTaskWorkType: defaultValue?.extraTaskWorkType || "",
    taskMonth: defaultValue?.taskMonth || "",
    startDate: defaultValue?.startDate || "",
    dueDate: defaultValue?.dueDate || "",
    periority: defaultValue?.priority || "",
    assignedTo: defaultValue?.assignedTo
      ? Array.isArray(defaultValue.assignedTo)
        ? defaultValue.assignedTo.map((user) => user._id || user)
        : [defaultValue.assignedTo._id || defaultValue.assignedTo]
      : [],
    copyOfDescription: defaultValue?.copyOfDescription || "",
    description: defaultValue?.description || "",
    // Recurring task fields
    isRecurring: defaultValue?.isRecurring || false,
    recurringPattern: defaultValue?.recurringPattern || "none",
    recurringInterval: defaultValue?.recurringInterval || 1,
    recurringEndDate: defaultValue?.recurringEndDate || "",
    maxRecurrences: defaultValue?.maxRecurrences || "",
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Name is required"),
    taskGroup: Yup.string().required("Task group is required"),
    extraTaskWorkType: Yup.string().when("taskGroup", {
      is: "extraTask",
      then: (schema) => schema.required("Extra task work type is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    taskMonth: Yup.string()
      .required("Task month is required")
      .matches(/^\d{4}-\d{2}$/, "Task month must be in YYYY-MM format"),
    startDate: Yup.string().required("Start date is required"),
    dueDate: Yup.string().required("Due date is required"),
    periority: Yup.string().required("Priority is required"),
    assignedTo: Yup.array().min(1, "At least one assignee is required"),
    copyOfDescription: Yup.string().required("Copy of description is required"),
    description: Yup.string().required("Description is required"),
    // Recurring validations
    recurringPattern: Yup.string().oneOf([
      "none",
      "daily",
      "weekly",
      "monthly",
    ]),
    recurringInterval: Yup.number().min(1, "Interval must be at least 1"),
    maxRecurrences: Yup.number().min(1, "Must be at least 1 recurrence"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  return formik;
};
