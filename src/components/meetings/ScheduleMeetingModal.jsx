import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiLink, FiPlus, FiUsers, FiVideo, FiX } from "react-icons/fi";
import MultiSelect from "../shared/Field/multiSelect";
import Modal from "../shared/modal";
import PrimaryButton from "../shared/buttons/primaryButton";
import MeetLinkActions from "./MeetLinkActions";

const toDateValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toTimeValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const combineDateTime = (date, time) => {
  if (!date || !time) return "";
  return new Date(`${date}T${time}`).toISOString();
};

const ScheduleMeetingModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  employees = [],
  meeting = null,
  googleStatus = null,
  isAdmin = false,
  onConnectGoogle,
  isConnectingGoogle = false,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [createMeetLink, setCreateMeetLink] = useState(true);
  const [showPasteLink, setShowPasteLink] = useState(false);
  const [invitees, setInvitees] = useState([]);

  React.useEffect(() => {
    if (!isOpen) return;
    setTitle(meeting?.title || "");
    setDescription(meeting?.description || "");
    setDate(toDateValue(meeting?.startAt) || toDateValue(new Date()));
    setStartTime(toTimeValue(meeting?.startAt) || "10:00");
    setEndTime(toTimeValue(meeting?.endAt) || "11:00");
    setMeetLink(meeting?.meetLink || "");
    setCreateMeetLink(true);
    setShowPasteLink(Boolean(meeting?.meetLink) && !meeting?.meetLinkGenerated);
    setInvitees(
      (meeting?.invitees || []).map((person) => person._id || person).filter(Boolean)
    );
  }, [isOpen, meeting]);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        label: employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        value: employee._id,
      })),
    [employees]
  );

  const handleChangeInvitees = (event) => {
    setInvitees(event.target.value || []);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Add a meeting title");
      return;
    }
    if (!date || !startTime || !endTime) {
      toast.error("Set the meeting date and time");
      return;
    }
    if (invitees.length === 0) {
      toast.error("Select who should attend");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      startAt: combineDateTime(date, startTime),
      endAt: combineDateTime(date, endTime),
      meetLink: meetLink.trim(),
      createMeetLink,
      invitees,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meeting ? "Edit meeting" : "Schedule meeting"}
      maxWidth="sm:max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block pl-1 text-sm font-bold text-[#7D8592]">
            Meeting title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Weekly standup"
            className="w-full rounded-[14px] border-2 border-[#D8E0F0]/80 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-sm font-bold text-[#7D8592]">
            Notes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agenda or context for the team"
            rows={3}
            className="w-full rounded-[14px] border-2 border-[#D8E0F0]/80 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block pl-1 text-sm font-bold text-[#7D8592]">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-[14px] border-2 border-[#D8E0F0]/80 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block pl-1 text-sm font-bold text-[#7D8592]">
              Start
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-[14px] border-2 border-[#D8E0F0]/80 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block pl-1 text-sm font-bold text-[#7D8592]">
              End
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-[14px] border-2 border-[#D8E0F0]/80 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center justify-between pl-1 text-sm font-bold text-[#7D8592]">
            <span>Google Meet</span>
            {meeting?.meetLink ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                Link ready
              </span>
            ) : null}
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border-2 border-[#D8E0F0]/80 bg-[#F4F9FD] px-3 py-3">
            <input
              type="checkbox"
              checked={createMeetLink}
              onChange={(event) => setCreateMeetLink(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-[#3F8CFF]"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0A1629]">
                Create Meet link automatically
              </p>
              <p className="mt-0.5 text-xs text-[#7D8592]">
                {meeting?.meetLink
                  ? "Keep the current link, or leave this on to create one if it is missing."
                  : googleStatus?.connected
                    ? `A Google Meet link will be created with ${googleStatus.email || "the connected Google account"}.`
                    : "Connect Google Calendar so a Meet link is created when you schedule."}
              </p>
            </div>
          </label>

          {createMeetLink && !googleStatus?.connected && !meeting?.meetLink && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
              <p className="text-xs text-amber-700">
                Google Calendar is not connected yet. You can still schedule, then add a link later.
              </p>
              {isAdmin && onConnectGoogle && (
                <button
                  type="button"
                  onClick={onConnectGoogle}
                  disabled={isConnectingGoogle}
                  className="shrink-0 text-xs font-semibold text-[#3F8CFF] hover:underline disabled:opacity-50"
                >
                  {isConnectingGoogle ? "Connecting..." : "Connect Google"}
                </button>
              )}
            </div>
          )}

          {meeting?.meetLink ? (
            <MeetLinkActions meeting={{ ...meeting, meetLink }} />
          ) : null}

          {(showPasteLink || !createMeetLink) && (
            <div className="relative mt-2">
              <FiLink className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-[14px] border-2 border-[#D8E0F0]/80 py-2.5 pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-blue-400"
              />
            </div>
          )}

          {!showPasteLink && createMeetLink && (
            <button
              type="button"
              onClick={() => setShowPasteLink(true)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#3F8CFF]"
            >
              <FiVideo className="h-3.5 w-3.5" />
              Paste a Meet link instead
            </button>
          )}
        </div>

        <MultiSelect
          title="Who should attend"
          name="invitees"
          value={invitees}
          onChange={handleChangeInvitees}
          options={employeeOptions}
          placeholder="Select employees"
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <PrimaryButton
            type="submit"
            title={meeting ? "Save changes" : "Schedule meeting"}
            loading={isSaving}
            disable={isSaving}
            icon={<FiPlus className="h-4 w-4" />}
          />
        </div>
      </form>
    </Modal>
  );
};

export const ReportAttendanceModal = ({
  isOpen,
  onClose,
  meeting,
  onSubmit,
  isSaving,
}) => {
  const invitees = meeting?.invitees || [];
  const [selected, setSelected] = useState([]);

  React.useEffect(() => {
    if (!isOpen) return;
    const existing = (meeting?.attendees || []).map((person) => person._id || person);
    setSelected(existing.length ? existing.map(String) : invitees.map((person) => String(person._id || person)));
  }, [isOpen, meeting]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const personName = (person) =>
    `${person.firstName || ""} ${person.lastName || ""}`.trim() || "Employee";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Who attended?"
      maxWidth="sm:max-w-lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Mark the people from this meeting list who attended. Only they will receive meeting points.
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Invite list
          </p>
          <button
            type="button"
            onClick={() =>
              setSelected(
                selected.length === invitees.length
                  ? []
                  : invitees.map((person) => String(person._id))
              )
            }
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {selected.length === invitees.length ? "Clear all" : "Select all"}
          </button>
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {invitees.map((person) => {
            const id = String(person._id);
            const checked = selected.includes(id);
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  checked ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(id)}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold text-blue-600">
                  {person.profileImage ? (
                    <img src={person.profileImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    personName(person).charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">{personName(person)}</p>
                  <p className="truncate text-[11px] text-gray-400">{person.position || "Team member"}</p>
                </div>
              </label>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <FiX className="h-4 w-4" /> Close
          </button>
          <PrimaryButton
            title={`Save attendance (${selected.length})`}
            loading={isSaving}
            disable={isSaving}
            icon={<FiUsers className="h-4 w-4" />}
            onclick={() => onSubmit(selected)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleMeetingModal;
