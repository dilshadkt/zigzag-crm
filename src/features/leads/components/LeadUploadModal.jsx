import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiUploadCloud, FiX, FiDownload } from "react-icons/fi";
import SearchableDropdown from "../../../components/shared/dropdown/SearchableDropdown";

const ACCEPTED_TYPES = ".xlsx,.xls,.csv";

const LeadUploadModal = ({
  isOpen,
  onClose,
  projectOptions = [],
  projectId,
  onProjectChange,
  isProjectLocked = false,
  file,
  onFileSelect,
  onNext,
  isParsing = false,
  onDownloadTemplate,
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
    // allow picking the same file again after a reset
    event.target.value = "";
  };

  const selectedProject = projectOptions.find((option) => option.value === projectId);
  const canContinue = Boolean(projectId && file) && !isParsing;

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Upload Lead File
            </h2>
            <p className="text-sm text-slate-500">
              Choose the project these leads belong to, then add your Excel file.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Project <span className="text-red-500">*</span>
          </label>
          {isProjectLocked ? (
            <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
              {selectedProject?.label || "Current project"}
            </div>
          ) : (
            <SearchableDropdown
              options={projectOptions}
              value={projectId}
              onChange={onProjectChange}
              placeholder="Select a project"
            />
          )}
          <p className="text-xs text-slate-500 mt-1.5">
            Each project has its own lead form, so the columns are mapped to that project&apos;s fields.
          </p>
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
              Drop your file here
            </p>
            <p className="text-xs text-slate-500">Supported: XLSX, XLS, CSV</p>
          </div>
          <label className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 cursor-pointer hover:border-slate-300">
            Browse Files
            <input
              type="file"
              accept={ACCEPTED_TYPES}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {file && (
            <p className="text-xs font-medium text-slate-600 break-all">
              Selected: {file.name}
            </p>
          )}
        </div>

        {onDownloadTemplate && (
          <button
            type="button"
            onClick={onDownloadTemplate}
            disabled={!projectId}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#3f8cff] hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            <FiDownload size={14} />
            Download template for {selectedProject ? selectedProject.label : "the selected project"}
          </button>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={onNext}
            disabled={!canContinue}
            className="flex-1 h-11 rounded-full bg-[#3f8cff] text-white text-sm font-semibold disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isParsing ? "Reading file..." : "Next: Map Columns"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LeadUploadModal;
