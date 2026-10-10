import React, { useState, useEffect } from "react";

const emptyRecipient = () => ({ label: "", chatId: "" });

const TelegramReportSection = ({
  config, isLoading, error, onSave, isSaving,
  subscribers = [], subscribersLoading,
  onRegisterWebhook, onRemoveWebhook, isRegisteringWebhook, isRemovingWebhook,
  onRemoveSubscriber,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("18:00");
  const [botToken, setBotToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [recipients, setRecipients] = useState([emptyRecipient()]);

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled ?? false);
      setTime(config.time || "18:00");
      setBotToken(config.botToken || "");
      setRecipients(
        config.recipients?.length
          ? config.recipients.map(r => ({ label: r.label || "", chatId: r.chatId || "" }))
          : [emptyRecipient()]
      );
    }
  }, [config]);

  const handleRecipientChange = (index, field, value) => {
    setRecipients(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const handleAddRecipient = () => setRecipients(prev => [...prev, emptyRecipient()]);

  const handleRemoveRecipient = (index) => {
    setRecipients(prev => prev.length === 1 ? [emptyRecipient()] : prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const filteredRecipients = recipients.filter(r => r.chatId.trim() !== "");
    onSave({ enabled, time, botToken, recipients: filteredRecipients });
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

  const validRecipients = recipients.filter(r => r.chatId.trim() !== "");

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="p-5 flex flex-col gap-6">

        {/* Enable toggle */}
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

        {/* Bot Token */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bot Token</label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Paste your bot token from @BotFather"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-16"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {showToken ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Create a bot via <span className="font-medium">@BotFather</span> and paste its token here.
          </p>
        </div>

        {/* Auto-subscribe via Webhook */}
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4 flex flex-col gap-3">
          <div>
            <h4 className="text-xs font-semibold text-indigo-800">Auto-Subscribe Anyone Who Messages the Bot</h4>
            <p className="text-[11px] text-indigo-600 mt-1">
              Register a webhook so anyone who sends <span className="font-mono font-medium">/start</span> to your bot is automatically added as a recipient. They can send <span className="font-mono font-medium">/stop</span> to unsubscribe.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRegisterWebhook}
              disabled={!botToken || isRegisteringWebhook}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isRegisteringWebhook ? "Registering..." : "Register Webhook"}
            </button>
            <button
              type="button"
              onClick={onRemoveWebhook}
              disabled={!botToken || isRemovingWebhook}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 rounded-md transition-colors"
            >
              {isRemovingWebhook ? "Removing..." : "Remove Webhook"}
            </button>
          </div>
        </div>

        {/* Subscribers list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-700">
              Auto-Subscribers
              <span className="ml-2 text-[11px] font-normal text-gray-400">
                ({subscribersLoading ? "..." : subscribers.length} subscribed)
              </span>
            </label>
          </div>
          {subscribersLoading ? (
            <p className="text-xs text-gray-400">Loading subscribers...</p>
          ) : subscribers.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No auto-subscribers yet. Register the webhook and have users send /start to the bot.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {subscribers.map((sub) => (
                <div key={sub.chatId} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                      {(sub.firstName || sub.username || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-700">
                        {sub.firstName || sub.username || "Unknown"}
                      </span>
                      {sub.username && (
                        <span className="ml-1 text-[11px] text-gray-400">@{sub.username}</span>
                      )}
                      <span className="ml-2 text-[10px] text-gray-400 font-mono">{sub.chatId}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSubscriber(sub.chatId)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    title="Remove subscriber"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual recipients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-700">
              Manual Recipients
              {validRecipients.length > 0 && (
                <span className="ml-2 text-[11px] font-normal text-gray-400">({validRecipients.length} active)</span>
              )}
            </label>
            <button
              type="button"
              onClick={handleAddRecipient}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={recipient.label}
                  onChange={(e) => handleRecipientChange(index, "label", e.target.value)}
                  placeholder="Label (e.g. Manager)"
                  className="w-36 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={recipient.chatId}
                  onChange={(e) => handleRecipientChange(index, "chatId", e.target.value)}
                  placeholder="Chat ID"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(index)}
                  className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Open{" "}
            <span className="font-mono bg-gray-100 px-1 rounded">
              https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates
            </span>{" "}
            after messaging the bot to find Chat IDs.
          </p>
        </div>

        {/* Report time */}
        {enabled && (
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Report Time (24h)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {(!botToken || (validRecipients.length === 0 && subscribers.length === 0)) && (
              <div className="mt-5 text-xs text-amber-600 flex items-center gap-1">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{!botToken ? "Bot Token is required." : "Add at least one recipient or register the webhook."}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 text-xs font-medium text-white rounded-md transition-colors ${
              isSaving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
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
