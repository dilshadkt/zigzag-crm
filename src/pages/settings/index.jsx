import React from "react";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import { Link } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Progress from "../../components/shared/progress";
import Input from "../../components/shared/Field/input";
import DatePicker from "../../components/shared/Field/date";

const Settings = () => {
  return (
    <section className="flex flex-col h-full gap-y-3">
      <div className="flexBetween ">
        <Header>My Profile</Header>
        <PrimaryButton
          icon={"/icons/settings.svg"}
          // onclick={() => setShowModalTask(true)}
          className={"mt-3 bg-white"}
        />
      </div>
      <div className="w-full h-full  overflow-hidden gap-x-5  grid grid-cols-5">
        {/* current project section  */}
        <div
          className="col-span-1 bg-white overflow-hidden pb-4 h-full text-[#0A1629]
     rounded-3xl  flex flex-col "
        >
          <div className="flex flex-col border-b border-[#E4E6E8] p-5">
            <div className="flex justify-between">
              <div>
                <Progress size={54} currentValue={75} />
              </div>
              <PrimaryButton
                icon={"/icons/edit.svg"}
                className={"bg-[#F4F9FD]"}
              />
            </div>
            <h4 className="text-lg font-medium mt-2">Evan Yates</h4>
            <span className="text-xs text-gray-600 ">UI/UX Designer</span>
          </div>
          <form
            action=""
            className="flex h-full flex-col px-5 py-4 overflow-y-auto"
          >
            <div className="flex flex-col gap-y-3">
              <h4 className=" font-medium">Main info</h4>
              <Input title="Position" placeholder="UI/UX Designer" />
              <Input title="Company" placeholder="Cadabra" />
              <Input title="Location" placeholder="NYC, New York, USA" />
              <DatePicker title="Birthday Date" />
            </div>
            <div className="flex flex-col gap-y-3 mt-7">
              <h4 className=" font-medium">Contact Info</h4>
              <Input title="Email" placeholder="evanyates@gmail.com" />
              <Input title="Mobile Number" placeholder="+1 675 346 23-10" />
              <Input title="Skype" placeholder="Evan 2256" />
            </div>
          </form>
        </div>
        {/* project detail page  */}
        <div className="col-span-4 overflow-hidden   flex flex-col"></div>
      </div>
    </section>
  );
};

export default Settings;
