import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../shared/modal";
import { useAuth } from "../../../hooks/useAuth";
import { useGetCompany } from "../../../api/hooks";
import { RESCHEDULE_REASONS } from "../../../utils/rescheduleReasons";

const TONES = {
  red: "border-red-200 bg-red-50 text-red-700",
  green: "border-green-200 bg-green-50 text-green-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

/**
 * Asks why a due date is being moved. The answer decides the penalty:
 *   staff_delay          -> assignee loses points
 *   client_delay         -> no penalty
 *   internal_dependency  -> the colleague who caused it loses points
 *   management_priority  -> no penalty
 *
 * onConfirm receives { reasonType, reason, faultUser }.
 */
const DateChangeReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  oldDate,
  newDate,
  canWaivePenalty = false,
  teams = [],
  assigneeIds = [],
  suggestedFaultUserId = "",
  itemLabel = "task",
}) => {
  const { companyId } = useAuth();
  const { data: companyData } = useGetCompany(isOpen ? companyId : null);
  const penaltyPoints =
    companyData?.company?.gamificationSettings?.rescheduleStaffDelayPenalty ?? 10;

  const [reasonType, setReasonType] = useState("");
  const [reason, setReason] = useState("");
  const [faultUser, setFaultUser] = useState("");
  const [error, setError] = useState("");

  const assigneeSet = useMemo(
    () => new Set((assigneeIds || []).map((id) => String(id?._id || id))),
    [assigneeIds]
  );

  // The person who caused an internal dependency can't be the current assignee.
  const faultCandidates = useMemo(
    () =>
      (teams || []).filter(
        (member) => member?._id && !assigneeSet.has(String(member._id))
      ),
    [teams, assigneeSet]
  );

  useEffect(() => {
    if (!isOpen) return;
    setReasonType("");
    setReason("");
    setError("");
    setFaultUser(
      faultCandidates.some((m) => String(m._id) === String(suggestedFaultUserId))
        ? String(suggestedFaultUserId)
        : ""
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleConfirm = () => {
    if (!reasonType) {
      setError("Select why the due date is changing.");
      return;
    }
    if (reasonType === "internal_dependency" && !faultUser) {
      setError("Select the team member whose delay caused this.");
      return;
    }
    if (!reason.trim()) {
      setError("Add a short note explaining the change.");
      return;
    }
    onConfirm({
      reasonType,
      reason: reason.trim(),
      faultUser: reasonType === "internal_dependency" ? faultUser : "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reason for Date Change"
      maxWidth="sm:max-w-xl"
    >
      <div className="space-y-4 overflow-y-auto pr-1">
        <p className="text-sm text-gray-600">
          You are moving this {itemLabel}'s due date from{" "}
          <span className="font-semibold">{formatDate(oldDate)}</span> to{" "}
          <span className="font-semibold">{formatDate(newDate)}</span>. Pick the
          reason that applies — it decides whether points are deducted.
        </p>

        <div className="space-y-2" role="radiogroup" aria-label="Reason type">
          {RESCHEDULE_REASONS.map((option) => {
            const disabled = !option.selfService && !canWaivePenalty;
            const selected = reasonType === option.value;
            const penaltyText =
              option.value === "staff_delay"
                ? `-${penaltyPoints} Pts to the assignee`
                : option.value === "internal_dependency"
                  ? `0 Pts for the assignee, -${penaltyPoints} Pts to the person who caused it`
                  : "0 Pts — no penalty";
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => {
                  setReasonType(option.value);
                  setError("");
                }}
                className={`w-full rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 hover:border-gray-300"
                } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {option.label}
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONES[option.tone]}`}
                  >
                    {penaltyText}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{option.description}</p>
                {disabled && (
                  <p className="mt-1 text-[11px] font-medium text-gray-500">
                    Only an admin or the project coordinator can choose this.
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {reasonType === "internal_dependency" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Who caused the delay? <span className="text-red-500">*</span>
            </label>
            <select
              value={faultUser}
              onChange={(e) => {
                setFaultUser(e.target.value);
                setError("");
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select team member</option>
              {faultCandidates.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.firstName || member.name}
                  {member.lastName ? ` ${member.lastName}` : ""}
                  {member.position ? ` (${member.position})` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              They lose {penaltyPoints} points. The current assignee is not
              penalised.
            </p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Note <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            placeholder="What happened? e.g. client has not shared the photos yet"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DateChangeReasonModal;
