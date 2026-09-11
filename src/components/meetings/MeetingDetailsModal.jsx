import React from "react";
import { toast } from "react-hot-toast";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiMail,
  FiUsers,
  FiVideo,
} from "react-icons/fi";
import Modal from "../shared/modal";
import MeetLinkActions from "./MeetLinkActions";
import MeetingTrackItems from "./MeetingTrackItems";

const personName = (person) =>
  `${person?.firstName || ""} ${person?.lastName || ""}`.trim() ||
  person?.name ||
  "Employee";

const formatRange = (startAt, endAt) => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const dateLabel = start.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeLabel = `${start.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  return { dateLabel, timeLabel };
};

const statusMeta = (meeting) => {
  if (meeting.status === "cancelled") {
    return { label: "Cancelled", className: "bg-gray-100 text-gray-500" };
  }
  if (meeting.status === "completed") {
    return { label: "Attendance reported", className: "bg-emerald-50 text-emerald-700" };
  }
  if (new Date(meeting.endAt) < new Date()) {
    return { label: "Awaiting report", className: "bg-amber-50 text-amber-700" };
  }
  return { label: "Scheduled", className: "bg-blue-50 text-blue-700" };
};

const MeetingDetailsModal = ({
  isOpen,
  meeting,
  employees = [],
  currentUserId,
  canManage,
  canReport,
  isSavingItems,
  isGeneratingLink,
  onClose,
  onEdit,
  onCancel,
  onReport,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onGenerateLink,
}) => {
  if (!meeting) return null;

  const meta = statusMeta(meeting);
  const { dateLabel, timeLabel } = formatRange(meeting.startAt, meeting.endAt);
  const people =
    meeting.status === "completed" ? meeting.attendees || [] : meeting.invitees || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meeting.title || "Meeting"}
      maxWidth="sm:max-w-2xl"
    >
      <div className="space-y-5 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${meta.className}`}>
            {meta.label}
          </span>
          {meeting.pointsPerAttendee > 0 && meeting.status === "completed" && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600">
              +{meeting.pointsPerAttendee} pts
            </span>
          )}
        </div>

        {meeting.description ? (
          <p className="text-sm leading-relaxed text-[#7D8592]">{meeting.description}</p>
        ) : null}

        <div className="flex flex-wrap gap-3 text-sm text-[#7D8592]">
          <span className="inline-flex items-center gap-1.5">
            <FiCalendar className="h-4 w-4" /> {dateLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiClock className="h-4 w-4" /> {timeLabel}
          </span>
        </div>

        {meeting.meetLink ? (
          <MeetLinkActions meeting={meeting} />
        ) : canManage && meeting.status !== "cancelled" ? (
          <button
            type="button"
            onClick={() =>
              onGenerateLink(meeting._id, {
                onSuccess: (res) => {
                  if (res?.meeting?.meetLink) toast.success("Meet link created");
                  else if (res?.meetLinkWarning) toast(res.meetLinkWarning);
                  else toast.error("Could not create a Meet link");
                },
                onError: (error) =>
                  toast.error(error?.message || "Could not create a Meet link"),
              })
            }
            disabled={isGeneratingLink}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3F8CFF] hover:underline disabled:opacity-50"
          >
            <FiVideo className="h-4 w-4" />
            Create Meet link
          </button>
        ) : (
          <p className="text-xs text-gray-400">No Meet link added.</p>
        )}

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">
            <FiUsers className="h-3.5 w-3.5" />
            {meeting.status === "completed" ? "Attended" : "Invited"}
          </p>
          <div className="flex flex-wrap gap-2">
            {people.map((person) => (
              <span
                key={person._id}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F9FD] px-2.5 py-1 text-xs font-medium text-gray-700"
              >
                {meeting.status === "completed" && (
                  <FiCheck className="h-3 w-3 text-emerald-500" />
                )}
                {personName(person)}
              </span>
            ))}
            {(meeting.guestEmails || []).map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-2.5 py-1 text-xs font-medium text-[#3F8CFF]"
              >
                <FiMail className="h-3 w-3" />
                {email}
              </span>
            ))}
            {meeting.status === "completed" && people.length === 0 && (
              <span className="text-xs text-gray-400">Nobody was marked present.</span>
            )}
            {meeting.status !== "completed" && people.length === 0 && !(meeting.guestEmails || []).length && (
              <span className="text-xs text-gray-400">No invitees yet.</span>
            )}
          </div>
        </div>

        <MeetingTrackItems
          meeting={meeting}
          employees={employees}
          canAdd={meeting.status !== "cancelled"}
          currentUserId={currentUserId}
          isSaving={isSavingItems}
          onAdd={(data) => onAddItem(meeting, data)}
          onToggle={(item, status) => onToggleItem(meeting, item, status)}
          onDelete={(item) => onDeleteItem(meeting, item)}
        />

        {canManage && meeting.status === "scheduled" && (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            {canReport && (
              <button
                type="button"
                onClick={onReport}
                className="rounded-xl bg-[#3F8CFF] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
              >
                Report attendance
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl bg-[#F4F9FD] px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MeetingDetailsModal;
