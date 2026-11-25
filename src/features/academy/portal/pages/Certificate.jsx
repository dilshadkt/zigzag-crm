import React from "react";
import { toast } from "react-hot-toast";
import { FiAward, FiDownload, FiExternalLink } from "react-icons/fi";
import studentClient from "../studentClient";
import { openProtectedFile } from "../../api/academyApi";
import { usePortal } from "../portalContext";
import { InfoRow, NoEnrollment, PageTitle, Panel, Pill } from "../ui";
import { ENROLLMENT_STATUS, fmtDay, fmtPercent, verifyUrl } from "../../utils";

const Certificate = () => {
  const { enrollment: e } = usePortal();
  if (!e) return <NoEnrollment />;
  const cert = e.certificate;
  const url = `/enrollments/${e._id}/certificate/file`;
  const fileName = cert?.fileName || `${cert?.number}.pdf`;

  return (
    <div>
      <PageTitle title="Certificate" subtitle={e.course?.name} />
      <div className="grid xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 items-start">
        <Panel>
          {!cert ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 rounded-[24px] bg-[#F4F9FD] text-[#91929E] flexCenter mb-4">
                <FiAward className="w-9 h-9" />
              </div>
              <p className="text-lg font-bold text-[#0A1629]">Not issued yet</p>
              <p className="text-sm text-[#7D8592] mt-1 max-w-sm mx-auto">
                Your certificate will appear here once you complete the course and the academy uploads it.
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-20 h-20 rounded-[24px] bg-gradient-to-br from-violet-500 to-[#3F8CFF] text-white flexCenter mb-4 shadow-lg shadow-violet-200">
                <FiAward className="w-9 h-9" />
              </div>
              <p className="text-xl font-bold text-[#0A1629]">Congratulations!</p>
              <p className="text-sm text-[#7D8592] mt-1">
                Certificate <span className="font-mono font-semibold text-[#0A1629]">{cert.number}</span> · issued {fmtDay(cert.issuedAt)}
              </p>
              {cert.hasFile && (
                <div className="flex flex-col sm:flex-row justify-center gap-2 mt-6">
                  <button
                    onClick={() => openProtectedFile(studentClient, url, { download: true, fileName }).catch(() => toast.error("Could not download"))}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[14px] bg-[#3F8CFF] text-white font-bold hover:bg-blue-600"
                  >
                    <FiDownload /> Download PDF
                  </button>
                  <button
                    onClick={() => openProtectedFile(studentClient, url).catch(() => toast.error("Could not open"))}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[14px] bg-[#F4F9FD] text-[#0A1629] font-bold hover:bg-[#ECF3FF]"
                  >
                    <FiExternalLink /> View
                  </button>
                </div>
              )}
              <div className="mt-8 rounded-2xl bg-[#F4F9FD] p-4 text-left">
                <p className="text-xs font-bold text-[#0A1629]">Share this link so employers can check your certificate is genuine:</p>
                <a href={verifyUrl(cert.number)} target="_blank" rel="noreferrer" className="text-xs text-[#3F8CFF] break-all">
                  {verifyUrl(cert.number)}
                </a>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Course summary">
          <dl>
            <InfoRow label="Status" value={<Pill status={e.status} map={ENROLLMENT_STATUS} />} />
            <InfoRow label="Attendance" value={fmtPercent(e.attendance?.percent)} />
            <InfoRow label="Tasks submitted" value={`${e.tasks?.submitted || 0} of ${e.tasks?.total || 0}`} />
            <InfoRow label="Average score" value={fmtPercent(e.tasks?.averageScorePercent)} />
            {e.completedAt && <InfoRow label="Completed on" value={fmtDay(e.completedAt)} />}
          </dl>
        </Panel>
      </div>
    </div>
  );
};

export default Certificate;
