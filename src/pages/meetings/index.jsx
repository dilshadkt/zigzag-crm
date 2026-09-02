import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiPlus,
  FiUsers,
  FiVideo,
} from "react-icons/fi";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import ScheduleMeetingModal, {
  ReportAttendanceModal,
} from "../../components/meetings/ScheduleMeetingModal";
import MeetingTrackItems from "../../components/meetings/MeetingTrackItems";
import MeetLinkActions from "../../components/meetings/MeetLinkActions";
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

const Meetings = () => {
  const { user } = useAuth();
  const { canScheduleMeetings } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("upcoming");
  const [showSchedule, setShowSchedule] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [reportingMeeting, setReportingMeeting] = useState(null);

  const { data, isLoading } = useGetMeetings();
  const { data: employeesData } = useGetAllEmployees(true);
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

  return (
    <section className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Header>Meetings</Header>
          <p className="mt-1 text-sm text-[#7D8592]">
            See scheduled meetings, join with the Meet link, and report who attended so they earn points.
          </p>
        </div>
        {canSchedule && (
          <PrimaryButton
            title="Schedule meeting"
            icon={<FiPlus className="h-4 w-4" />}
            onclick={() => {
              setEditingMeeting(null);
              setShowSchedule(true);
            }}
          />
        )}
      </div>

      {canSchedule && googleStatus && !googleStatus.connected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-[#F4F9FD] px-4 py-3">
          <p className="text-sm text-[#7D8592]">
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
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              tab === item.id
                ? "bg-[#3F8CFF] text-white"
                : "bg-white text-[#7D8592]"
            }`}
          >
            {item.label} {item.count}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-3xl bg-white">
          <img src="/icons/loading.svg" alt="" className="w-14" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#3F8CFF]">
            <FiVideo className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            {tab === "upcoming" ? "No upcoming meetings" : "No past meetings yet"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[#7D8592]">
            {canSchedule
              ? "Schedule a meeting, add the Google Meet link, and choose who should attend."
              : "When a meeting is scheduled for you, it will show up here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visible.map((meeting) => {
            const meta = statusMeta(meeting);
            const { dateLabel, timeLabel } = formatRange(meeting.startAt, meeting.endAt);
            const manage = canManage(meeting);
            const canReport =
              manage &&
              meeting.status === "scheduled" &&
              (new Date() >= new Date(meeting.startAt) || user?.role === "company-admin");

            return (
              <article
                key={meeting._id}
                className="relative overflow-hidden rounded-3xl bg-white p-5 pl-8 shadow-sm"
              >
                <div className="absolute bottom-5 left-3 top-5 w-1 rounded-full bg-[#3F8CFF]" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${meta.className}`}>
                        {meta.label}
                      </span>
                      {meeting.pointsPerAttendee > 0 && meeting.status === "completed" && (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600">
                          +{meeting.pointsPerAttendee} pts
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-semibold text-[#0A1629]">{meeting.title}</h3>
                    {meeting.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-[#7D8592]">{meeting.description}</p>
                    ) : null}
                  </div>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#F4F9FD] text-[#3F8CFF]">
                    <FiVideo className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#7D8592]">
                  <span className="inline-flex items-center gap-1.5">
                    <FiCalendar className="h-4 w-4" /> {dateLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FiClock className="h-4 w-4" /> {timeLabel}
                  </span>
                </div>

                {meeting.meetLink ? (
                  <MeetLinkActions meeting={meeting} />
                ) : manage && meeting.status !== "cancelled" ? (
                  <button
                    type="button"
                    onClick={() =>
                      generateMeetLink.mutate(meeting._id, {
                        onSuccess: (res) => {
                          if (res?.meeting?.meetLink) toast.success("Meet link created");
                          else if (res?.meetLinkWarning) toast(res.meetLinkWarning);
                          else toast.error("Could not create a Meet link");
                        },
                        onError: (error) =>
                          toast.error(error?.message || "Could not create a Meet link"),
                      })
                    }
                    disabled={generateMeetLink.isPending}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3F8CFF] hover:underline disabled:opacity-50"
                  >
                    Create Meet link
                  </button>
                ) : (
                  <p className="mt-3 text-xs text-gray-400">No Meet link added.</p>
                )}

                <div className="mt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    <FiUsers className="h-3.5 w-3.5" />
                    {meeting.status === "completed" ? "Attended" : "Invited"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(meeting.status === "completed" ? meeting.attendees : meeting.invitees).map((person) => (
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
                    {meeting.status === "completed" && meeting.attendees?.length === 0 && (
                      <span className="text-xs text-gray-400">Nobody was marked present.</span>
                    )}
                  </div>
                </div>

                <MeetingTrackItems
                  meeting={meeting}
                  employees={employees}
                  canAdd={meeting.status !== "cancelled"}
                  currentUserId={user?._id || user?.id}
                  isSaving={
                    addActionItem.isPending ||
                    updateActionItem.isPending ||
                    deleteActionItem.isPending
                  }
                  onAdd={(data) => handleAddItem(meeting, data)}
                  onToggle={(item, status) => handleToggleItem(meeting, item, status)}
                  onDelete={(item) => handleDeleteItem(meeting, item)}
                />

                {manage && meeting.status === "scheduled" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {canReport && (
                      <button
                        type="button"
                        onClick={() => setReportingMeeting(meeting)}
                        className="rounded-xl bg-[#3F8CFF] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                      >
                        Report attendance
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMeeting(meeting);
                        setShowSchedule(true);
                      }}
                      className="rounded-xl bg-[#F4F9FD] px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Cancel this meeting?")) {
                          cancelMeeting.mutate(meeting._id, {
                            onSuccess: () => toast.success("Meeting cancelled"),
                            onError: (error) =>
                              toast.error(error?.response?.data?.message || "Could not cancel"),
                          });
                        }
                      }}
                      className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

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
