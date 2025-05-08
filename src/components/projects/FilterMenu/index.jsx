import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import DatePicker from "../../shared/Field/date";

const FilterMenu = ({ isOpen, setShowModalFilter }) => {
  if (!isOpen) {
    return null;
  }
  return (
    <div
      className="fixed left-0 right-0 top-0 bottom-0
bg-[#2155A3]/15  py-3 px-3 z-50 flexEnd"
    >
      <div
        className="w-[400px]  bg-white rounded-3xl flex flex-col
 py-7 h-full"
      >
        <div className="flexBetween px-7 border-b border-[#E4E6E8]/80 pb-4">
          <h4 className="text-lg font-medium ">Filters</h4>
          <PrimaryButton
            icon={"/icons/cancel.svg"}
            className={"bg-[#F4F9FD]"}
            onclick={() => setShowModalFilter(false)}
          />
        </div>
        <div className="px-7 pb-5 pt-4  border-b border-[#E4E6E8]/80">
          <DatePicker title="Period" />
        </div>
        {/* task group  */}
        <div className="px-7 py-5  border-b border-[#E4E6E8]/80 flex flex-col">
          <h5 className="text-sm font-medium text-[#7D8592]">Task Group</h5>
          <div className="flex flex-col mt-5 gap-y-5">
            {new Array(4).fill(" ").map((item, index) => (
              <label
                key={index}
                class="flex items-center space-x-2 cursor-pointer peer"
              >
                <input type="checkbox" class="hidden peer" />
                <div
                  class="w-4 h-4 border-2 border-gray-500 rounded-md flex
           items-center justify-center transition-all peer-checked:bg-black
            peer-checked:border-black peer-checked:text-white"
                >
                  <svg
                    class="w-3 h-3 text-white opacity-0 transition-opacity duration-200
               peer-has-checked:opacity-100"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <span class="text-gray-700 text-sm font-medium">Design</span>
              </label>
            ))}
          </div>
        </div>
        {/* reporteres  */}
        <div className="px-7 py-5  border-b border-[#E4E6E8]/80 flex flex-col">
          <h5 className="text-sm font-medium text-[#7D8592]">Reporter</h5>
          <div className="flex flex-col mt-5 gap-y-5">
            {new Array(4).fill(" ").map((item, index) => (
              <label
                key={index}
                class="flex items-center space-x-2 cursor-pointer peer"
              >
                <input type="checkbox" class="hidden peer" />
                <div
                  class="w-4 h-4 border-2 border-gray-500 rounded-md flex
           items-center justify-center transition-all peer-checked:bg-black
            peer-checked:border-black peer-checked:text-white"
                >
                  <svg
                    class="w-3 h-3 text-white opacity-0 transition-opacity duration-200
               peer-has-checked:opacity-100"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <span class="text-gray-700 text-sm font-medium">
                  Custom Checkbox
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="px-7 py-5  border-b border-[#E4E6E8]/80 flex flex-col"></div>
      </div>
    </div>
  );
};

export default FilterMenu;
