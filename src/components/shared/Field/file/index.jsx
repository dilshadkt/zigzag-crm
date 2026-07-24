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
        // Clear the file input so the same file can be selected again if needed
        if (e.target) e.target.value = null;
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
        {!fieldValue ? (
          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current.click()}
            className={clsx(
              "rounded-[14px] text-sm border-2 border-[#D8E0F0]/80 py-[10px] px-4 min-h-[46px] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors",
              errors?.[name] && touched?.[name] && "border-red-400/50",
              (disabled || isUploading) && "cursor-not-allowed opacity-60"
            )}
          >
            <div className="flex items-center gap-x-3 truncate">
              <img src={type === "image" ? "/icons/profile.svg" : "/icons/file.svg"} alt="" className="w-5 h-5 opacity-50" />
              <span className={clsx("truncate", "text-[#7D8592]")}>
                {isUploading ? "Uploading..." : placeholder}
              </span>
            </div>
            <img src="/icons/upload.svg" alt="" className="w-4 h-4 opacity-40" />
          </div>
        ) : (
          <div className={clsx(
            "rounded-[14px] overflow-hidden border-2 border-[#D8E0F0]/80 relative group",
            type === "image" ? "h-32 w-full" : "p-3 min-h-[60px] flex items-center bg-gray-50"
          )}>
            {type === "image" ? (
              <img src={fieldValue} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center gap-x-3 w-full pr-36">
                <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                  <img src="/icons/file.svg" alt="File" className="w-6 h-6 opacity-70" />
                </div>
                <span className="truncate text-sm font-medium text-[#0A1629]" title={getFileName(fieldValue)}>
                  {getFileName(fieldValue)}
                </span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className={clsx(
              "flex items-center gap-2",
              type === "image" 
                ? "absolute inset-0 bg-black/40 justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                : "absolute right-3 top-1/2 -translate-y-1/2"
            )}>
              {!disabled && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current.click();
                    }}
                    className={clsx(
                      "text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer",
                      type === "image" ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-white text-blue-600 border border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onchange({ target: { name, value: "" } });
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className={clsx(
                      "text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer",
                      type === "image" ? "bg-white text-red-500 hover:bg-red-50" : "bg-white text-red-500 border border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
            
            {/* Uploading state over preview */}
            {isUploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm z-10">
                <span className="text-sm font-semibold text-blue-600 animate-pulse">Uploading...</span>
              </div>
            )}
          </div>
        )}

        {errors?.[name] && touched?.[name] && (
          <span className="text-[10px] text-red-500 bg-white absolute left-10 px-3 -bottom-[6px] w-fit mx-auto z-20">
            {errors?.[name]}
          </span>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={type === "image" ? "image/*" : undefined}
        disabled={disabled}
      />
    </div>
  );
};

export default FileUpload;
