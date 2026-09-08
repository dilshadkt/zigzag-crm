import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiMic } from "react-icons/fi";
import Description from "../Field/description";
import VoiceRecorder from "../VoiceRecorder";
import { uploadSingleFile } from "../../../api/service";
import { getVoiceUrls } from "../../../utils/categoryFields";

const baseInputClass =
  "w-full rounded-[14px] border-2 border-[#D8E0F0]/80 px-4 py-[10px] text-sm text-[#7D8592] outline-none focus:border-blue-300 transition-all";

/**
 * Inputs for the field definitions configured on a task category
 * (Settings → Master → Task Categories).
 */
const CategoryFieldInputs = ({ fields = [], onChange, disabled = false }) => {
  const [recordingKey, setRecordingKey] = useState(null);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);

  if (!fields.length) return null;

  const handleVoiceUpload = async (file) => {
    if (!file || !recordingKey) return;
    setIsUploadingVoice(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadSingleFile(formData);
      const url = response.fileUrl || response.url;
      if (!response.success || !url) {
        toast.error("Failed to upload voice note");
        return;
      }
      const next = [...getVoiceUrls(fields.find((field) => field.key === recordingKey)?.value), url];
      onChange(recordingKey, next);
      setRecordingKey(null);
      toast.success("Voice note added");
    } catch (error) {
      console.error("Category field voice upload error:", error);
      toast.error("Failed to upload voice note");
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const removeVoice = (key, urlToRemove) => {
    onChange(
      key,
      getVoiceUrls(fields.find((field) => field.key === key)?.value).filter(
        (url) => url !== urlToRemove
      )
    );
  };

  const renderInput = (field) => {
    const value = field.value ?? "";
    const handle = (event) => onChange(field.key, event.target.value);

    if (field.type === "voice") {
      const urls = getVoiceUrls(value);
      return (
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-gray-500">
              Record a voice note for this field.
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setRecordingKey(field.key)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              <FiMic className="w-3 h-3" />
              Record Voice
            </button>
          </div>
          {urls.length > 0 ? (
            <div className="space-y-1.5">
              {urls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white p-2"
                >
                  <audio src={url} controls className="h-8 flex-1 min-w-0" />
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeVoice(field.key, url)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-gray-400">No voice notes yet</p>
          )}
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <Description
          title=""
          placeholder={field.placeholder || `Enter ${field.label}`}
          name={field.key}
          value={typeof value === "string" ? value : ""}
          onChange={handle}
          disabled={disabled}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          className={baseInputClass}
          value={value}
          onChange={handle}
          disabled={disabled}
        >
          <option value="">Select {field.label}</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type === "number" || field.type === "date" || field.type === "url" ? field.type : "text"}
        className={baseInputClass}
        value={value}
        onChange={handle}
        placeholder={field.placeholder || `Enter ${field.label}`}
        disabled={disabled}
      />
    );
  };

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-y-[7px]">
          <label className="flex items-center gap-2 pl-[6px] text-sm font-bold text-[#7D8592]">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
            {field.showInDescription && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
                Shows in task description
              </span>
            )}
          </label>
          {renderInput(field)}
        </div>
      ))}
      <VoiceRecorder
        isOpen={Boolean(recordingKey)}
        onClose={() => setRecordingKey(null)}
        onUpload={handleVoiceUpload}
        isUploading={isUploadingVoice}
      />
    </div>
  );
};

export default CategoryFieldInputs;
