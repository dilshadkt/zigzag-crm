import React from "react";
import { Link } from "react-router-dom";
import { FiUserCheck, FiUserPlus } from "react-icons/fi";

const pill = "inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap";

/**
 * On a lead: "Convert" for academy leads, or a link to the student once the
 * lead has been converted. Renders nothing for everything else.
 * The drawer lives on the page (see ConvertLeadDrawer) so it survives the
 * lead leaving the current list.
 */
const LeadStudentButton = ({ lead, conversion, onConvert, label = "Convert", iconOnly = false, className }) => {
  if (!conversion.allowed || !lead) return null;
  const studentId = conversion.studentFor(lead._id || lead.id);

  if (studentId) {
    return (
      <Link
        to={`/academy/students/${studentId}`}
        className={className || (iconOnly ? "flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15 text-violet-600" : `${pill} bg-violet-50 text-violet-700 hover:bg-violet-100`)}
        title="Open the student record"
        aria-label="Open the student record"
      >
        <FiUserCheck className="h-3.5 w-3.5" />
        {!iconOnly && "Student"}
      </Link>
    );
  }
  if (!conversion.isAcademyLead(lead)) return null;

  return (
    <button
      type="button"
      onClick={() => onConvert(lead)}
      className={className || (iconOnly ? "flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15 text-violet-600" : `${pill} bg-violet-50 text-violet-700 hover:bg-violet-100`)}
      title="Convert to student"
      aria-label="Convert to student"
    >
      <FiUserPlus className="h-3.5 w-3.5" />
      {!iconOnly && label}
    </button>
  );
};

export default LeadStudentButton;
