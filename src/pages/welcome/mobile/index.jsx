import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Phone } from "lucide-react";
import { useUpdateProfile } from "../../../api/hooks";
import { useNavigate } from "react-router-dom";

const MobileNumberInput = () => {
  const phoneRegExp = /^\d{13}$/;
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate("/");
  };
  const { mutate } = useUpdateProfile(handleSuccess);

  const validationSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .min(10, "Minimum length is 10")
      .max(12, "Maximum length is 12")
      .required("Mobile number is required"),
  });

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format the number as user types
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
        6,
        10
      )}`;
    }
  };

  const handleSubmit = (values, { setSubmitting }) => {
    // Remove formatting before submitting
    const digits = values.phoneNumber.replace(/\D/g, "");
    setSubmitting(false);
    mutate({ phoneNumber: digits });
  };

  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md  p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Enter Mobile Number
          </h1>
          <p className="text-gray-500 mt-2">
            Please enter your mobile number to continue
          </p>
        </div>

        <Formik
          initialValues={{ phoneNumber: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            errors,
            touched,
            setFieldValue,
            values,
            isSubmitting,
            isValid,
          }) => (
            <Form className="space-y-6">
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 inset-y-0 flex items-center text-gray-500">
                    +91
                  </span>
                  <Field
                    name="phoneNumber"
                    type="tel"
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setFieldValue("phoneNumber", formatted);
                    }}
                    className={`block w-full pl-12 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.phoneNumber && touched.phoneNumber
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder="123-456-7890"
                  />
                </div>
                {errors.phoneNumber && touched.phoneNumber && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !isValid || !values.phoneNumber}
              >
                {isSubmitting ? "Loading" : "Continue"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to receive SMS messages and accept our Terms
          of Service
        </p>
      </div>
    </div>
  );
};

export default MobileNumberInput;
