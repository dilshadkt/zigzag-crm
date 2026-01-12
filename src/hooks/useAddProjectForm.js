import { useFormik } from "formik";
import * as Yup from "yup";
export const useAddProjectForm = (defaultValue, onSubmit) => {
  const initialValues = {
    name: defaultValue?.name || "",
    thumbImg: defaultValue?.thumbImg || null,
    startDate: defaultValue?.startDate || "",
    endDate: defaultValue?.endDate || "",
    periority: defaultValue?.periority || "low",
    assignee: defaultValue?.assignee || "",
    attachments: defaultValue?.attachments || [],
    description: defaultValue?.description || "",
    teams: defaultValue?.teams || [],
    workDetails: defaultValue?.workDetails || {},
    socialMedia: defaultValue?.socialMedia || {},
    dailyChecklist: defaultValue?.dailyChecklist || [],
  };

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
    periority: Yup.string()
      .required("Priority is required")
      .oneOf(['low', 'medium', 'high'], 'Priority must be low, medium, or high'),
    teams: Yup.array()
      .min(1, 'At least one team member must be selected')
      .required('Team members are required'),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must not exceed 1000 characters"),
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
