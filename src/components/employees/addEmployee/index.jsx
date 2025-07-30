import { useFormik } from "formik";
import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Input from "../../shared/Field/input";
import Select from "../../shared/Field/select";
import { useAddEmpoloyeeForm } from "../../../hooks/useAddEmpoloyeeForm";
import { useGetPositions } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";

const CreateEmployee = ({ isOpen, handleClose, onSubmit }) => {
  const { user } = useAuth();
  const companyId = user?.company;

  // Fetch positions dynamically
  const {
    data: positionsData,
    isLoading: positionsLoading,
    error: positionsError,
  } = useGetPositions(companyId);

  const {
    values,
    handleChange,
    handleSubmit,
    errors,
    resetForm,
    touched,
    isSubmitting,
  } = useAddEmpoloyeeForm({}, onSubmit);

  // Extract position names from the API response
  const positionOptions = React.useMemo(() => {
    if (positionsLoading) return ["Loading positions..."];
    if (positionsError) return ["Error loading positions"];
    if (!positionsData?.positions?.length) return ["No positions available"];

    return positionsData.positions
      .filter((pos) => pos.isActive)
      .map((position) => position.name);
  }, [positionsData, positionsLoading, positionsError]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed w-full h-full bg-[#2155A3]/15
left-0 right-0 bottom-0 top-0 flexCenter backdrop-blur-sm"
    >
      <div
        className="rounded-3xl flex flex-col max-w-xl w-full
 bg-white p-12 relative overflow-y-auto  max-h-[90vh]"
      >
        <div className="w-full h-full overflow-y-auto">
          <h4 className="text-lg font-medium sticky top-0 bg-white z-30 pb-2">
            Add Employee
          </h4>

          {/* Display general error message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form
            action=" "
            onSubmit={handleSubmit}
            className="mt-3  overflow-y-auto h-full flex flex-col gap-y-4"
          >
            <Input
              placeholder="First Name"
              title="First Name"
              errors={errors}
              name={"firstName"}
              onchange={handleChange}
              touched={touched}
              value={values}
            />
            <Input
              placeholder="Last Name"
              title="Last Name"
              errors={errors}
              name={"lastName"}
              onchange={handleChange}
              touched={touched}
              value={values}
            />
            <Input
              placeholder="Email"
              title="Email"
              errors={errors}
              name={"email"}
              onchange={handleChange}
              touched={touched}
              value={values}
            />
            <Input
              placeholder="Password"
              title="Password"
              errors={errors}
              name={"password"}
              onchange={handleChange}
              touched={touched}
              value={values}
            />
            <Input
              placeholder="Phone Number"
              title="Phone Number"
              errors={errors}
              name={"phoneNumber"}
              onchange={handleChange}
              touched={touched}
              value={values}
            />
            <div className="flex flex-col gap-y-[7px]">
              <Select
                errors={errors}
                touched={touched}
                name={"position"}
                value={values.position || ""}
                onChange={handleChange}
                title="Position"
                placeholder="Select Position"
                selectedValue={values.position[0]}
                options={positionOptions}
                disabled={
                  positionsLoading ||
                  positionsError ||
                  !positionsData?.positions?.length
                }
              />
              {positionsError && (
                <p className="text-xs text-red-500 px-2">
                  Failed to load positions. Please try refreshing the page.
                </p>
              )}
              {!positionsLoading &&
                !positionsError &&
                !positionsData?.positions?.length && (
                  <p className="text-xs text-amber-600 px-2">
                    No positions found. Please create positions first in
                    Settings → Company → Position Management.
                  </p>
                )}
            </div>
            <Select
              errors={errors}
              name={"level"}
              touched={touched}
              value={values.level || ""}
              onChange={handleChange}
              title="Experience Level"
              placeholder="Select Experience Level"
              options={["Low", "Medium", "High"]}
            />

            <div>
              <div className="flexEnd">
                <PrimaryButton
                  loading={isSubmitting}
                  type="submit"
                  title="Save Employee"
                  disabled={isSubmitting || positionsLoading}
                />
              </div>
            </div>
          </form>
        </div>
        <PrimaryButton
          icon={"/icons/cancel.svg"}
          className={"bg-[#F4F9FD] absolute z-40 top-7 right-7"}
          onclick={() => {
            resetForm();
            handleClose();
          }}
        />
      </div>
    </div>
  );
};

export default CreateEmployee;
