import React from "react";
import Select from "../../../shared/Field/select";

const YourSelf = ({ errors, values, handleChange, touched }) => {
  return (
    <form action="" className="flex flex-col gap-y-4 mt-6">
      <div className="flex flex-col gap-y-4">
        <Select
          errors={errors}
          value={values.service}
          name={"service"}
          onChange={handleChange}
          touched={touched}
          title="Why will you use the service?"
          options={["Work", "Study", "Personal", "Company"]}
        />
        <Select
          errors={errors}
          value={values.describe}
          name={"describe"}
          onChange={handleChange}
          touched={touched}
          title="What describes you best?"
          options={["Business Owner", "Student", "Professional"]}
        />
      </div>
    </form>
  );
};

export default YourSelf;
