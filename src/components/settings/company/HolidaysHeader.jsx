import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { Plus, Sparkles } from "lucide-react";

const HolidaysHeader = ({ holidaysCount, onAdd, onAddPresets }) => {
  return (
    <div className="pb-3 px-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-[17px] font-bold text-gray-800">
            Company Holidays
          </h2>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Set the days your company will be officially closed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[11px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            {holidaysCount} {holidaysCount === 1 ? "Holiday" : "Holidays"}
          </div>

          {/* Quick presets */}
          <button
            onClick={onAddPresets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all"
          >
            <Sparkles size={13} />
            Presets
          </button>

          {/* Custom add */}
          <PrimaryButton
            title="Add Holiday"
            icon={<Plus size={14} />}
            className="text-white px-3.5 py-1.5 font-bold text-[12px]"
            onclick={onAdd}
          />
        </div>
      </div>
    </div>
  );
};

export default HolidaysHeader;
