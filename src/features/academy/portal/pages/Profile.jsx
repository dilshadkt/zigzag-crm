import React from "react";
import { usePortal } from "../portalContext";
import ChangePassword from "../ChangePassword";
import PhotoCard from "../PhotoCard";
import { InfoRow, PageTitle, Panel } from "../ui";
import { fmtDay } from "../../utils";

const Profile = () => {
  const { student, refetch } = usePortal();
  return (
    <div>
      <PageTitle title="My profile" subtitle="You can change your photo and password. For other details, contact the academy office." />
      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 items-start">
        <PhotoCard student={student} />
        <div className="space-y-3 min-w-0">
          <Panel title="Details">
            <dl>
              <InfoRow label="Name" value={student.name} />
              <InfoRow label="Student ID" value={student.studentId} />
              <InfoRow label="Phone" value={student.phone} />
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Date of birth" value={student.dob ? fmtDay(student.dob) : null} />
              <InfoRow label="Qualification" value={student.qualification} />
              <InfoRow label="Address" value={student.address} />
              <InfoRow label="Guardian" value={[student.guardianName, student.guardianPhone].filter(Boolean).join(" · ")} />
            </dl>
          </Panel>
          <Panel title="Change password">
            <div className="max-w-md">
              <ChangePassword student={student} onDone={refetch} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Profile;
