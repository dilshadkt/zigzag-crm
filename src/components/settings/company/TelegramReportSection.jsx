import React, { useState, useEffect } from "react";

const TelegramReportSection = ({ config, isLoading, error, onSave, isSaving }) => {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("18:00");

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled ?? false);
      setTime(config.time || "18:00");
    }
  }, [config]);

  const handleSave = () => {
    onSave({ enabled, time });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 p-5 flex items-center justify-center min-h-[100px]">
        <span className="text-sm text-gray-500">Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-100 p-5 text-red-600 text-sm">
        Failed to load Telegram settings.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="p-5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-800">Enable Daily Reports</h3>
            <p className="text-xs text-gray-500 mt-1">
              Receive a daily summary of employee tasks, new leads, and active leaves.
            </p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={enabled} 
              onChange={() => setEnabled(!enabled)} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {enabled && (
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Report Time (24h format)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="mt-5 text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Ensure your bot is set up properly first!</span>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 text-xs font-medium text-white rounded-md transition-colors ${
              isSaving
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramReportSection;
