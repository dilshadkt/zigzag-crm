import { useFormik } from "formik";
import * as Yup from "yup";
import { processAttachments } from "../lib/attachmentUtils";
import { uploadSingleFile } from "../api/service";

export const useAddTaskForm = (defaultValue, onSubmit) => {
  const initialValues = {
    title: defaultValue?.title || "",
    project: defaultValue?.project || null,
    taskGroup: defaultValue?.taskGroup || "",
    taskFlow: defaultValue?.taskFlow || "",
    extraTaskWorkType: defaultValue?.extraTaskWorkType || "",
    taskMonth: defaultValue?.taskMonth || "",
    startDate: defaultValue?.startDate || "",
    dueDate: defaultValue?.dueDate || "",
    periority: defaultValue?.priority || "Low",
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
    project: Yup.string().nullable(),
    taskGroup: Yup.string().when("project", {
      is: (project) => project && project !== "" && project !== "other",
      then: (schema) => schema.required("Task group is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    extraTaskWorkType: Yup.string().when(["taskGroup", "project"], {
      is: (taskGroup, project) =>
        taskGroup === "extraTask" &&
        project &&
        project !== "" &&
        project !== "other",
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
    copyOfDescription: Yup.string(),
    description: Yup.string(),
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

  const handleSubmit = (values, formikBag) => {
    // Convert empty string project to null before submitting
    const processedValues = {
      ...values,
      project: values.project === "" ? null : values.project,
    };

    onSubmit(processedValues, formikBag);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
  });

  return formik;
};
