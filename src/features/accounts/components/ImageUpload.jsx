import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiImage, FiX } from "react-icons/fi";
import { uploadSingleFile } from "../../../api/service";
import { btnSmall } from "./ui";

/** Small uploader with a preview. Calls onChange(url), or onChange("") when removed. */
const ImageUpload = ({ label, value, onChange, hint }) => {
  const [busy, setBusy] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG, SVG or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("That image is over 5 MB. Please use a smaller one.");
      return;
    }
    setBusy(true);
    const data = new FormData();
    data.append("file", file);
    const res = await uploadSingleFile(data);
    setBusy(false);
    if (!res.success || !res.fileUrl) {
      toast.error("Could not upload the image");
      return;
    }
    onChange(res.fileUrl);
  };

  return (
    <div>
      {label && <span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>}
      <div className="flex items-center gap-3">
        <div className="w-24 h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
          {value ? <img src={value} alt="" className="max-w-full max-h-full object-contain" /> : <FiImage className="text-slate-300" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={`${btnSmall} cursor-pointer`}>
            {busy ? "Uploading…" : value ? "Replace" : "Upload logo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {value && (
            <button type="button" className={btnSmall} onClick={() => onChange("")}>
              <FiX /> Remove
            </button>
          )}
        </div>
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
};

export default ImageUpload;
