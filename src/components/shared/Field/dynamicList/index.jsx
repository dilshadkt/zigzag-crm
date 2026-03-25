import React from "react";
import { HiPlus, HiX } from "react-icons/hi";
import clsx from "clsx";

const DynamicList = ({
  title = "Title",
  placeholder = "Add item...",
  value = [""], // Expects an array of strings
  onChange, // Callback for when the array changes
  name,
  errors,
  touched,
  disabled,
}) => {
  // Ensure value is always an array
  const list = Array.isArray(value) ? value : [""];
  
  // If list is empty, default to one empty string
  const safeList = list.length === 0 ? [""] : list;

  const handleAddItem = () => {
    const newList = [...safeList, ""];
    onChange(newList);
  };

  const handleRemoveItem = (index) => {
    if (safeList.length <= 1) {
        // Reset the only remaining field instead of removing it if it's the last one
        const newList = [""];
        onChange(newList);
        return;
    }
    const newList = safeList.filter((_, i) => i !== index);
    onChange(newList);
  };

  const handleChangeItem = (index, newValue) => {
    const newList = [...safeList];
    newList[index] = newValue;
    onChange(newList);
  };

  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div className="flex flex-col gap-y-3">
        {safeList.map((item, index) => (
          <div key={index} className="flex items-center gap-x-2 w-full">
            <div className="flex-1 relative">
              <input
                type="text"
                value={item}
                onChange={(e) => handleChangeItem(index, e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={clsx(
                  "rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:outline-none w-full",
                  disabled && "cursor-not-allowed opacity-60",
                  errors?.[name] && touched?.[name] && "border-red-400/50"
                )}
              />
            </div>
            
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="p-2 rounded-full hover:bg-red-50 text-red-400 transition-colors border-2 border-transparent hover:border-red-200"
              title="Remove item"
            >
              <HiX size={18} />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-x-2 text-sm font-semibold text-blue-600 hover:text-blue-700 w-fit pl-[6px] mt-1 group transition-colors"
        >
          <div className="p-1 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
            <HiPlus size={16} />
          </div>
          Add New {title}
        </button>
      </div>

      {errors?.[name] && touched?.[name] && (
        <span className="text-[10px] text-red-500 bg-white absolute -bottom-[6px] left-10 px-3 whitespace-nowrap border border-red-200 rounded">
          {errors[name]}
        </span>
      )}
    </div>
  );
};

export default DynamicList;
