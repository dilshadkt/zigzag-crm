import React from "react";
import PrimaryButton from "../buttons/primaryButton";
import clsx from "clsx";
import { formatDate } from "../../../config/formateDate";

const FileAttachments = ({ files, className, onRemove }) => {
  return (
    <div className="w-full  flex flex-col gap-y-2 ">
      {files?.length > 0 && (
        <h5 className="font-medium mt-2">Task Attachments ({files?.length})</h5>
      )}
      <div className={clsx(" ", className)}>
        {files?.map((file, index) => (
          <File key={index} file={file} handleRemove={() => onRemove(index)} />
        ))}
      </div>
    </div>
  );
};

export default FileAttachments;

const File = ({ file, handleRemove }) => {
  const isImage = file.type.startsWith("image");
  const isPDF = file.type === "application/pdf";
  return (
    <div className="h-36  relative rounded-xl bg-[#2155A3]/20 overflow-hidden">
      {isImage ? (
        <img
          src={file.preview}
          alt={file.title}
          className="w-full h-full object-cover opacity-80"
        />
      ) : isPDF ? (
        <div className="w-full h-full flex items-center justify-center bg-red-50">
          <span className="text-red-500 text-xs font-medium">PDF</span>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <span className="text-gray-500 text-xs font-medium">File</span>
        </div>
      )}

      <div
        className="absolute left-0 right-0  flex rounded-xl bottom-0 py-2 px-3
         bg-white z-30 border border-gray-300 flex-col"
      >
        <span className="text-xs font-medium">
          {file.title?.slice(0, 20)}
          {file.title?.length > 20 && `...`}
        </span>
        <span className="text-xs text-[#91929E]">
          {formatDate(file?.dateTime)}
        </span>
      </div>
      <PrimaryButton
        icon={"/icons/cancel.svg"}
        className={"absolute top-1 right-1 z-40 bg-[#6D5DD3]/20"}
        onclick={handleRemove}
      />
    </div>
  );
};
