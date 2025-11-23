import { useRef, useState } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";

const LeadUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  file,
  onFileSelect,
  uploadProgress,
  isUploading,
}) => {
  const dropRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    if (event.target === dropRef.current) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Upload Lead File
            </h2>
            <p className="text-sm text-slate-500">
              Drag and drop files here, or click to browse.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <FiX size={18} />
          </button>
        </div>

        <div
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center space-y-4 transition-colors ${
            isDragActive ? "border-[#3f8cff] bg-[#3f8cff]/5" : "border-slate-200"
          }`}
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-[#3f8cff]/10 text-[#3f8cff] flex items-center justify-center">
            <FiUploadCloud size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Drop your files here
            </p>
            <p className="text-xs text-slate-500">Supported: PDF, DOCX, CSV</p>
          </div>
          <label className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 cursor-pointer hover:border-slate-300">
            Browse Files
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
          {file && (
            <p className="text-xs font-medium text-slate-600">
              Selected: {file.name}
            </p>
          )}
        </div>

        {isUploading && (
          <div>
            <div className="flex justify-between mb-2 text-xs font-semibold text-slate-500">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3f8cff] transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={!file || isUploading}
            className="flex-1 h-11 rounded-full bg-[#3f8cff] text-white text-sm font-semibold disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadUploadModal;

