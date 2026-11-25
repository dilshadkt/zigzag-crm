import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiAward, FiDownload, FiEdit2, FiExternalLink, FiKey, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import {
  Card,
  ConfirmModal,
  Drawer,
  ErrorState,
  PageHeader,
  Spinner,
  StatusBadge,
  Table,
  btnDanger,
  btnGhost,
  btnPrimary,
  btnSmall,
  selectCls,
} from "../../accounts/components/ui";
import {
  useAddEnrollment,
  useCourses,
  useDeleteEnrollment,
  useDeleteStudent,
  useRemovePayment,
  useResetPassword,
  useRevokeCertificate,
  useSetStudentActive,
  useStudent,
  useUpdateEnrollment,
} from "../hooks/useAcademy";
import { academyApi } from "../api/academyApi";
import { useAcademy } from "../context";
import StudentDrawer from "../components/StudentDrawer";
import CredentialsModal from "../components/CredentialsModal";
import EnrollmentFields, { emptyEnrollment, enrollmentPayload, enrollmentReady } from "../components/EnrollmentFields";
import FeePlanDrawer from "../components/FeePlanDrawer";
import PaymentModal from "../components/PaymentModal";
import CertificateUploadModal from "../components/CertificateUploadModal";
import {
  ENROLLMENT_STATUS,
  FEE_STATUS,
  PAYMENT_MODE_LABELS,
  SOURCE_LABELS,
  SUBMISSION_STATUS,
  errorMessage,
  fmtDateTime,
  fmtDay,
  fmtMoney,
  fmtPercent,
  verifyUrl,
} from "../utils";

const Info = ({ label, value }) => (
  <div>
    <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</dt>
    <dd className="text-sm text-slate-700 mt-0.5 break-words">{value || "—"}</dd>
  </div>
);

const Metric = ({ label, value, sub, tone }) => (
  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
    <p className="text-[11px] font-semibold text-slate-500">{label}</p>
    <p className={`text-base font-bold tabular-nums ${tone || "text-slate-800"}`}>{value}</p>
    {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
  </div>
);

const openFile = async (fn) => {
  try {
    await fn();
  } catch (error) {
    toast.error(errorMessage(error, "Could not open the file"));
  }
};

const EnrollmentCard = ({ enrollment: e, studentName, courses, onFees, onPay, onCertificate }) => {
  const { permissions: p } = useAcademy();
  const update = useUpdateEnrollment();
  const removePayment = useRemovePayment();
  const revoke = useRevokeCertificate();
  const remove = useDeleteEnrollment();
  const [confirm, setConfirm] = useState(null);
  const fs = e.feeSummary;
  const course = courses.find((c) => c._id === e.course?._id);

  return (
    <Card
      title={
        <span className="flex items-center gap-2 flex-wrap">
          {e.course?.name}
          <StatusBadge status={e.status} map={ENROLLMENT_STATUS} />
        </span>
      }
      subtitle={`${e.batch ? `${e.batch.name}${e.batch.timing ? ` · ${e.batch.timing}` : ""}` : "No batch"} · enrolled ${fmtDay(e.enrolledAt)}${
        e.batch?.trainerName ? ` · trainer ${e.batch.trainerName}` : ""
      }`}
      actions={
        p.manageStudents && (
          <div className="flex gap-1.5">
            <select
              className={`${selectCls} !h-8 !py-0 !text-xs !w-auto`}
              value={e.status}
              onChange={(ev) => update.mutate({ id: e._id, status: ev.target.value })}
              aria-label="Enrollment status"
            >
              {Object.entries(ENROLLMENT_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <select
              className={`${selectCls} !h-8 !py-0 !text-xs !w-auto`}
              value={e.batch?._id || ""}
              onChange={(ev) => update.mutate({ id: e._id, batch: ev.target.value || null })}
              aria-label="Batch"
            >
              <option value="">No batch</option>
              {(course?.batches || []).map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Metric label="Attendance" value={fmtPercent(e.attendance?.percent)} sub={`${e.attendance?.present + e.attendance?.late || 0} of ${(e.attendance?.total || 0) - (e.attendance?.excused || 0)} classes`} />
          <Metric label="Tasks done" value={`${e.tasks?.submitted || 0}/${e.tasks?.total || 0}`} sub={e.tasks?.overdue ? `${e.tasks.overdue} overdue` : e.tasks?.pending ? `${e.tasks.pending} pending` : "All caught up"} tone={e.tasks?.overdue ? "text-red-600" : undefined} />
          <Metric label="Average score" value={fmtPercent(e.tasks?.averageScorePercent)} sub={`${e.tasks?.reviewed || 0} reviewed`} />
          <Metric label="Fee balance" value={fs.balance > 0 ? fmtMoney(fs.balance) : "Paid"} sub={fs.overdueAmount > 0 ? `${fmtMoney(fs.overdueAmount)} overdue` : `${fmtMoney(fs.paid)} of ${fmtMoney(fs.net)} paid`} tone={fs.overdueAmount > 0 ? "text-red-600" : fs.balance > 0 ? undefined : "text-emerald-600"} />
        </div>

        {/* Fees */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-bold text-slate-700">
              Fees · {fmtMoney(e.fee.total)}
              {e.fee.discount > 0 && <span className="font-normal text-slate-500"> − {fmtMoney(e.fee.discount)} discount</span>}
              {e.fee.admission > 0 && <span className="font-normal text-slate-500"> + {fmtMoney(e.fee.admission)} admission</span>} ={" "}
              {fmtMoney(e.fee.net)}
            </p>
            {p.manageFees && (
              <div className="flex gap-1.5">
                <button className={btnSmall} onClick={() => onFees(e)}>
                  <FiEdit2 /> Fee plan
                </button>
                {fs.balance > 0 && (
                  <button className={`${btnSmall} !border-[#3F8CFF] !text-[#3F8CFF]`} onClick={() => onPay(e)}>
                    <FiPlus /> Payment
                  </button>
                )}
              </div>
            )}
          </div>
          {fs.installments.length > 0 && (
            <div className="rounded-xl border border-slate-100 overflow-hidden mb-3">
              <Table
                dense
                rowKey={(r) => r._id || r.label}
                rows={fs.installments}
                columns={[
                  { key: "label", title: "Instalment" },
                  { key: "dueDate", title: "Due", render: (r) => fmtDay(r.dueDate) },
                  { key: "amount", title: "Amount", align: "right", render: (r) => fmtMoney(r.amount) },
                  { key: "pending", title: "Pending", align: "right", render: (r) => (r.pending ? fmtMoney(r.pending) : "—") },
                  { key: "status", title: "", align: "right", render: (r) => <StatusBadge status={r.status} map={FEE_STATUS} /> },
                ]}
              />
            </div>
          )}
          {e.payments?.length > 0 ? (
            <ul className="divide-y divide-slate-50 text-sm">
              {[...e.payments]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((pay) => (
                  <li key={pay._id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-700">{fmtMoney(pay.amount)}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {fmtDay(pay.date)} · {PAYMENT_MODE_LABELS[pay.mode] || pay.mode}
                        {pay.reference ? ` · ${pay.reference}` : ""}
                        {pay.note ? ` · ${pay.note}` : ""}
                      </p>
                    </div>
                    {p.manageFees && (
                      <button
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                        onClick={() => setConfirm({ type: "payment", payment: pay })}
                        aria-label="Remove payment"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No payments recorded yet.</p>
          )}
        </div>

        {/* Certificate */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <FiAward className={`w-5 h-5 shrink-0 ${e.certificate ? "text-violet-600" : "text-slate-300"}`} />
            {e.certificate ? (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">Certificate {e.certificate.number}</p>
                <p className="text-xs text-slate-400">Issued {fmtDay(e.certificate.issuedAt)}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No certificate yet</p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {e.certificate?.hasFile && (
              <>
                <button className={btnSmall} onClick={() => openFile(() => academyApi.openCertificateFile(e._id))}>
                  <FiExternalLink /> View
                </button>
                <a className={btnSmall} href={verifyUrl(e.certificate.number)} target="_blank" rel="noreferrer">
                  Verify page
                </a>
              </>
            )}
            {p.issueCertificates && (
              <button className={btnSmall} onClick={() => onCertificate(e)}>
                <FiUpload /> {e.certificate ? "Replace" : "Upload"}
              </button>
            )}
            {p.issueCertificates && e.certificate && (
              <button className={`${btnSmall} !text-red-600`} onClick={() => setConfirm({ type: "certificate" })}>
                Remove
              </button>
            )}
          </div>
        </div>

        {p.delete && (
          <div className="flex justify-end">
            <button className="text-xs text-slate-400 hover:text-red-600" onClick={() => setConfirm({ type: "enrollment" })}>
              Remove this enrollment
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        danger
        busy={removePayment.isPending || revoke.isPending || remove.isPending}
        title={confirm?.type === "payment" ? "Remove payment?" : confirm?.type === "certificate" ? "Remove certificate?" : "Remove enrollment?"}
        message={
          confirm?.type === "payment"
            ? `${fmtMoney(confirm.payment.amount)} on ${fmtDay(confirm.payment.date)} will be removed and the balance goes back up.`
            : confirm?.type === "certificate"
            ? `${studentName} will no longer be able to download it, and the verify page will say it is not found.`
            : "Use this only for a mistaken entry. To record that a student left, set the status to Dropped."
        }
        confirmLabel="Remove"
        onConfirm={() => {
          const done = { onSuccess: () => setConfirm(null) };
          if (confirm.type === "payment") removePayment.mutate({ id: e._id, paymentId: confirm.payment._id }, done);
          else if (confirm.type === "certificate") revoke.mutate(e._id, done);
          else remove.mutate(e._id, done);
        }}
      />
    </Card>
  );
};

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { permissions: p } = useAcademy();
  const { data, isLoading, isError, error, refetch } = useStudent(id);
  const { data: courseData } = useCourses();
  const reset = useResetPassword();
  const setActive = useSetStudentActive();
  const del = useDeleteStudent();
  const addEnrollment = useAddEnrollment();

  const [editing, setEditing] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [feeFor, setFeeFor] = useState(null);
  const [payFor, setPayFor] = useState(null);
  const [certFor, setCertFor] = useState(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState(emptyEnrollment);

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState error={error} onRetry={refetch} />;

  const { student, enrollments, submissions } = data;
  const courses = courseData?.courses || [];
  // Keep modal data fresh after a payment or plan change
  const live = (e) => (e ? enrollments.find((x) => x._id === e._id) || e : null);

  return (
    <div>
      <PageHeader
        onBack={() => navigate("/academy/students")}
        title={student.name}
        subtitle={`${student.studentId} · joined ${fmtDay(student.createdAt)}${student.lastLoginAt ? ` · last portal login ${fmtDateTime(student.lastLoginAt)}` : " · has not logged in yet"}`}
        badge={!student.isActive && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">Portal off</span>}
        actions={
          p.manageStudents && (
            <>
              <button className={btnGhost} onClick={() => setEditing(true)}>
                <FiEdit2 /> Edit
              </button>
              <button className={btnGhost} onClick={() => setConfirm("reset")}>
                <FiKey /> Reset password
              </button>
              <button className={btnGhost} onClick={() => setActive.mutate({ id: student._id, isActive: !student.isActive })} disabled={setActive.isPending}>
                {student.isActive ? "Turn portal off" : "Turn portal on"}
              </button>
              {p.delete && (
                <button className={btnDanger} onClick={() => setConfirm("delete")}>
                  <FiTrash2 />
                </button>
              )}
            </>
          )
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[18rem_1fr] gap-4 items-start">
        <Card title="Profile">
          <dl className="space-y-3">
            <Info label="Phone" value={student.phone} />
            <Info label="Email" value={student.email} />
            <Info label="Came from" value={SOURCE_LABELS[student.source]} />
            {student.leads?.length > 0 && (
              <Info
                label="Converted from lead"
                value={
                  <span className="flex flex-wrap gap-x-3">
                    {student.leads.map((leadId, i) => (
                      <Link key={leadId} to={`/leads/${leadId}`} className="font-semibold text-[#3F8CFF] hover:underline">
                        View lead{student.leads.length > 1 ? ` ${i + 1}` : ""}
                      </Link>
                    ))}
                  </span>
                }
              />
            )}
            <Info label="Qualification" value={student.qualification} />
            <Info label="Date of birth" value={student.dob ? fmtDay(student.dob) : null} />
            <Info label="Guardian" value={[student.guardianName, student.guardianPhone].filter(Boolean).join(" · ")} />
            <Info label="Address" value={student.address} />
            {student.notes && <Info label="Staff notes" value={student.notes} />}
          </dl>
        </Card>

        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Courses</h3>
            {p.manageStudents && (
              <button
                className={btnSmall}
                onClick={() => {
                  setNewEnrollment(emptyEnrollment());
                  setEnrollOpen(true);
                }}
              >
                <FiPlus /> Enroll in another course
              </button>
            )}
          </div>
          {enrollments.length === 0 && (
            <Card>
              <p className="text-sm text-slate-500 text-center py-6">Not enrolled in any course yet.</p>
            </Card>
          )}
          {enrollments.map((e) => (
            <EnrollmentCard
              key={e._id}
              enrollment={e}
              studentName={student.name}
              courses={courses}
              onFees={setFeeFor}
              onPay={setPayFor}
              onCertificate={setCertFor}
            />
          ))}

          <Card title="Task submissions" padded={false}>
            <Table
              rows={submissions}
              empty={<p className="text-sm text-slate-400 text-center py-8">No submissions yet.</p>}
              columns={[
                { key: "task", title: "Task", render: (s) => <span className="font-semibold text-slate-700">{s.task?.title || "Deleted task"}</span> },
                {
                  key: "submittedAt",
                  title: "Submitted",
                  render: (s) => (
                    <span className="text-xs text-slate-500">
                      {fmtDateTime(s.submittedAt)}
                      {s.isLate && <span className="ml-1 text-amber-600 font-semibold">late</span>}
                    </span>
                  ),
                },
                { key: "status", title: "Status", render: (s) => <StatusBadge status={s.status} map={SUBMISSION_STATUS} /> },
                {
                  key: "score",
                  title: "Score",
                  align: "right",
                  render: (s) => (s.score !== undefined && s.score !== null ? `${s.score}/${s.task?.maxScore ?? "?"}` : "—"),
                },
                {
                  key: "open",
                  title: "",
                  align: "right",
                  render: (s) => (
                    <div className="flex justify-end gap-1">
                      {s.link && (
                        <a className={btnSmall} href={s.link} target="_blank" rel="noreferrer">
                          Link
                        </a>
                      )}
                      {s.file && (
                        <button className={btnSmall} onClick={() => openFile(() => academyApi.openSubmissionFile(s._id, { download: true, fileName: s.file.name }))}>
                          <FiDownload />
                        </button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>

      <StudentDrawer isOpen={editing} onClose={() => setEditing(false)} student={student} />
      <CredentialsModal credentials={credentials} student={student} onClose={() => setCredentials(null)} />
      <FeePlanDrawer enrollment={live(feeFor)} onClose={() => setFeeFor(null)} />
      <PaymentModal enrollment={live(payFor)} onClose={() => setPayFor(null)} />
      <CertificateUploadModal enrollment={live(certFor)} studentName={student.name} onClose={() => setCertFor(null)} />

      <Drawer
        isOpen={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        title="Enroll in a course"
        subtitle={student.name}
        width="max-w-2xl"
        footer={
          <>
            <button className={btnGhost} onClick={() => setEnrollOpen(false)}>
              Cancel
            </button>
            <button
              className={btnPrimary}
              disabled={!enrollmentReady(newEnrollment) || addEnrollment.isPending}
              onClick={() =>
                addEnrollment.mutate({ studentId: student._id, ...enrollmentPayload(newEnrollment) }, { onSuccess: () => setEnrollOpen(false) })
              }
            >
              {addEnrollment.isPending ? "Saving…" : "Enroll"}
            </button>
          </>
        }
      >
        <EnrollmentFields value={newEnrollment} onChange={setNewEnrollment} courses={courses} />
      </Drawer>

      <ConfirmModal
        isOpen={confirm === "reset"}
        onClose={() => setConfirm(null)}
        title="Create a new password?"
        message="The old password and any open portal sessions stop working. You will see the new password once, to share with the student."
        confirmLabel="Create new password"
        busy={reset.isPending}
        onConfirm={() =>
          reset.mutate(student._id, {
            onSuccess: (res) => {
              setConfirm(null);
              setCredentials(res.credentials);
            },
          })
        }
      />
      <ConfirmModal
        isOpen={confirm === "delete"}
        onClose={() => setConfirm(null)}
        danger
        title="Delete this student?"
        message={`${student.name}'s enrollments, payments, submissions, attendance and certificates will be deleted for good. To keep the history, turn the portal off instead.`}
        reasonLabel={`Type the student ID (${student.studentId}) to confirm`}
        reasonRequired
        confirmLabel="Delete"
        busy={del.isPending}
        onConfirm={(typed) => {
          if (typed !== student.studentId) {
            toast.error("The student ID does not match");
            return;
          }
          del.mutate(student._id, { onSuccess: () => navigate("/academy/students") });
        }}
      />
    </div>
  );
};

export default StudentDetail;
