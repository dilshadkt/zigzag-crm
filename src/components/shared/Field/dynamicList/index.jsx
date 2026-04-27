import React from "react";
import { HiPlus, HiX } from "react-icons/hi";
import clsx from "clsx";

const DynamicList = ({
  title = "Title",
  placeholder = "Add item...",
  value = [""], // Expects an array of strings OR an array of objects
  fields = [], // Optional: array of strings defining sub-fields for each item
  onChange, // Callback for when the array changes
  name,
  errors,
  touched,
  disabled,
}) => {
  const hasFields = Array.isArray(fields) && fields.length > 0;

  // Initialize a new empty item based on whether we have fields or not
  const createEmptyItem = () => {
    if (hasFields) {
      const emptyObj = {};
      fields.forEach(f => {
        emptyObj[f.toLowerCase().trim().replace(/\s+/g, '_')] = "";
      });
      return emptyObj;
    }
    return "";
  };

  // Ensure value is always an array
  const list = Array.isArray(value) ? value : [createEmptyItem()];
  
  // If list is empty, default to one empty item
  const safeList = list.length === 0 ? [createEmptyItem()] : list;

  const handleAddItem = () => {
    const newList = [...safeList, createEmptyItem()];
    onChange(newList);
  };

  const handleRemoveItem = (index) => {
    if (safeList.length <= 1) {
        const newList = [createEmptyItem()];
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

  const handleFieldChange = (index, fieldKey, fieldValue) => {
    const newList = [...safeList];
    const updatedItem = { ...newList[index], [fieldKey]: fieldValue };
    newList[index] = updatedItem;
    onChange(newList);
  };

  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div className="flex flex-col gap-y-3">
        {safeList.map((item, index) => (
          <div key={index} className="flex flex-col gap-y-2 p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
            <div className="flex items-start gap-x-2 w-full">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hasFields ? (
                  fields.map((field) => {
                    const fieldKey = field.toLowerCase().trim().replace(/\s+/g, '_');
                    return (
                      <div key={fieldKey} className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                          {field}
                        </label>
                        <input
                          type="text"
                          value={item?.[fieldKey] || ""}
                          onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                          placeholder={`Enter ${field}...`}
                          disabled={disabled}
                          className={clsx(
                            "rounded-[12px] text-[13px] border-2 text-[#4A5568] border-white bg-white shadow-sm py-[8px] px-3 outline-none focus:border-blue-400/50 transition-all w-full",
                            disabled && "cursor-not-allowed opacity-60",
                            errors?.[name] && touched?.[name] && "border-red-400/50"
                          )}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full">
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
                )}
              </div>
              
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="mt-6 p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors border border-transparent hover:border-red-100 shadow-sm bg-white"
                title="Remove item"
              >
                <HiX size={18} />
              </button>
            </div>
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
