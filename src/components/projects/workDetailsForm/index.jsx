import React from "react";
import CategoryQuotaSection from "./CategoryQuotaSection";

const WorkDetailsForm = ({ values, setFieldValue, isEditMode = false }) => {
  if (!values.workDetails) {
    values.workDetails = {
      reels: { count: 0, total: 0 },
      poster: { count: 0, total: 0 },
      motionPoster: { count: 0, total: 0 },
      shooting: { count: 0, total: 0 },
      motionGraphics: { count: 0, total: 0 },
      other: [],
    };
  }

  return (
    <div className="flex flex-col gap-y-4">
      <CategoryQuotaSection
        workDetails={values.workDetails}
        onChange={(next) => setFieldValue("workDetails", next)}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default WorkDetailsForm;
