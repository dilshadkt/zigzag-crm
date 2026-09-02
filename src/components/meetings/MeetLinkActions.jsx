import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiCheck, FiCopy, FiExternalLink, FiShare2 } from "react-icons/fi";

const formatRange = (startAt, endAt) => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime())) return "";
  const dateLabel = start.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeLabel = Number.isNaN(end.getTime())
    ? start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : `${start.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })} – ${end.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
  return `${dateLabel} · ${timeLabel}`;
};

export const meetingShareText = (meeting) => {
  const when = formatRange(meeting?.startAt, meeting?.endAt);
  return [meeting?.title, when, meeting?.meetLink].filter(Boolean).join("\n");
};

export const copyText = async (value, successMessage) => {
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage || "Copied");
    return true;
  } catch {
    toast.error("Could not copy");
    return false;
  }
};

export const shareMeetingLink = async (meeting) => {
  if (!meeting?.meetLink) return;
  const text = meetingShareText(meeting);
  if (navigator.share) {
    try {
      await navigator.share({
        title: meeting.title || "Meeting",
        text,
        url: meeting.meetLink,
      });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  await copyText(text, "Meeting details copied");
};

const MeetLinkActions = ({ meeting, showJoin = true }) => {
  const [copied, setCopied] = useState(false);
  const link = meeting?.meetLink;
  if (!link) return null;

  const handleCopy = async () => {
    const ok = await copyText(link, "Meet link copied");
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {showJoin && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#3F8CFF] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
        >
          Join Google Meet <FiExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#F4F9FD] px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50"
      >
        {copied ? <FiCheck className="h-3.5 w-3.5 text-emerald-500" /> : <FiCopy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={() => shareMeetingLink(meeting)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#F4F9FD] px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50"
      >
        <FiShare2 className="h-3.5 w-3.5" />
        Share
      </button>
    </div>
  );
};

export default MeetLinkActions;
