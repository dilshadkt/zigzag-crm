import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Input from "../../shared/Field/input";
import DatePicker from "../../shared/Field/date";
import Select from "../../shared/Field/select";
import Description from "../../shared/Field/description";

const AddProject = ({ setShowModalProject }) => {
  return (
    <div
      className="fixed z-50 left-0 right-0 top-0 bottom-0
bg-blue-50 flexCenter py-8 backdrop-blur-sm"
    >
      <div
        className="bg-white w-full rounded-3xl py-14 flex flex-col
  px-28 h-full max-w-[1149px] m-auto relative "
      >
        <h4 className="text-3xl font-medium">Add Project</h4>
        <form className="w-full grid grid-cols-5 mt-12 gap-x-[50px] ">
          <div className="col-span-3 flex flex-col gap-y-5">
            <Input placeholder="Project Name" title="Project Name" />
            <div className="grid grid-cols-2 gap-x-4">
              <DatePicker title="Starts" />
              <DatePicker title="Dead Line" />
            </div>
            <Select title="Priority" options={["Low", "Medium", "High"]} />
            <Description
              title="Description"
              placeholder="Add some description of the project"
            />
          </div>
          <div className="col-span-2  flex flex-col ">
            <div
              className="flex flex-col border h-fit max-h-[340px] 
      px-7 py-6 border-[#CED5E0]/70 rounded-3xl"
            >
              <h4 className=" font-medium">Select image</h4>
              <p className="text-[#0A1629]/70  my-2">
                Select or upload an avatar for the project (available formats:
                jpg, png)
              </p>
              <div className="grid gap-6 mt-2 grid-cols-4">
                {new Array(7).fill(" ").map((item, index) => (
                  <div
                    key={index}
                    className="w-full h-[53px] bg-[#F4F9FD] 
            rounded-[10px] flexCenter flex flex-col overflow-hidden gap-y-2 cursor-pointer"
                  >
                    <img
                      src={`/image/projects/icon${index + 1}.png`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div
                  className="w-full h-[53px] bg-[#F4F9FD] 
            rounded-[10px] flexCenter flex flex-col overflow-hidden gap-y-2 cursor-pointer"
                >
                  <img
                    src={`/image/projects/upload.png`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="flexStart gap-x-4 mt-6">
              <PrimaryButton
                icon={"/icons/file.svg"}
                className={"bg-[#6D5DD3]/10"}
              />
              <PrimaryButton
                icon={"/icons/link.svg"}
                className={"bg-[#15C0E6]/10"}
              />
            </div>
          </div>
        </form>
        <PrimaryButton
          onclick={() => setShowModalProject(false)}
          icon={"/icons/cancel.svg"}
          className={"absolute bg-[#F4F9FD] right-[30px] top-[30px]"}
        />
        <PrimaryButton
          title={"Save Project"}
          className={"absolute text-white right-[112px] px-4 bottom-[57px]"}
        />
      </div>
    </div>
  );
};

export default AddProject;
