import React, { useState } from "react";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Progress from "../../components/shared/progress";
import Input from "../../components/shared/Field/input";
import DatePicker from "../../components/shared/Field/date";
import { FaArrowLeft } from "react-icons/fa";
import { SETTINGS } from "../../constants";
import { Link, Outlet } from "react-router-dom";

const SettingsLayout = () => {
  const [selected, setSelected] = useState(SETTINGS[0].id);
  return (
    <section className="flex flex-col h-full gap-y-3">
      <div className="flexBetween ">
        <Header>My Profile</Header>
        <PrimaryButton
          icon={"/icons/settings.svg"}
          className={"mt-3 bg-white"}
        />
      </div>
      <div className="w-full h-full  overflow-hidden gap-x-5  flex">
        {/* current project section  */}
        <div
          className="w-[250px] bg-white overflow-hidden pb-4 h-full text-[#0A1629]
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
        {/* Settings info page  */}
        <div className="flex-1 overflow-hidden  gap-y-5  flex flex-col">
          <div className="flexStart gap-x-3 ">
            <FaArrowLeft className=" text-[#3F8CFF] text-lg hover:scale-85 cursor-pointer " />
            <h4 className="text-lg font-medium">Settings</h4>
          </div>
          <div className=" flex h-full  gap-x-5">
            <div className="w-[250px] rounded-3xl bg-white p-2 flex flex-col gap-y-1  pt-5">
              {SETTINGS.map((setting, index) => (
                <Link
                  to={`/settings/${setting.path}`}
                  key={index}
                  onClick={() => setSelected(setting.id)}
                  className={`flexStart px-4 group text-[#7D8592] 
              rounded-xl py-[10px] relative mr-1 ${
                selected === setting.id && `bg-[#F4F9FD]`
              } hover:bg-[#F4F9FD] gap-x-3`}
                >
                  <setting.icon
                    className={` ${selected === setting.id && `text-[#3F8CFF]`}
                     group-hover:text-[#3F8CFF] text-lg`}
                  />
                  <span
                    className={`group-hover:text-gray-800 group-hover:translate-x-1
              transition-all duration-300 text-[15px] ${
                selected === setting.id && `text-[#3F8CFF]`
              }`}
                  >
                    {setting.title}
                  </span>
                  <div
                    className={`absolute h-full bg-[#3F8CFF] w-1 
               ${
                 setting.id === selected ? `block` : `hidden`
               } -right-[11px] rounded-full top-0 bottom-0`}
                  ></div>
                </Link>
              ))}
            </div>
            <div className="flex-1 bg-white p-5 rounded-3xl">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsLayout;
