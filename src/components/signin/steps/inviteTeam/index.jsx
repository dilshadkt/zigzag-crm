import React from "react";
import Input from "../../../shared/Field/input";
import { IoMdAdd } from "react-icons/io";

const InviteTeam = ({ errors, values, handleChange, touched }) => {
  return (
    <form action="" className="flex flex-col gap-y-4 mt-6">
      <div className="flex flex-col gap-y-4">
        <Input
          name={"membersEmail"}
          errors={errors}
          onchange={handleChange}
          touched={touched}
          value={values}
          title="Member’s Email"
          placeholder="memberemail@gmail.com"
        />
        <button
          type="button"
          className="flexStart gap-x-3 text-[#3F8CFF] cursor-pointer"
        >
          <IoMdAdd className={"text-xl"} />
          <span className="text-sm font-medium">Add another Member</span>
        </button>
      </div>
    </form>
  );
};

export default InviteTeam;
