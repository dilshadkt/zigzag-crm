import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import Select from "../../shared/Field/select";
import DatePicker from "../../shared/Field/date";
import Input from "../../shared/Field/input";

const AddTask = ({ setShowModalTask }) => {
  return (
    <div
      className="fixed left-0 right-0 top-0 bottom-0
bg-[#2155A3]/15 backdrop-blur-sm py-8 z-50 flexCenter"
    >
      <div
        className="p-10 bg-white pt-12  px-12 flex flex-col
rounded-3xl max-w-[584px] w-full h-full relative"
      >
        <div className="w-full h-full flex flex-col overflow-y-auto">
          <h4 className="text-lg pb-2 font-medium sticky top-0 bg-white z-20">
            Add Task
          </h4>
          <form action=" " className="mt-3 flex flex-col gap-y-4">
            <Input placeholder="Task Name" title="Task Name" />
            <Select
              title="Task Group"
              options={["Design", "Content", "Editing"]}
            />
            <div className="grid gap-x-4 grid-cols-2">
              <DatePicker title="Estimate" />
              <DatePicker title="Dead Line" />
            </div>
            <Select title="Priority" options={["Low", "Medium", "High"]} />
            <Select
              title="Assignee"
              options={["John Doe", "Jane Doe"]}
              defaultValue={"Select Assignee"}
            />
            <Description
              title="Description"
              placeholder="Add some description of the task"
            />
            <div>
              <div className="flexStart gap-x-4  mt-3">
                <PrimaryButton
                  icon={"/icons/file.svg"}
                  className={"bg-[#6D5DD3]/10"}
                />
                <PrimaryButton
                  icon={"/icons/link.svg"}
                  className={"bg-[#15C0E6]/10"}
                />
              </div>
              <div className="flexEnd">
                <PrimaryButton title="Save Task" />
              </div>
            </div>
          </form>
        </div>
        <PrimaryButton
          icon={"/icons/cancel.svg"}
          className={"bg-[#F4F9FD] absolute z-40 top-7 right-7"}
          onclick={() => setShowModalTask(false)}
        />
      </div>
    </div>
  );
};

export default AddTask;
