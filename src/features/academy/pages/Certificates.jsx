import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiAward, FiCopy, FiExternalLink, FiUpload } from "react-icons/fi";
import { Card, EmptyState, ErrorState, PageHeader, SegmentedTabs, Spinner, Table, btnSmall } from "../../accounts/components/ui";
import { useCertificates } from "../hooks/useAcademy";
import { academyApi } from "../api/academyApi";
import { useAcademy } from "../context";
import CertificateUploadModal from "../components/CertificateUploadModal";
import { errorMessage, fmtDay, verifyUrl } from "../utils";

const Certificates = () => {
  const navigate = useNavigate();
  const { permissions: p } = useAcademy();
  const { data, isLoading, isError, error, refetch } = useCertificates();
  const [view, setView] = useState("pending");
  const [uploadFor, setUploadFor] = useState(null);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const studentCell = (e) => (
    <div>
      <p className="font-semibold text-slate-700">{e.student?.name}</p>
      <p className="text-xs text-slate-400">{e.student?.studentId}</p>
    </div>
  );
  const courseCell = (e) => (
    <div className="text-xs">
      <p className="text-slate-700">{e.course?.name}</p>
      <p className="text-slate-400">{e.batch?.name || "No batch"}</p>
    </div>
  );
  const stop = (fn) => (ev) => {
    ev.stopPropagation();
    fn();
  };

  return (
    <div>
      <PageHeader
        title="Certificates"
        subtitle="Upload each student's certificate PDF. Students download it from their portal, and anyone can confirm it on the public verify page."
      />
      <Card padded={false}>
        <div className="p-4 border-b border-slate-100">
          <SegmentedTabs
            value={view}
            onChange={setView}
            tabs={[
              { value: "pending", label: "Completed, no certificate", count: data.pending.length },
              { value: "issued", label: "Issued", count: data.issued.length },
            ]}
          />
        </div>
        {view === "pending" ? (
          <Table
            rows={data.pending}
            onRowClick={(e) => navigate(`/academy/students/${e.student._id}`)}
            empty={<EmptyState icon={FiAward} title="All caught up" text="Students whose course is marked completed show up here until their certificate is uploaded." />}
            columns={[
              { key: "student", title: "Student", render: studentCell },
              { key: "course", title: "Course", render: courseCell },
              { key: "completedAt", title: "Completed", render: (e) => <span className="text-xs">{fmtDay(e.completedAt)}</span> },
              {
                key: "upload",
                title: "",
                align: "right",
                render: (e) =>
                  p.issueCertificates && (
                    <button className={btnSmall} onClick={stop(() => setUploadFor(e))}>
                      <FiUpload /> Upload
                    </button>
                  ),
              },
            ]}
          />
        ) : (
          <Table
            rows={data.issued}
            onRowClick={(e) => navigate(`/academy/students/${e.student._id}`)}
            empty={<EmptyState icon={FiAward} title="No certificates issued yet" />}
            columns={[
              { key: "number", title: "Certificate", render: (e) => <span className="font-mono text-xs font-semibold text-slate-700">{e.certificate.number}</span> },
              { key: "student", title: "Student", render: studentCell },
              { key: "course", title: "Course", className: "hidden md:table-cell", render: courseCell },
              { key: "issuedAt", title: "Issued", render: (e) => <span className="text-xs">{fmtDay(e.certificate.issuedAt)}</span> },
              {
                key: "actions",
                title: "",
                align: "right",
                render: (e) => (
                  <div className="flex justify-end gap-1">
                    {e.certificate.hasFile && (
                      <button
                        className={btnSmall}
                        onClick={stop(() => academyApi.openCertificateFile(e._id).catch((err) => toast.error(errorMessage(err))))}
                      >
                        <FiExternalLink /> View
                      </button>
                    )}
                    <button
                      className={btnSmall}
                      title="Copy verify link"
                      onClick={stop(() =>
                        navigator.clipboard
                          .writeText(verifyUrl(e.certificate.number))
                          .then(() => toast.success("Verify link copied"))
                          .catch(() => toast.error("Could not copy"))
                      )}
                    >
                      <FiCopy />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>
      <CertificateUploadModal enrollment={uploadFor} studentName={uploadFor?.student?.name} onClose={() => setUploadFor(null)} />
    </div>
  );
};

export default Certificates;
