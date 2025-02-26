import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useUpdateProfile } from "../../../api/hooks";

const GetStart = () => {
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate("/welcome/user-profile");
  };
  const { mutate } = useUpdateProfile(handleSuccess);

  // Define validation schema
  const validationSchema = Yup.object({
    dob: Yup.date()
      .required("Date of birth is required")
      .max(new Date(), "Date of birth cannot be in the future")
      .test(
        "is-old-enough",
        "You must be at least 13 years old",
        function (value) {
          if (!value) return true; // Skip validation if no date
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          return age >= 13;
        }
      ),
    gender: Yup.string()
      .required("Please select a gender")
      .oneOf(["Male", "Female", "Other"], "Invalid gender selection"),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      dob: "",
      gender: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      mutate(values);
    },
  });

  return (
    <div className="flex flex-col items-center max-w-md w-full p-4">
      <h4 className="text-4xl font-bold text-center mb-8">
        Personal Details 🧑
      </h4>

      <form onSubmit={formik.handleSubmit} className="w-full space-y-6">
        {/* Date of Birth Input */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium mb-2 text-[#7D8592]">
            Date of Birth
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formik.values.dob}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-2 text-[#7D8592] text-sm border-2 border-[#D8E0F0]/80 
              rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${
                formik.touched.dob && formik.errors.dob
                  ? "border-red-500 focus:ring-red-500"
                  : ""
              }`}
          />
          {formik.touched.dob && formik.errors.dob && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.dob}</div>
          )}
        </div>

        {/* Gender Selection */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium mb-2 text-[#7D8592]">
            Gender
          </label>
          <div className="grid grid-cols-3 gap-4">
            {["Male", "Female", "Other"].map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => formik.setFieldValue("gender", option)}
                className={`px-4 py-2 cursor-pointer rounded-lg border-2 text-[#7D8592] border-[#D8E0F0]/80 transition-colors
                    ${
                      formik.values.gender === option
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
              >
                {option}
              </button>
            ))}
          </div>
          {formik.touched.gender && formik.errors.gender && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.gender}
            </div>
          )}
        </div>

        <PrimaryButton
          title="Continue"
          loading={formik.isSubmitting}
          type="submit"
          disabled={!formik.isValid || formik.isSubmitting}
          className={`w-full mt-8 text-white font-medium ${
            !formik.isValid || formik.isSubmitting
              ? "opacity-70 cursor-not-allowed"
              : ""
          }`}
        />
      </form>
    </div>
  );
};

export default GetStart;
