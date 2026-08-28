import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useCreatePosition, useUpdatePosition } from "../../../api/hooks";
import { toast } from "react-hot-toast";
import ModalLayout from "../../shared/modal";
import { FiShield, FiInfo } from "react-icons/fi";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Position identity required"),
});

const AddPosition = ({ isOpen, setShowModal, initialValues, companyId }) => {
  const { mutate: createPosition, isLoading: isCreating } = useCreatePosition(companyId);
  const { mutate: updatePosition, isLoading: isUpdating } = useUpdatePosition(companyId);

  const handleSubmit = (values, { resetForm }) => {
    const positionData = { ...values, companyId };

    if (initialValues) {
      updatePosition(
        { id: initialValues._id, ...positionData },
        {
          onSuccess: () => {
            toast.success("Role name updated");
            setShowModal(false);
          },
          onError: (error) => toast.error(error.response?.data?.message || "Role update failed"),
        }
      );
    } else {
      createPosition(positionData, {
        onSuccess: () => {
          toast.success("New role established");
          resetForm();
          setShowModal(false);
        },
        onError: (error) => toast.error(error.response?.data?.message || "Role deployment failed"),
      });
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      setIsOpen={setShowModal}
      maxWidth="sm:max-w-md"
      title={initialValues ? "Adjust Role Name" : "Define New Organization Role"}
    >
      <Formik
        initialValues={{
          name: initialValues?.name || "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ errors, touched }) => (
          <Form className="w-full flex flex-col gap-5">
            <div className="space-y-5 px-1">
              {/* Role Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">
                  Role Descriptor Name
                </label>
                <div className="relative group">
                  <Field
                    name="name"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[13px] font-bold transition-all duration-200 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                    placeholder="e.g. Lead Strategist, Senior Creative"
                  />
                  <FiShield className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-400 transition-colors" />
                </div>
                {errors.name && touched.name && (
                  <span className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.name}</span>
                )}
              </div>

              {/* Policy Note */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 flex gap-3">
                <FiInfo className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-blue-700/80 leading-relaxed uppercase tracking-tight">
                  Access control policies (Module permissions & routing) are now managed globally in the Safety & Security Hub. Once this role is created, navigate there to configure its scopes.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-[12px] font-bold text-gray-500 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-6 py-2 text-[12px] font-bold text-white bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isCreating || isUpdating 
                  ? "Configuring Role..." 
                  : initialValues ? "Update Role Name" : "Establish Role"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalLayout>
  );
};

export default AddPosition;
