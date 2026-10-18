import React, { useState, useEffect, useMemo } from "react";
import Modal from "../modal";
import VoiceRecorder from "../VoiceRecorder";
import { uploadSingleFile } from "../../../api/service";
import { useGetReworkCandidates } from "../../../api/hooks";
import {
  FiMic,
  FiTrash2,
  FiPlay,
  FiSquare,
  FiPaperclip,
  FiLink,
  FiFileText,
  FiPlus,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const NO_FAULT = "__none__";

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const defaultDueDate = (subtask) => {
  const existing = toDateInput(subtask?.dueDate);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (existing && existing >= todayStr) return existing;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
};

const personId = (value) => (value?._id || value || "").toString();

const personLabel = (person) => {
  if (!person) return "Unknown";
  const name = `${person.firstName || ""} ${person.lastName || ""}`.trim();
  return name || person.position || "Unknown";
};

const ReworkReasonModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  source = "internal",
  originSubTask,
  siblingSubtasks = [],
  parentTaskId,
}) => {
  const [reason, setReason] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState(null);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dueDates, setDueDates] = useState({});
  const [faultUserId, setFaultUserId] = useState(NO_FAULT);
  const [attachments, setAttachments] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const fileInputRef = React.useRef(null);

  const originId = personId(originSubTask);
  const subtasks = useMemo(() => {
    if (siblingSubtasks?.length) return siblingSubtasks;
    return originSubTask ? [originSubTask] : [];
  }, [siblingSubtasks, originSubTask]);

  const { data: candidateData } = useGetReworkCandidates(
    parentTaskId || originSubTask?.parentTask,
    originId,
    source,
    isOpen
  );

  const candidates = candidateData?.candidates || [];
  const defaultFaultId = candidateData?.defaultFault?.userId
    ? String(candidateData.defaultFault.userId)
    : NO_FAULT;

  useEffect(() => {
    if (!isOpen) return;
    setReason("");
    setVoiceNoteUrl(null);
    setShowVoiceRecorder(false);
    setAttachments([]);
    setLinkInput("");
    const origin = originId || personId(subtasks[0]);
    setSelectedIds(origin ? [origin] : []);
    const nextDates = {};
    subtasks.forEach((st) => {
      nextDates[personId(st)] = defaultDueDate(st);
    });
    setDueDates(nextDates);
    setFaultUserId(NO_FAULT);
  }, [isOpen, originId, subtasks]);

  useEffect(() => {
    if (!isOpen) return;
    if (defaultFaultId && defaultFaultId !== NO_FAULT) {
      setFaultUserId(defaultFaultId);
    }
  }, [isOpen, defaultFaultId]);

  const toggleSubtask = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim() && !voiceNoteUrl) return;
    if (selectedIds.length === 0) {
      toast.error("Select at least one subtask to send back");
      return;
    }
    const missingDate = selectedIds.some((id) => !dueDates[id]);
    if (missingDate) {
      toast.error("Set a new deadline for every selected subtask");
      return;
    }

    onSubmit({
      source,
      originSubTaskId: originId,
      reason,
      voiceNoteUrl,
      attachments: source === "client" ? attachments : [],
      faultUserId: faultUserId === NO_FAULT ? null : faultUserId,
      items: selectedIds.map((id) => ({
        subTaskId: id,
        newDueDate: dueDates[id],
      })),
    });
  };

  const handleVoiceUpload = async (file) => {
    if (!file) return;
    setIsUploadingVoice(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadSingleFile(formData);
      if (response.success) {
        setVoiceNoteUrl(response.fileUrl || response.url);
        toast.success("Voice note attached");
      } else {
        toast.error("Failed to upload voice note");
      }
    } catch (error) {
      console.error("Voice upload error", error);
      toast.error("Failed to upload voice note");
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const handleFilesPicked = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setIsUploadingFile(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await uploadSingleFile(formData);
        const url = response?.success ? response.fileUrl || response.url : null;
        if (url) {
          setAttachments((prev) => [...prev, { url, name: file.name, kind: "file" }]);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    } catch (error) {
      console.error("Attachment upload error", error);
      toast.error("Failed to upload attachment");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleAddLink = () => {
    const value = linkInput.trim();
    if (!value) return;
    const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid link");
      return;
    }
    setAttachments((prev) => [...prev, { url, name: value, kind: "link" }]);
    setLinkInput("");
  };

  const removeAttachment = (index) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => setIsPlaying(false);

  const title =
    source === "client" ? "Client rejection" : "Send back for rework";

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm:max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs text-gray-500">
            Tick every subtask that must be redone, give each a new deadline, and
            name who caused it. The people doing the work keep the points they
            already earned.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtasks to send back
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {subtasks.map((st) => {
                const id = personId(st);
                const checked = selectedIds.includes(id);
                const assignees = (st.assignedTo || [])
                  .map((person) => personLabel(person))
                  .join(", ");
                return (
                  <label
                    key={id}
                    className={`flex flex-col gap-2 rounded-xl border p-3 ${
                      checked
                        ? "border-blue-200 bg-blue-50/50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSubtask(id)}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {st.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {assignees || "Unassigned"} · {st.status}
                        </p>
                      </div>
                    </div>
                    {checked && (
                      <div className="pl-6">
                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                          New deadline
                        </label>
                        <input
                          type="date"
                          required
                          value={dueDates[id] || ""}
                          onChange={(e) =>
                            setDueDates((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Whose mistake is this?
            </label>
            <select
              value={faultUserId}
              onChange={(e) => setFaultUserId(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value={NO_FAULT}>No one at fault</option>
              {candidates.map((person) => (
                <option key={person._id} value={person._id}>
                  {personLabel(person)}
                  {person.position ? ` · ${person.position}` : ""}
                  {person.scorable === false ? " (admin, not scored)" : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500">
              {source === "client"
                ? "Defaults to the person who approved this internally. Change it if the real cause is someone else, such as the content writer."
                : "Defaults to the assignee of this subtask. Change it if the work is being redone because of someone else."}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please describe why this needs rework:
            </label>
            <textarea
              autoFocus
              required={!voiceNoteUrl}
              className="w-full h-28 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
              placeholder="E.g., Copy needs a rewrite, so design must follow the new content."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div
            className={
              source === "client"
                ? "rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4"
                : ""
            }
          >
            {source === "client" && (
              <div>
                <h3 className="text-sm font-semibold text-indigo-900">
                  Client feedback
                </h3>
                <p className="text-[11px] text-indigo-700/70">
                  Add what the client sent: their voice note and any reference
                  files or links.
                </p>
              </div>
            )}

            <div>
            {source === "client" && (
              <p className="mb-2 text-xs font-medium text-gray-700">
                Client voice note
              </p>
            )}
            {voiceNoteUrl ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <button
                  type="button"
                  onClick={togglePlay}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPlaying ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
                  }`}
                >
                  {isPlaying ? (
                    <FiSquare className="w-4 h-4 fill-current" />
                  ) : (
                    <FiPlay className="w-4 h-4 fill-current ml-1" />
                  )}
                </button>
                <div className="flex-1 text-sm font-medium text-blue-900">
                  Voice Note Attached
                  <audio
                    ref={audioRef}
                    src={voiceNoteUrl}
                    onEnded={handleAudioEnded}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    className="hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceNoteUrl(null)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <FiTrash2 />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowVoiceRecorder(true)}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                  <FiMic className="w-4 h-4" />
                </div>
                {isUploadingVoice ? "Uploading Voice Note..." : "Add Voice Note"}
              </button>
            )}
            </div>

            {source === "client" && (
              <div>
                <p className="mb-2 text-xs font-medium text-gray-700">
                  Reference attachments
                </p>

                {attachments.length > 0 && (
                  <ul className="mb-2 space-y-1.5">
                    {attachments.map((item, index) => (
                      <li
                        key={`${item.url}-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                      >
                        {item.kind === "link" ? (
                          <FiLink className="h-4 w-4 shrink-0 text-indigo-500" />
                        ) : (
                          <FiFileText className="h-4 w-4 shrink-0 text-indigo-500" />
                        )}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 flex-1 truncate text-xs text-gray-700 hover:text-blue-600"
                        >
                          {item.name || item.url}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="rounded-full p-1.5 text-red-500 hover:bg-red-50"
                          aria-label="Remove attachment"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFilesPicked}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingFile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-500 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-60"
                >
                  <FiPaperclip className="h-4 w-4" />
                  {isUploadingFile ? "Uploading..." : "Attach files (images, PDFs, docs)"}
                </button>

                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                    placeholder="Paste a reference link"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    disabled={!linkInput.trim()}
                    className="flex items-center gap-1 rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <FiPlus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                (!reason.trim() && !voiceNoteUrl) ||
                isLoading ||
                isUploadingVoice ||
                isUploadingFile ||
                selectedIds.length === 0
              }
              className={`px-6 h-10 rounded-xl text-sm font-medium transition-all duration-200 
                ${
                  (!reason.trim() && !voiceNoteUrl) ||
                  isLoading ||
                  isUploadingVoice ||
                isUploadingFile ||
                  selectedIds.length === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#3F8CFF] text-white hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-95"
                }`}
            >
              {isLoading ? "Updating..." : "Confirm Rework"}
            </button>
          </div>
        </form>
      </Modal>

      <VoiceRecorder
        isOpen={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onUpload={handleVoiceUpload}
        isUploading={isUploadingVoice}
      />
    </>
  );
};

export default ReworkReasonModal;
