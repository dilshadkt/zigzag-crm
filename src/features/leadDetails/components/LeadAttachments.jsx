import { useState, useRef, useCallback } from "react";
import { FiUploadCloud, FiX, FiFile } from "react-icons/fi";

const LeadAttachments = ({ attachments = [], onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileChange = useCallback((event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleUploadClick = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress (up to 90%, then wait for actual upload)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Call the onUpload callback if provided
      if (onUpload) {
        await onUpload(selectedFile);
        // Complete progress when upload succeeds
        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      // Reset after upload
      setTimeout(() => {
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileType = (fileName) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext)) return "PDF";
    if (["doc", "docx"].includes(ext)) return "DOC";
    if (["xls", "xlsx"].includes(ext)) return "XLS";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "IMG";
    return "FILE";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3f8cff] text-white text-sm font-semibold hover:bg-[#2f6bff] transition-colors"
        >
          <FiUploadCloud size={16} />
          Upload
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Upload Area - Always visible for drag and drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-6 p-6 border-2 border-dashed rounded-2xl transition-colors ${
          isDragOver
            ? "border-[#3f8cff] bg-[#e6efff]"
            : selectedFile
            ? "border-slate-200 bg-slate-50"
            : "border-transparent bg-transparent"
        }`}
        style={{
          minHeight: selectedFile || isDragOver ? "auto" : "0",
          padding: selectedFile || isDragOver ? "1.5rem" : "0",
          marginBottom: selectedFile || isDragOver ? "1.5rem" : "0",
          overflow: "hidden",
        }}
      >
        {selectedFile && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <FiFile size={20} className="text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)} •{" "}
                  {getFileType(selectedFile.name)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                disabled={isUploading}
              >
                <FiX size={16} />
              </button>
            </div>

            {isUploading && (
              <div>
                <div className="flex justify-between mb-2 text-xs font-semibold text-slate-500">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3f8cff] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {!isUploading && (
              <button
                onClick={handleUploadClick}
                className="w-full h-11 rounded-full bg-[#3f8cff] text-white text-sm font-semibold hover:bg-[#2f6bff] transition-colors"
              >
                Upload File
              </button>
            )}
          </div>
        )}

        {!selectedFile && isDragOver && (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#3f8cff]/10 text-[#3f8cff] flex items-center justify-center">
              <FiUploadCloud size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop files here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or click the Upload button above
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Attachments List */}
      <div className="space-y-4">
        {attachments.length === 0 && !selectedFile && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No attachments yet. Upload a file to get started.
          </div>
        )}
        {attachments.map((file, index) => (
          <div
            key={file.name || index}
            className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100"
          >
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600">
                {file.type}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {file.size} • {file.date}
                </p>
              </div>
            </div>
            <button className="text-sm font-semibold text-[#3f8cff] hover:text-[#2f6bff] transition-colors">
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadAttachments;
