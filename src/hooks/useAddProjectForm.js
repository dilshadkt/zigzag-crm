import { useFormik } from "formik";
import * as Yup from "yup";
import { isScheduleValid } from "../components/shared/RecurrenceFields/recurrence";

// Visible text of the editor's HTML: tags dropped, entities decoded, spaces collapsed
const htmlToPlainText = (html) => {
  if (!html) return "";
  const box = document.createElement("div");
  box.innerHTML = String(html).replace(/<br\s*\/?>|<\/(div|p|li)>/gi, " ");
  return (box.textContent || "").replace(/\s+/g, " ").trim();
};

export const useAddProjectForm = (defaultValue, onSubmit, projectFields = []) => {
  const initialValues = {
    name: defaultValue?.name || "",
    thumbImg: defaultValue?.thumbImg || null,
    startDate: defaultValue?.startDate || "",
    endDate: defaultValue?.endDate || "",
    priority: defaultValue?.priority || "low",
    assignee: defaultValue?.assignee || "",
    attachments: defaultValue?.attachments || [],
    description: defaultValue?.description || "",
    teams: defaultValue?.teams || [],
    reporters: defaultValue?.reporters || [],
    workDetails: defaultValue?.workDetails || {},
    socialMedia: defaultValue?.socialMedia || {},
    dailyChecklist: defaultValue?.dailyChecklist || [],
    recurringWork: defaultValue?.recurringWork || [],
    customFields: defaultValue?.customFields || {},
  };

  // Build dynamic validation schema for custom fields
  const customFieldsSchema = (projectFields || []).reduce((acc, field) => {
    if (field.required) {
      let schema;
      switch (field.type) {
        case "number":
          schema = Yup.number().typeError(`${field.label} must be a number`).required(`${field.label} is required`);
          break;
        case "email":
          schema = Yup.string().email("Invalid email format").required(`${field.label} is required`);
          break;
        case "dynamic_list":
          schema = Yup.array()
            .min(1, `${field.label} must have at least one item`)
            .of(Yup.string().required("Item cannot be empty"))
            .required(`${field.label} is required`);
          break;
        case "checkbox":
          // Checkbox is usually not "required" in the traditional sense unless it's "must accept terms"
          schema = Yup.boolean();
          break;
        default:
          schema = Yup.string().required(`${field.label} is required`);
      }
      acc[field.key] = schema;
    }
    return acc;
  }, {});

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must not exceed 100 characters"),
    startDate: Yup.string()
      .required("Start date is required")
      .test('is-valid-date', 'Invalid start date', value => {
        if (!value) return false;
        return new Date(value) instanceof Date && !isNaN(new Date(value));
      }),
    endDate: Yup.string()
      .nullable()
      .notRequired()
      .test('is-valid-date', 'Invalid end date', value => {
        if (!value) return true; // optional
        return new Date(value) instanceof Date && !isNaN(new Date(value));
      })
      .test('is-after-start', 'End date must be after start date', function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) > new Date(startDate);
      }),
    priority: Yup.string()
      .required("Priority is required")
      .oneOf(['low', 'medium', 'high'], 'Priority must be low, medium, or high'),
    teams: Yup.array()
      .min(1, 'At least one team member must be selected')
      .required('Team members are required'),
    // The editor stores HTML, so length is checked on the visible text only;
    // counting the markup (<div>, <br>, &nbsp;...) made short descriptions fail
    description: Yup.string()
      .required("Description is required")
      .test("description-min", "Description must be at least 10 characters", (value) =>
        htmlToPlainText(value).length >= 10
      )
      .test("description-max", "Description must not exceed 5000 characters", (value) =>
        htmlToPlainText(value).length <= 5000
      ),
    recurringWork: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().trim().required("Title is required"),
        schedule: Yup.object().test(
          "valid-schedule",
          "Pick at least one weekday",
          (value) => isScheduleValid(value)
        ),
      })
    ),
    customFields: Yup.object().shape(customFieldsSchema),
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit,
  });

  return {
    ...formik,
    formik, // Return the formik instance
  };
};
