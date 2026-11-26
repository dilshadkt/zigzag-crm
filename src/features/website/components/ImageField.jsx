import React, { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { useWebsite } from "../context";
import { IMAGE_ACCEPT, uploadImage } from "../api/websiteApi";
import { errorMessage } from "../../accounts/utils/format";
import { btnSmall } from "../../accounts/components/ui";

const ImageField = ({ siteId, value, onChange, disabled, label }) => {
  const { uploadsReady } = useWebsite();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const blocked = disabled || !uploadsReady || busy;

  const take = async (file) => {
    if (!file || blocked) return;
    setBusy(true);
    try {
      onChange(await uploadImage(siteId, file));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!blocked) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files?.[0]);
        }}
        className={`flex flex-wrap items-center gap-4 rounded-xl border border-dashed p-3 ${
          over ? "border-[#3F8CFF] bg-[#ECF3FF]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="w-40 h-28 rounded-lg bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <a href={value} target="_blank" rel="noreferrer" className="block w-full h-full">
              <img src={value} alt={label} className="w-full h-full object-contain" />
            </a>
          ) : (
            <FiImage className="w-7 h-7 text-slate-300" />
          )}
        </div>
        {!disabled && (
          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-2">
              <button type="button" className={btnSmall} disabled={blocked} onClick={() => input.current?.click()}>
                <FiUploadCloud /> {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
              </button>
              {value && (
                <button type="button" className={btnSmall} disabled={busy} onClick={() => onChange("")}>
                  <FiTrash2 /> Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {uploadsReady
                ? "Drop an image here, or choose one. Up to 10 MB."
                : "Uploads are off until the S3 storage settings are added on the server."}
            </p>
          </div>
        )}
        <input ref={input} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => take(e.target.files?.[0])} />
      </div>
    </div>
  );
};

export default ImageField;
