import React, { useState } from "react";
import PrimaryButton from "../buttons/primaryButton";
import clsx from "clsx";
import { formatDate } from "../../../config/formateDate";

const FileAttachments = ({ files, className, onRemove, disable }) => {
  return (
    <div className="w-full  flex flex-col gap-y-2 ">
      {files?.length > 0 && (
        <h5 className="font-medium mt-2">Task Attachments ({files?.length})</h5>
      )}
      <div className={clsx(" ", className)}>
        {files?.map((file, index) => (
          <File
            key={index}
            disable={disable}
            file={file}
            handleRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FileAttachments;

const File = ({ file, handleRemove, disable }) => {
  const [showModal, setShowModal] = useState(false);
  const isImage = file.type.startsWith("image");
  const isPDF = file.type === "application/pdf";

  const handleFileClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const renderFilePreview = () => {
    if (isImage) {
      return (
        <img
          src={file.preview}
          alt={file.title}
          className="max-w-full max-h-[70vh] object-contain"
        />
      );
    } else if (isPDF) {
      return (
        <iframe
          src={file.preview}
          className="w-full h-[70vh]"
          title={file.title}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium">{file.title}</p>
          <p className="text-sm text-gray-500 mt-2">
            {formatDate(file?.dateTime)}
          </p>
          <a
            href={file.preview}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Download File
          </a>
        </div>
      );
    }
  };

  return (
    <>
      <div 
        className="h-36 relative rounded-xl bg-[#2155A3]/20 overflow-hidden cursor-pointer"
        onClick={handleFileClick}
      >
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
          disable={disable}
          icon={"/icons/cancel.svg"}
          className={"absolute top-1 right-1 z-40 bg-[#6D5DD3]/20"}
          onclick={handleRemove}
        />
      </div>

      {/* Modal for all file types */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/40 bg-opacity-75 
          flex items-center justify-center z-[1000]"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">{file.title}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center items-center">
              {renderFilePreview()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
