import { useFormik } from "formik";
import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Input from "../../shared/Field/input";
import Select from "../../shared/Field/select";
import { useAddEmpoloyeeForm } from "../../../hooks/useAddEmpoloyeeForm";

const CreateEmployee = ({ isOpen, handleClose, onSubmit }) => {
  const {
    values,
    handleChange,
    handleSubmit,
    errors,
    resetForm,
    touched,
    isSubmitting,
  } = useAddEmpoloyeeForm({}, onSubmit);
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
            <Select
              errors={errors}
              touched={touched}
              name={"position"}
              value="Digital marketer"
              onChange={handleChange}
              title="Position"
              options={[
                "Digital marketer",
                "Graphic designer",
                "Video Grapher",
                "Content creator",
                "Cordinator",
                "Intern",
                "Accountent",
                "Hr",
                "Tele caller",
              ]}
            />
            <Select
              errors={errors}
              name={"level"}
              touched={touched}
              value={"Low"}
              onChange={handleChange}
              title="Experince Level"
              options={["Low", "Medium", "High"]}
            />

            <div>
              <div className="flexEnd">
                <PrimaryButton
                  // loading={isSubmitting}
                  type="submit"
                  title="Save Task"
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
