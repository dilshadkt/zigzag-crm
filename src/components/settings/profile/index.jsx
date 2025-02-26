import React, { useState } from "react";
import Input from "../../shared/Field/input";
import DatePicker from "../../shared/Field/date";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Progress from "../../shared/progress";
import * as Yup from "yup";
import { useFormik } from "formik";
const UserProfile = ({ user }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  // Initial form values from the user object
  const initialValues = {
    position: user?.position || "",
    company: user?.company || "",
    location: user?.location || "",
    birthday: user?.dob || null,
    email: user?.email || "",
    mobile: user?.phoneNumber || "",
    skype: user?.skype || "",
  };
  // Validation schema (optional, since fields are not required)
  const validationSchema = Yup.object({});
  const { values, errors, touched, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {},
  });

  return (
    <div
      className="w-[250px] bg-white overflow-hidden pb-4 h-full text-[#0A1629]
rounded-3xl  flex flex-col "
    >
      <div className="flex flex-col border-b border-[#E4E6E8] p-5">
        <div className="flex justify-between">
          <div className="relative">
            <Progress size={54} currentValue={75} />
            <img
              src={user?.profileImage}
              alt=""
              className="absolute top-0 left-0 right-0 bottom-0 w-full h-full  object-cover rounded-full"
            />
          </div>
          <PrimaryButton
            onclick={() => setIsEditMode(!isEditMode)}
            icon={"/icons/edit.svg"}
            className={`${isEditMode ? `bg-[#3F8CFF]` : `bg-[#F4F9FD]`}`}
          />
        </div>
        <h4 className="text-lg font-medium mt-2">{user?.firstName}</h4>
        <span className="text-xs text-gray-600  capitalize">
          {user?.position}
        </span>
      </div>
      <form
        action=""
        className="flex h-full flex-col px-5 py-4 overflow-y-auto"
      >
        <div className="flex flex-col gap-y-3">
          <h4 className=" font-medium">Main info</h4>
          <Input
            readOnly={!isEditMode}
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"position"}
            value={values}
            title="Position"
            placeholder="UI/UX Designer"
          />
          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"company"}
            value={values}
            readOnly={!isEditMode}
            title="Company"
            placeholder="Cadabra"
          />
          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"location"}
            value={values}
            readOnly={!isEditMode}
            title="Location"
            placeholder="NYC, New York, USA"
          />
          <DatePicker
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"dob"}
            value={values.birthday}
            readOnly={!isEditMode}
            title="Birthday Date"
          />
        </div>
        <div className="flex flex-col gap-y-3 mt-7">
          <h4 className=" font-medium">Contact Info</h4>
          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"email"}
            value={values}
            readOnly={!isEditMode}
            title="Email"
            placeholder="evanyates@gmail.com"
          />
          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"mobile"}
            value={values}
            readOnly={!isEditMode}
            title="Mobile Number"
            placeholder="+1 675 346 23-10"
          />
          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"skype"}
            value={values}
            readOnly={!isEditMode}
            title="Skype"
            placeholder="Evan 2256"
          />
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
