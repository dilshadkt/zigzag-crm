import React from "react";
import PrimaryButton from "../shared/buttons/primaryButton";

const NotificationBar = ({ setNotifyMenuOpen }) => {
  return (
    <div
      className="fixed left-0 font-normal  right-0 bottom-0 flexEnd py-4 px-5 top-0 m-auto bg-[#2155A3]/20
     z-[1000] backdrop-blur-sm"
    >
      <div className="w-[390px] flex flex-col bg-white  rounded-3xl overflow-hidden h-full">
        <div className="h-[85px] border-b border-[#E4E6E8]  px-[26px] w-full flexCenter">
          <div className="flexBetween w-full">
            <h3 className="font-medium text-lg">Notifications</h3>
            <PrimaryButton
              onclick={() => setNotifyMenuOpen(false)}
              icon={"/icons/cancel.svg"}
              className={"bg-[#F4F9FD]"}
            />
          </div>
        </div>
        <div className="h-full flex flex-col  overflow-y-auto mb-5">
          {new Array(7).fill(" ").map((item, index) => (
            <div
              key={index}
              className="flex px-[26px] border-[#E4E6E8] gap-x-3 py-4 border-b"
            >
              <div className="w-[50px] h-[50px] rounded-full overflow-hidden ">
                <img
                  src="/image/photo.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-y-1 ">
                <span className="text-sm">
                  <b> Emily Tyler</b> sent you a comment in Research task
                </span>
                <span className="text-sm text-[#7D8592]">2h ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;
