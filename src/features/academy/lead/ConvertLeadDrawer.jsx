import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Drawer, ErrorState, Field, Spinner, btnGhost, btnPrimary, btnSmall, inputCls, selectCls } from "../../accounts/components/ui";
import { useGetLeadStatuses, useLogLeadInteraction } from "../../leads/api";
import { usePermissions } from "../../../hooks/usePermissions";
import { academyApi } from "../api/academyApi";
import { useConvertLead, useCourses } from "../hooks/useAcademy";
import EnrollmentFields, { emptyEnrollment, enrollmentPayload, enrollmentReady } from "../components/EnrollmentFields";
import CredentialsModal from "../components/CredentialsModal";
import { SOURCE_LABELS, errorMessage } from "../utils";

const isWonStatus = (status) => status?.category === "Won" || status?.name?.toLowerCase() === "won";

const Content = ({ leadId, onClose }) => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const prefill = useQuery({
    queryKey: ["academy", "leadPrefill", leadId],
    queryFn: () => academyApi.leadPrefill(leadId),
    gcTime: 0,
    retry: false,
  });
  const lead = prefill.data?.lead;
  const { data: courseData } = useCourses({ active: "true" });
  const { data: statusData } = useGetLeadStatuses(lead?.projectId || null);
  const convert = useConvertLead();
  const logInteraction = useLogLeadInteraction();

  const [form, setForm] = useState(null);
  const [enroll, setEnroll] = useState(true);
  const [enrollment, setEnrollment] = useState(emptyEnrollment);
  const [markWon, setMarkWon] = useState(true);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    if (lead && !form) {
      setForm({ name: lead.name, phone: lead.phone, email: lead.email, source: lead.source, qualification: "" });
    }
  }, [lead, form]);

  // a status for this client first, then a company-wide one
  const wonStatuses = (statusData?.data || []).filter((s) => s.category === "Won");
  const wonStatus =
    wonStatuses.find((s) => String(s.project?._id || s.project || "") === lead?.projectId) ||
    wonStatuses.find((s) => !s.project) ||
    wonStatuses[0];
  const canEditLead = hasPermission("leads", "edit") || hasPermission("tasks", "editLead");
  const offerWon = Boolean(canEditLead && wonStatus && lead && !isWonStatus(lead.status));

  const closeAsWon = async (student, dealValue) => {
    if (!offerWon || !markWon) return;
    try {
      await logInteraction.mutateAsync({
        leadId,
        interactionData: {
          note: `Enrolled as academy student ${student.studentId}`,
          statusId: wonStatus.id || wonStatus._id,
          isFollowUp: false,
          ...(dealValue ? { dealValue } : {}),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (error) {
      toast.error(`The student is saved, but the lead could not be marked Won: ${errorMessage(error)}`);
    }
  };

  const submit = () =>
    convert.mutate(
      { leadId, ...form, enrollment: enroll ? enrollmentPayload(enrollment) : undefined },
      {
        onSuccess: async (data) => {
          setCreated(data);
          toast.success(`Student ${data.student.studentId} created`);
          await closeAsWon(data.student, data.enrollment?.fee?.net);
        },
      }
    );

  const link = (student) =>
    convert.mutate(
      { leadId, linkStudent: student._id },
      {
        onSuccess: async () => {
          toast.success(`Lead linked to ${student.name}`);
          await closeAsWon(student);
          onClose();
        },
      }
    );

  if (created) {
    return <CredentialsModal credentials={created.credentials} student={created.student} onClose={onClose} />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const linked = prefill.data?.linked;
  const matches = prefill.data?.matches || [];
  const ready = form && form.name.trim() && (form.phone.trim() || form.email.trim()) && (!enroll || enrollmentReady(enrollment));

  return (
    <Drawer
      isOpen
      onClose={onClose}
      title="Convert to student"
      subtitle={lead ? `${lead.name || "Lead"}${lead.projectName ? ` · ${lead.projectName}` : ""}` : ""}
      width="max-w-2xl"
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            {linked ? "Close" : "Cancel"}
          </button>
          {!linked && (
            <button className={btnPrimary} onClick={submit} disabled={!ready || convert.isPending}>
              {convert.isPending ? "Saving…" : "Create student"}
            </button>
          )}
        </>
      }
    >
      {prefill.isError ? (
        <ErrorState error={prefill.error} onRetry={prefill.refetch} />
      ) : !form ? (
        <Spinner />
      ) : linked ? (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-slate-700">
          This lead is already a student:{" "}
          <Link to={`/academy/students/${linked._id}`} className="font-bold text-[#3F8CFF] hover:underline" onClick={onClose}>
            {linked.name} ({linked.studentId})
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {matches.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
              <p className="text-sm font-bold text-slate-800">This phone or email already belongs to a student</p>
              {matches.map((s) => (
                <div key={s._id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-slate-700">
                    {s.name} · {s.studentId} · {s.phone || s.email}
                  </span>
                  <span className="flex gap-1.5">
                    <Link to={`/academy/students/${s._id}`} className={btnSmall} onClick={onClose}>
                      Open
                    </Link>
                    <button className={btnSmall} onClick={() => link(s)} disabled={convert.isPending}>
                      Link this lead
                    </button>
                  </span>
                </div>
              ))}
              <p className="text-xs text-slate-500">If it is the same person, link the lead instead of creating a second student.</p>
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full name" required className="sm:col-span-2">
              <input className={inputCls} value={form.name} onChange={set("name")} />
            </Field>
            <Field label="Phone" hint="Used to log in to the portal">
              <input className={inputCls} value={form.phone} onChange={set("phone")} inputMode="tel" />
            </Field>
            <Field label="Email">
              <input className={inputCls} type="email" value={form.email} onChange={set("email")} />
            </Field>
            <Field label="Came from">
              <select className={selectCls} value={form.source} onChange={set("source")}>
                {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Qualification">
              <input className={inputCls} value={form.qualification} onChange={set("qualification")} placeholder="e.g. B.Com" />
            </Field>
          </section>

          <section className="border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={enroll} onChange={(e) => setEnroll(e.target.checked)} className="accent-[#3F8CFF]" />
              Enroll in a course now
            </label>
            {enroll && <EnrollmentFields value={enrollment} onChange={setEnrollment} courses={courseData?.courses || []} />}
          </section>

          {offerWon && (
            <label className="flex items-start gap-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
              <input type="checkbox" checked={markWon} onChange={(e) => setMarkWon(e.target.checked)} className="accent-emerald-600 mt-1" />
              <span>
                <span className="font-semibold">Also mark the lead as Won</span>
                <span className="block text-xs text-slate-400">The net course fee is saved as the deal value.</span>
              </span>
            </label>
          )}
        </div>
      )}
    </Drawer>
  );
};

/** Page-level drawer that turns one lead into a student. */
const ConvertLeadDrawer = ({ lead, onClose }) => {
  if (!lead) return null;
  const id = lead._id || lead.id;
  // The wrapper stops clicks reaching clickable rows or cards behind the portal
  return createPortal(
    <div onClick={(e) => e.stopPropagation()}>
      <Content key={id} leadId={id} onClose={onClose} />
    </div>,
    document.body
  );
};

export default ConvertLeadDrawer;
