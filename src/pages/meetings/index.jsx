import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import {
  FiCalendar,
  FiArrowUpRight,
  FiClock,
  FiPlus,
  FiUsers,
  FiVideo,
} from "react-icons/fi";
import ScheduleMeetingModal, {
  ReportAttendanceModal,
} from "../../components/meetings/ScheduleMeetingModal";
import MeetingDetailsModal from "../../components/meetings/MeetingDetailsModal";
import {
  useAddMeetingActionItem,
  useCancelMeeting,
  useConnectGoogleMeet,
  useCreateMeeting,
  useDeleteMeetingActionItem,
  useGenerateMeetingMeetLink,
  useGetAllEmployees,
  useGetGoogleMeetStatus,
  useGetMeetings,
  useReportMeetingAttendance,
  useUpdateMeeting,
  useUpdateMeetingActionItem,
} from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

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

const personInitials = (person) => {
  const first = person?.firstName?.[0] || person?.name?.[0] || "";
  const last = person?.lastName?.[0] || "";
  return (first + last).toUpperCase() || "?";
};

const ShimmerBox = ({ className = "" }) => (
  <div
    className={`bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%] rounded ${className}`}
  />
);

const MeetingCardShimmer = () => (
  <div className="rounded-[24px] bg-white p-3.5 h-[170px]">
    <div className="flex items-center gap-3">
      <ShimmerBox className="h-11 w-11 rounded-full" />
      <div className="space-y-2">
        <ShimmerBox className="h-4 w-28" />
        <ShimmerBox className="h-3 w-20" />
      </div>
    </div>
    <ShimmerBox className="mt-8 h-5 w-3/4" />
    <ShimmerBox className="mt-3 h-4 w-1/2" />
    <div className="mt-8 flex gap-2">
      <ShimmerBox className="h-11 flex-1 rounded-full" />
      <ShimmerBox className="h-11 w-11 rounded-full" />
      <ShimmerBox className="h-11 w-11 rounded-full" />
    </div>
  </div>
);

const Meetings = () => {
  const { user } = useAuth();
  const { canScheduleMeetings } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("upcoming");
  const [showSchedule, setShowSchedule] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [reportingMeeting, setReportingMeeting] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [headerSlot, setHeaderSlot] = useState(null);

  useEffect(() => {
    setHeaderSlot(document.getElementById("header-date-slot"));
  }, []);

  const { data, isLoading } = useGetMeetings();
  const { data: employeesData } = useGetAllEmployees(true, { view: "select" });
  const { data: googleStatus } = useGetGoogleMeetStatus();
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const cancelMeeting = useCancelMeeting();
  const reportAttendance = useReportMeetingAttendance();
  const addActionItem = useAddMeetingActionItem();
  const updateActionItem = useUpdateMeetingActionItem();
  const deleteActionItem = useDeleteMeetingActionItem();
  const generateMeetLink = useGenerateMeetingMeetLink();
  const connectGoogle = useConnectGoogleMeet();

  const meetings = data?.meetings || [];
  const canSchedule = Boolean(data?.canSchedule) || canScheduleMeetings();
  const employees = employeesData?.employees || [];
  const isAdmin = user?.role === "company-admin";
  const selectedMeeting = meetings.find((meeting) => meeting._id === selectedMeetingId) || null;

  useEffect(() => {
    const result = searchParams.get("googleMeet");
    if (!result) return;
    if (result === "connected") {
      toast.success("Google Calendar connected. Meet links can be created automatically.");
    } else {
      toast.error(searchParams.get("message") || "Google Calendar connection failed");
    }
    searchParams.delete("googleMeet");
    searchParams.delete("message");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleConnectGoogle = () => {
    connectGoogle.mutate("/meetings", {
      onSuccess: (res) => {
        if (res?.url) window.location.href = res.url;
      },
      onError: (error) =>
        toast.error(error?.message || "Could not start Google Calendar connect"),
    });
  };

  const grouped = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];
    meetings.forEach((meeting) => {
      const isPast =
        meeting.status !== "scheduled" || new Date(meeting.endAt) < now;
      if (isPast) past.push(meeting);
      else upcoming.push(meeting);
    });
    upcoming.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    past.sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
    return { upcoming, past };
  }, [meetings]);

  const visible = tab === "upcoming" ? grouped.upcoming : grouped.past;

  const canManage = (meeting) =>
    canSchedule || String(meeting.createdBy?._id || meeting.createdBy) === String(user?._id || user?.id);

  const handleSaveMeeting = (payload) => {
    const onSuccess = (res) => {
      toast.success(editingMeeting ? "Meeting updated" : "Meeting scheduled");
      if (res?.meetLinkWarning) toast(res.meetLinkWarning);
      setShowSchedule(false);
      setEditingMeeting(null);
    };
    const onError = (error) =>
      toast.error(error?.response?.data?.message || error?.message || "Could not save meeting");

    if (editingMeeting) {
      updateMeeting.mutate(
        { meetingId: editingMeeting._id, data: payload },
        { onSuccess, onError }
      );
    } else {
      createMeeting.mutate(payload, { onSuccess, onError });
    }
  };

  const handleAddItem = (meeting, payload) => {
    addActionItem.mutate(
      { meetingId: meeting._id, data: payload },
      {
        onSuccess: () => toast.success("Tracked item added"),
        onError: (error) =>
          toast.error(error?.response?.data?.message || "Could not add item"),
      }
    );
  };

  const handleToggleItem = (meeting, item, status) => {
    updateActionItem.mutate(
      { meetingId: meeting._id, itemId: item._id, data: { status } },
      {
        onError: (error) =>
          toast.error(error?.response?.data?.message || "Could not update item"),
      }
    );
  };

  const handleDeleteItem = (meeting, item) => {
    deleteActionItem.mutate(
      { meetingId: meeting._id, itemId: item._id },
      {
        onSuccess: () => toast.success("Tracked item removed"),
        onError: (error) =>
          toast.error(error?.response?.data?.message || "Could not remove item"),
      }
    );
  };

  const handleReport = (attendees) => {
    reportAttendance.mutate(
      { meetingId: reportingMeeting._id, attendees },
      {
        onSuccess: (res) => {
          toast.success(
            res?.awardedCount
              ? `Attendance saved. ${res.awardedCount} ${res.awardedCount === 1 ? "person" : "people"} received ${res.pointsPerAttendee} pts.`
              : "Attendance saved"
          );
          setReportingMeeting(null);
        },
        onError: (error) =>
          toast.error(error?.response?.data?.message || "Could not save attendance"),
      }
    );
  };

  const openScheduleMeeting = () => {
    setEditingMeeting(null);
    setShowSchedule(true);
  };

  return (
    <section className="flex flex-col gap-3 pb-8">
      {canSchedule &&
        headerSlot &&
        createPortal(
          <button
            type="button"
            onClick={openScheduleMeeting}
            className="flex h-11 sm:h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-3 sm:px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            title="Schedule meeting"
          >
            <FiPlus className="h-5 w-5 text-gray-600" />
            <span className="hidden sm:inline whitespace-nowrap">Schedule meeting</span>
          </button>,
          headerSlot
        )}

      {canSchedule && googleStatus && !googleStatus.connected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-[#F4F9FD] px-4 py-3">
          <p className="text-xs text-[#7D8592]">
            Connect Google Calendar to create Meet links automatically when you schedule.
          </p>
          {isAdmin ? (
            <button
              type="button"
              onClick={handleConnectGoogle}
              disabled={connectGoogle.isPending}
              className="rounded-xl bg-[#3F8CFF] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {connectGoogle.isPending ? "Connecting..." : "Connect Google"}
            </button>
          ) : (
            <p className="text-xs text-gray-400">Ask a company admin to connect it in Integration.</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {[
          { id: "upcoming", label: "Upcoming", count: grouped.upcoming.length },
          { id: "past", label: "Past", count: grouped.past.length },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              tab === item.id
                ? "bg-[#1F1F1F] text-white"
                : "bg-white text-[#7D8592] hover:text-[#1F1F1F]"
            }`}
          >
            {item.label} {item.count}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <MeetingCardShimmer />
          <MeetingCardShimmer />
          <MeetingCardShimmer />
          <MeetingCardShimmer />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#3F8CFF]">
            <FiVideo className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">
            {tab === "upcoming" ? "No upcoming meetings" : "No past meetings yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[#7D8592]">
            {canSchedule
              ? "Schedule a meeting, add the Google Meet link, and choose who should attend."
              : "When a meeting is scheduled for you, it will show up here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((meeting, cardIndex) => {
            const meta = statusMeta(meeting);
            const { dateLabel, timeLabel } = formatRange(meeting.startAt, meeting.endAt);
            const people =
              meeting.status === "completed"
                ? meeting.attendees || []
                : meeting.invitees || [];
            const trackedCount = meeting.actionItems?.length || 0;
            const organizer =
              meeting.createdBy && typeof meeting.createdBy === "object"
                ? meeting.createdBy
                : null;
            const isNext = tab === "upcoming" && cardIndex === 0;
            const canJoin = meeting.meetLink && meeting.status === "scheduled";
            const cardBg = isNext ? "bg-[#3F8CFF]" : "bg-white";
            const strong = isNext ? "text-white" : "text-[#0A1629]";
            const soft = isNext ? "text-white/75" : "text-[#7D8592]";
            const ring = isNext ? "border-white/40" : "border-[#D8E0F0]";

            return (
              <article
                key={meeting._id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMeetingId(meeting._id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedMeetingId(meeting._id);
                  }
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-[24px] ${cardBg} p-3.5 text-left transition-transform hover:-translate-y-0.5`}
              >
                {/* Notch (drawn in the page colour) that holds the open button */}
                <svg
                  className="pointer-events-none absolute right-0 top-0"
                  width="96"
                  height="76"
                  viewBox="0 0 96 76"
                  aria-hidden="true"
                >
                  <path
                    d="M12 0 H96 V76 A16 16 0 0 0 80 60 H44 A16 16 0 0 1 28 44 V16 A16 16 0 0 0 12 0 Z"
                    fill="#F4F9FD"
                  />
                </svg>
                <div className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full border border-[#D8E0F0] bg-[#F4F9FD] text-[#0A1629] transition-colors group-hover:border-[#3F8CFF] group-hover:bg-[#3F8CFF] group-hover:text-white">
                  <FiArrowUpRight className="h-[18px] w-[18px]" />
                </div>

                {/* Organizer */}
                <div className="flex items-center gap-2.5 pr-20">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E6EDF5] text-[11px] font-bold text-[#0A1629]">
                    {organizer?.profileImage ? (
                      <img src={organizer.profileImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      personInitials(organizer || { name: "O" })
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-semibold ${strong}`}>
                      {organizer ? personName(organizer) : "Organizer"}
                    </p>
                    <p className={`truncate text-[11px] ${soft}`}>
                      {meta.label}
                      {meeting.pointsPerAttendee > 0 && meeting.status === "completed"
                        ? ` · +${meeting.pointsPerAttendee} pts`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Title, people and time */}
                <div className="mt-5 flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isNext ? "bg-white text-[#3F8CFF]" : "bg-[#3F8CFF] text-white"
                    }`}
                  >
                    <FiVideo className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`truncate text-sm font-semibold ${strong}`}>{meeting.title}</h3>
                    <div className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${soft}`}>
                      <div className="flex items-center">
                        {people.slice(0, 3).map((person, index) => (
                          <div
                            key={person._id || index}
                            className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-white bg-[#E6EDF5] text-[7px] font-bold text-[#0A1629]"
                            style={{ marginLeft: index > 0 ? "-5px" : 0, zIndex: 10 - index }}
                            title={personName(person)}
                          >
                            {person.profileImage ? (
                              <img src={person.profileImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              personInitials(person)
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 truncate">
                        {dateLabel} <FiClock className="h-3 w-3 shrink-0" /> {timeLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center gap-2">
                  <div className={`flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border ${ring} px-3.5 text-xs ${strong}`}>
                    <FiCalendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{meta.label}</span>
                  </div>
                  <div
                    className={`flex h-10 min-w-10 shrink-0 items-center justify-center gap-1 rounded-full border ${ring} px-2.5 text-xs font-medium ${strong}`}
                    title={`${people.length} ${meeting.status === "completed" ? "attended" : "invited"}${trackedCount > 0 ? ` · ${trackedCount} tracked` : ""}`}
                  >
                    <FiUsers className="h-3.5 w-3.5" />
                    {people.length}
                  </div>
                  {canJoin ? (
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      title="Join meeting"
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 ${
                        isNext ? "bg-white text-[#3F8CFF]" : "bg-[#3F8CFF] text-white"
                      }`}
                    >
                      <FiVideo className="h-4 w-4" />
                    </a>
                  ) : (
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isNext ? "bg-white/30 text-white/70" : "bg-[#E6EDF5] text-[#9AA7BC]"
                      }`}
                    >
                      <FiVideo className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <MeetingDetailsModal
        isOpen={Boolean(selectedMeeting)}
        meeting={selectedMeeting}
        employees={employees}
        currentUserId={user?._id || user?.id}
        canManage={selectedMeeting ? canManage(selectedMeeting) : false}
        canReport={
          Boolean(selectedMeeting) &&
          canManage(selectedMeeting) &&
          selectedMeeting.status === "scheduled" &&
          (new Date() >= new Date(selectedMeeting.startAt) || user?.role === "company-admin")
        }
        isSavingItems={
          addActionItem.isPending ||
          updateActionItem.isPending ||
          deleteActionItem.isPending
        }
        isGeneratingLink={generateMeetLink.isPending}
        onClose={() => setSelectedMeetingId(null)}
        onEdit={() => {
          setEditingMeeting(selectedMeeting);
          setSelectedMeetingId(null);
          setShowSchedule(true);
        }}
        onCancel={() => {
          if (!selectedMeeting) return;
          if (window.confirm("Cancel this meeting?")) {
            cancelMeeting.mutate(selectedMeeting._id, {
              onSuccess: () => {
                toast.success("Meeting cancelled");
                setSelectedMeetingId(null);
              },
              onError: (error) =>
                toast.error(error?.response?.data?.message || "Could not cancel"),
            });
          }
        }}
        onReport={() => {
          setReportingMeeting(selectedMeeting);
          setSelectedMeetingId(null);
        }}
        onAddItem={handleAddItem}
        onToggleItem={handleToggleItem}
        onDeleteItem={handleDeleteItem}
        onGenerateLink={(meetingId, options) => generateMeetLink.mutate(meetingId, options)}
      />

      <ScheduleMeetingModal
        isOpen={showSchedule}
        meeting={editingMeeting}
        employees={employees}
        isSaving={createMeeting.isPending || updateMeeting.isPending}
        googleStatus={googleStatus}
        isAdmin={isAdmin}
        onConnectGoogle={handleConnectGoogle}
        isConnectingGoogle={connectGoogle.isPending}
        onClose={() => {
          setShowSchedule(false);
          setEditingMeeting(null);
        }}
        onSubmit={handleSaveMeeting}
      />

      <ReportAttendanceModal
        isOpen={Boolean(reportingMeeting)}
        meeting={reportingMeeting}
        isSaving={reportAttendance.isPending}
        onClose={() => setReportingMeeting(null)}
        onSubmit={handleReport}
      />
    </section>
  );
};

export default Meetings;
