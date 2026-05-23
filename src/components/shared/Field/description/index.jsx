import React, { useRef, useEffect, useState } from "react";
import clsx from "clsx";
import { FiBold, FiItalic, FiUnderline, FiList, FiTrash2 } from "react-icons/fi";

const Description = ({
  title = "Title",
  placeholder = "Type here ...",
  className,
  value,
  onChange,
  name,
  errors,
  touched,
  disabled,
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Robustly extract the string value whether 'value' is a Formik object or a direct string
  const getStringValue = () => {
    if (typeof value === "object" && value !== null) {
      return value[name] || "";
    }
    return value || "";
  };

  const stringValue = getStringValue();

  // Sync prop value to editor innerHTML (only if different to prevent cursor jumping)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== stringValue) {
      editorRef.current.innerHTML = stringValue;
    }
  }, [stringValue]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current && onChange) {
      const html = editorRef.current.innerHTML;
      // Emit synthetic event
      onChange({
        target: {
          name,
          value: html === "<br>" || html === "" ? "" : html,
        },
      });
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div
        className={clsx(
          "rounded-[14px] border-2 border-[#D8E0F0]/80 overflow-hidden bg-white focus-within:border-blue-400 transition-all",
          {
            "border-red-400/50": errors?.[name] && touched?.[name],
            "opacity-50 cursor-not-allowed pointer-events-none": disabled,
          }
        )}
      >
        {/* Formatting Toolbar */}
        {!disabled && (
          <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 text-[#7D8592]">
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Bold"
            >
              <FiBold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Italic"
            >
              <FiItalic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Underline"
            >
              <FiUnderline className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-gray-200 mx-1" />
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Bullet List"
            >
              <FiList className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("removeFormat")}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors ml-auto"
              title="Clear Formatting"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Editor Edit Area */}
        <div className="relative min-h-[120px] max-h-[300px] overflow-y-auto">
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onPaste={handlePaste}
            className={clsx(
              "w-full h-full min-h-[120px] p-4 outline-none text-sm text-[#7D8592] prose-editor",
              className
            )}
          />
          {/* Placeholder */}
          {!stringValue && !isFocused && (
            <div className="absolute top-4 left-4 text-sm text-gray-400 pointer-events-none">
              {placeholder}
            </div>
          )}
        </div>
      </div>
      {errors?.[name] && touched?.[name] && (
        <span className="text-[10px] text-red-500 pl-1.5 mt-0.5">
          {errors[name]}
        </span>
      )}
    </div>
  );
};

export default Description;
