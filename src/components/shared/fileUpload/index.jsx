import React, { useState, useRef, useEffect } from "react";
import PrimaryButton from "../buttons/primaryButton";
import FileAttachments from "../FileAttachement";
import LinkAttachement from "../LinkAttachement";

const FileAndLinkUpload = ({
  fileClassName,
  onChange,
  initialFiles,
  initialLinks,
  disable = false,
}) => {
  const [files, setFiles] = useState(initialFiles || []);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [link, setLink] = useState("");
  const [links, setLinks] = useState(initialLinks || []);
  const fileInputRef = useRef(null);
  const linkInputRef = useRef(null);

  useEffect(() => {
    const handleClose = (e) => {
      if (linkInputRef.current && !linkInputRef.current.contains(e.target)) {
        setShowLinkInput(false);
      }
    };
    document.addEventListener("mousedown", handleClose);
    return () => {
      document.removeEventListener("mousedown", handleClose);
    };
  }, []);

  const getFileType = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "doc";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "other";
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: getFileType(file),
      title: file.name,
      dateTime: new Date().toISOString(),
      timestamp: new Date(),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleLinkSubmit = () => {
    if (link.trim()) {
      const newLink = {
        preview: link.trim(),
        title: link.trim(),
        type: "link",
        dateTime: new Date().toISOString(),
      };
      setLinks((prev) => [...prev, newLink]);
      setLink("");
      setShowLinkInput(false);
    }
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // Combine files and links into the desired schema
  useEffect(() => {
    const attachements = [
      ...files?.map((file) => ({
        file: file.file,
        preview: file.preview, // Use the preview URL for files
        title: file.title,
        type: file.type,
        dateTime: file.dateTime,
      })),
      ...links,
    ];
    if (onChange) {
      onChange(attachements);
    }
  }, [files, links, onChange]);

  return (
    <div className="w-full  flex flex-col gap-y-3 max-w-2xl mx-auto">
      {/* File previews */}
      <FileAttachments
        files={files}
        className={fileClassName}
        onRemove={removeFile}
      />
      {/* Link previews   */}
      <LinkAttachement
        disable={disable}
        links={links}
        removeLink={removeLink}
      />

      {/* Link input form */}
      {showLinkInput && (
        <div className="mb-4">
          <div ref={linkInputRef} className="flex gap-2">
            <input
              type="url"
              value={link}
              required
              onChange={(e) => setLink(e.target.value)}
              placeholder="Enter URL"
              className="rounded-[14px] text-sm  border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4
          outline-none focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={handleLinkSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer
               hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex  gap-4 ">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*,application/pdf"
        />

        <PrimaryButton
          disable
          icon={"/icons/file.svg"}
          onclick={() => fileInputRef.current.click()}
          className={"bg-[#6D5DD3]/10"}
        />
        <PrimaryButton
          disable
          icon={"/icons/link.svg"}
          onclick={() => setShowLinkInput((prev) => !prev)}
          className={"bg-[#15C0E6]/10"}
        />
      </div>
    </div>
  );
};

export default FileAndLinkUpload;
