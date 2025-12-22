import React, { useState } from "react";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Progress from "../../components/shared/progress";
import Input from "../../components/shared/Field/input";
import DatePicker from "../../components/shared/Field/date";
import { FaArrowLeft } from "react-icons/fa";
import { SETTINGS } from "../../constants";
import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useRouteAccess } from "../../hooks/useRouteAccess";
import UserProfile from "../../components/settings/profile";
import EmployeeSettings from "../../components/settings/employeeSettings";

const SettingsLayout = () => {
  const [selected, setSelected] = useState(SETTINGS[0].id);
  const { user } = useAuth();
  const { hasAccessToRoute } = useRouteAccess();
  const location = useLocation();
  const isEmployee = user?.role === "employee";
  const isAdmin = user?.role === "company-admin";

  // Filter settings based on user's route access
  const accessibleSettings = SETTINGS.filter((setting) => {
    const fullPath = `/settings/${setting.path}`;
    return hasAccessToRoute(fullPath);
  });

  // Update selected setting based on current location
  React.useEffect(() => {
    const currentPath = location.pathname;
    const currentSetting = accessibleSettings.find(
      (setting) => currentPath === `/settings/${setting.path}`
    );
    if (currentSetting) {
      setSelected(currentSetting.id);
    } else if (accessibleSettings.length > 0) {
      setSelected(accessibleSettings[0].id);
    }
  }, [location.pathname, accessibleSettings]);

  // If no settings are accessible, redirect to unauthorized
  if (accessibleSettings.length === 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <section className="flex flex-col  h-full gap-y-3">
      <div className="flexBetween ">
        <Header>{isEmployee ? "My Profile" : "Settings"}</Header>
        <PrimaryButton
          icon={"/icons/settings.svg"}
          className={"mt-3 bg-white"}
        />
      </div>
      <div
        className="w-full h-full  md:overflow-hidden gap-x-5  gap-y-5 md:gap-y-0
       flex flex-col md:flex-row"
      >
        {/* current project section  */}
        {!isAdmin && <UserProfile user={user} />}

        {/* Settings info page  */}
        <div className="flex-1 md:overflow-y-auto h-full  gap-y-2  flex flex-col">
          {!isEmployee && (
            <div className="flexStart gap-x-3 ">
              <FaArrowLeft className=" text-[#3F8CFF] text-lg hover:scale-85 cursor-pointer " />
              <h4 className="text-lg font-medium">
                {isEmployee ? "My Workspace" : "Settings"}
              </h4>
            </div>
          )}

          {isEmployee ? (
            // Employee view - show employee-specific content
            <div className="flex-1 bg-gray-50 p-5 overflow-y-auto flex flex-col h-full rounded-3xl">
              <EmployeeSettings />
            </div>
          ) : (
            // Admin view - show regular settings
            <div className=" flex flex-col gap-y-5 md:gap-y-0 md:flex-row h-full md:overflow-y-auto  gap-x-5">
              <div
                className=" w-full md:w-[250px] rounded-3xl
               bg-white p-2 flex flex-col gap-y-1  pt-5"
              >
                {accessibleSettings.length > 0 ? (
                  accessibleSettings.map((setting, index) => (
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
                        className={` ${
                          selected === setting.id && `text-[#3F8CFF]`
                        }
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
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500 text-sm">
                    No accessible settings
                  </div>
                )}
              </div>
              <div
                className="flex-1 bg-white p-5 md:overflow-hidden
                 flex flex-col h-fit md:h-full
               rounded-3xl"
              >
                <Outlet />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SettingsLayout;
