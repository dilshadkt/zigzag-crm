import { useFormik } from "formik";
import * as Yup from "yup";
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
      .required("Due date is required")
      .test('is-valid-date', 'Invalid end date', value => {
        if (!value) return false;
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
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must not exceed 1000 characters"),
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
