import React, { useState, useRef } from "react";
import { uploadSingleFile } from "../../../../api/service";
import clsx from "clsx";

const FileUpload = ({
  title = "Upload File",
  placeholder = "Click to upload",
  type = "file",
  className,
  value,
  onchange,
  name,
  errors,
  touched,
  disabled,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await uploadSingleFile(formData);

        if (response.success) {
          const fileUrl = response.fileUrl;
          if (onchange) {
            onchange({ target: { name, value: fileUrl } });
          }
        } else {
          throw new Error(response.message || "Upload failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getFileName = (url) => {
    if (!url) return "";
    return url.split("/").pop();
  };

  const fieldValue = value?.[name] || "";

  return (
    <div className={clsx("flex relative flex-col gap-y-[7px]", className)}>
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div className="w-full relative">
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current.click()}
          className={clsx(
            "rounded-[14px] text-sm border-2 border-[#D8E0F0]/80 py-[10px] px-4 min-h-[46px] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors",
            errors?.[name] && touched?.[name] && "border-red-400/50",
            (disabled || isUploading) && "cursor-not-allowed opacity-60"
          )}
        >
          <div className="flex items-center gap-x-3 truncate">
            {type === "image" && fieldValue ? (
              <img src={fieldValue} alt="Preview" className="w-6 h-6 rounded object-cover" />
            ) : (
              <img src={type === "image" ? "/icons/profile.svg" : "/icons/file.svg"} alt="" className="w-5 h-5 opacity-50" />
            )}
            <span className={clsx("truncate", fieldValue ? "text-[#0A1629]" : "text-[#7D8592]")}>
              {isUploading ? "Uploading..." : fieldValue ? getFileName(fieldValue) : placeholder}
            </span>
          </div>
          <img src="/icons/upload.svg" alt="" className="w-4 h-4 opacity-40" />
        </div>

        {fieldValue && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onchange({ target: { name, value: "" } });
            }}
            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-red-50 rounded-full text-red-500 transition-colors"
          >
            <img src="/icons/cancel.svg" alt="Remove" className="w-4 h-4" />
          </button>
        )}

        {errors?.[name] && touched?.[name] && (
          <span className="text-[10px] text-red-500 bg-white absolute left-10 px-3 -bottom-[6px] w-fit mx-auto">
            {errors?.[name]}
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={type === "image" ? "image/*" : "*"}
        disabled={disabled}
      />
    </div>
  );
};

export default FileUpload;
