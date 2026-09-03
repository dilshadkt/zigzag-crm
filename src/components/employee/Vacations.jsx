import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useGetEmployeeVacations, useGetLeavePolicy, useUpdateProfile } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import Progress from "../shared/progress";
import LeaveCard from "../shared/LeaveCard";
import { getLeaveLimits, isOnProbation, formatJoiningDate } from "../../utils/leaveEntitlement";

const Vacations = ({ employeeId, employee, canEdit = false }) => {
  const [currentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const [isEditingQuotas, setIsEditingQuotas] = useState(false);
  const [quotaDraft, setQuotaDraft] = useState({
    vacation: "",
    sick_leave: "",
    remote_work: "",
  });

  const { data, isLoading } = useGetEmployeeVacations(
    employeeId,
    currentMonth,
    currentYear
  );

  const { user } = useAuth();
  const { data: leavePolicy } = useGetLeavePolicy(user?.company);
  const updateProfileMutation = useUpdateProfile(undefined, employeeId);

  const employeeRecord = employee || data?.employee || {};
  const onProbation = isOnProbation(employeeRecord);
  const joiningDate =
    employeeRecord?.joiningDate || data?.employee?.joiningDate;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#E6EBF5] border-t-[#3F8CFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        No vacation data found for this employee
      </div>
    );
  }

  const { summary, vacations } = data;
  const limits = getLeaveLimits(employeeRecord, leavePolicy || []);

  const startQuotaEdit = () => {
    setQuotaDraft({
      vacation: String(limits.vacation ?? 0),
      sick_leave: String(limits.sick_leave ?? 0),
      remote_work: String(limits.remote_work ?? 0),
    });
    setIsEditingQuotas(true);
  };

  const saveQuotas = async () => {
    const vacation = Number(quotaDraft.vacation);
    const sickLeave = Number(quotaDraft.sick_leave);
    const remoteWork = Number(quotaDraft.remote_work);

    if ([vacation, sickLeave, remoteWork].some((value) => !Number.isFinite(value) || value < 0)) {
      toast.error("Leave days must be valid numbers of 0 or more");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        leaveQuotas: {
          vacation,
          sick_leave: sickLeave,
          remote_work: remoteWork,
        },
      });
      toast.success("Leave days updated");
      setIsEditingQuotas(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update leave days");
    }
  };

  const remaining = {
    vacation: Math.max(0, limits.vacation - (summary?.vacation || 0)),
    sick_leave: Math.max(0, limits.sick_leave - (summary?.sick_leave || 0)),
    remote_work: Math.max(0, limits.remote_work - (summary?.remote_work || 0)),
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      {onProbation ? (
        <div className="bg-white rounded-3xl p-8 text-center mb-5">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center text-2xl">
            ⏳
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Don't have leave in probation
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            This employee is on probation and cannot request or use leave until
            probation ends.
          </p>
          {joiningDate && (
            <p className="text-xs font-medium text-amber-700 mt-3">
              Joining date: {formatJoiningDate(joiningDate)}
            </p>
          )}
        </div>
      ) : (
        <>
          {canEdit && (
            <div className="flex justify-end mb-3">
              {isEditingQuotas ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingQuotas(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveQuotas}
                    disabled={updateProfileMutation.isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#3F8CFF] rounded-xl disabled:opacity-50"
                  >
                    {updateProfileMutation.isLoading ? "Saving..." : "Save leave days"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startQuotaEdit}
                  className="px-4 py-2 text-sm font-medium text-[#3F8CFF] bg-white rounded-xl"
                >
                  Alter vacation
                </button>
              )}
            </div>
          )}
          <div className="grid grid-cols-3 gap-5">
            <LeaveBalanceCard
              title="Vacation"
              remaining={remaining.vacation}
              limit={limits.vacation}
              color="#15C0E6"
              isEditing={isEditingQuotas}
              editValue={quotaDraft.vacation}
              onChange={(value) =>
                setQuotaDraft((prev) => ({ ...prev, vacation: value }))
              }
            />
            <LeaveBalanceCard
              title="Sick Leave"
              remaining={remaining.sick_leave}
              limit={limits.sick_leave}
              color="#F65160"
              isEditing={isEditingQuotas}
              editValue={quotaDraft.sick_leave}
              onChange={(value) =>
                setQuotaDraft((prev) => ({ ...prev, sick_leave: value }))
              }
            />
            <LeaveBalanceCard
              title="Work Remotely"
              remaining={remaining.remote_work}
              limit={limits.remote_work}
              color="#6D5DD3"
              isEditing={isEditingQuotas}
              editValue={quotaDraft.remote_work}
              onChange={(value) =>
                setQuotaDraft((prev) => ({ ...prev, remote_work: value }))
              }
            />
          </div>
        </>
      )}
      <h3 className="text-sm font-bold my-3 ml-1  text-gray-600">
        Vacation Requests
      </h3>
      <div className="w-full h-full overflow-y-auto">
        {vacations && vacations.length > 0 ? (
          vacations.map((vacation) => (
            <LeaveCard
              key={vacation._id}
              request={{
                id: vacation._id,
                type: vacation.type,
                status: vacation.status,
                startDate: vacation.startDate,
                endDate: vacation.endDate,
                duration: vacation.durationDays,
                reason: vacation.reason,
                project: vacation.project?.name,
                createdAt: vacation.createdAt,
                approvedBy: vacation.approvedBy
                  ? `${vacation.approvedBy.firstName} ${vacation.approvedBy.lastName}`
                  : null,
              }}
            />
          ))
        ) : (
          <div className="bg-white h-full flexCenter rounded-3xl p-6 text-center text-gray-500">
            No vacation requests found
          </div>
        )}
      </div>
    </div>
  );
};

const LeaveBalanceCard = ({
  title,
  remaining,
  limit,
  color,
  isEditing,
  editValue,
  onChange,
}) => (
  <div className="p-6 rounded-3xl bg-white">
    <div className="flex flex-col">
      <div className="flex items-center w-fit relative justify-start">
        <Progress
          size={62}
          currentValue={remaining}
          target={limit || 1}
          DefaultPathColor={color}
        />
        <span
          className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
         flexCenter text-2xl font-semibold"
          style={{ color }}
        >
          {remaining}
        </span>
      </div>
      <h4 className="mt-3 mb-1 font-semibold text-gray-800">{title}</h4>
      {isEditing ? (
        <label className="text-xs text-gray-400 font-medium">
          Yearly days
          <input
            type="number"
            min="0"
            value={editValue}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[#D8E0F0] px-3 py-2 text-sm text-[#0A1629] outline-none focus:border-[#3F8CFF]"
          />
        </label>
      ) : (
        <p className="text-xs text-gray-400 font-medium">
          {remaining}/{limit} days available
        </p>
      )}
    </div>
  </div>
);

export default Vacations;
