import React, { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { studentApi } from "./studentClient";
import StudentAvatar from "./StudentAvatar";
import { Panel } from "./ui";

const OUTPUT_SIZE = 512;
const MAX_SOURCE_MB = 15;

/**
 * Crops the picture to a centred square and shrinks it before upload, so a
 * large phone photo becomes a small JPEG.
 */
const toSquareJpeg = (file) =>
  new Promise((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const img = new Image();
    const fail = () => {
      URL.revokeObjectURL(source);
      reject(new Error("This photo could not be read. Use a JPG or PNG image."));
    };
    img.onerror = fail;
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      if (!side) return fail();
      const size = Math.min(OUTPUT_SIZE, side);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      // transparent PNGs would otherwise turn black as JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(source);
      canvas.toBlob(
        (blob) => (blob ? resolve(new File([blob], "photo.jpg", { type: "image/jpeg" })) : reject(new Error("Could not prepare the photo"))),
        "image/jpeg",
        0.9
      );
    };
    img.src = source;
  });

const PhotoCard = ({ student }) => {
  const input = useRef(null);
  const queryClient = useQueryClient();
  // wait for the refreshed profile so the buttons stay busy until the picture changes
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["student-portal", "me"] });
  const upload = useMutation({
    mutationFn: async (file) => studentApi.uploadPhoto(await toSquareJpeg(file)),
    onSuccess: async () => {
      await refresh();
      toast.success("Profile photo updated");
    },
    onError: (error) => toast.error(error?.message || "Could not upload the photo"),
  });
  const remove = useMutation({
    mutationFn: studentApi.removePhoto,
    onSuccess: async () => {
      await refresh();
      toast.success("Profile photo removed");
    },
    onError: (error) => toast.error(error?.message || "Could not remove the photo"),
  });
  const busy = upload.isPending || remove.isPending;
  const hasPhoto = Boolean(student.photoUpdatedAt);

  const pick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // so the same file can be chosen again
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file");
    if (file.size > MAX_SOURCE_MB * 1024 * 1024) return toast.error(`Choose a photo smaller than ${MAX_SOURCE_MB} MB`);
    upload.mutate(file);
  };

  return (
    <Panel>
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <StudentAvatar student={student} className="w-32 h-32 rounded-full text-3xl ring-4 ring-[#ECF3FF]" />
          {busy && (
            <span className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center" role="status">
              <span className="w-6 h-6 border-2 border-slate-200 border-t-[#3F8CFF] rounded-full animate-spin" />
              <span className="sr-only">Saving photo</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#3F8CFF] text-white border-4 border-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-60"
            aria-label={hasPhoto ? "Change photo" : "Add photo"}
          >
            <FiCamera />
          </button>
        </div>
        <p className="mt-4 text-lg font-bold text-[#0A1629] break-words max-w-full">{student.name}</p>
        <p className="text-xs text-[#91929E]">{student.studentId}</p>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[14px] bg-[#3F8CFF] text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50"
          >
            <FiCamera /> {upload.isPending ? "Uploading…" : hasPhoto ? "Change photo" : "Add photo"}
          </button>
          {hasPhoto && (
            <button
              type="button"
              onClick={() => remove.mutate()}
              disabled={busy}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[14px] bg-[#F4F9FD] text-red-600 text-sm font-bold hover:bg-red-50 disabled:opacity-50"
            >
              <FiTrash2 /> Remove
            </button>
          )}
        </div>
        <p className="text-[11px] text-[#91929E] mt-3">JPG, PNG or WEBP. The picture is cropped to a square.</p>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="hidden" aria-label="Profile photo file" />
      </div>
    </Panel>
  );
};

export default PhotoCard;
