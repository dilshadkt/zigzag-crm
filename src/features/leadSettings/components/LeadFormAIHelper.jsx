import { useState } from "react";
import { FiMessageCircle, FiX, FiLoader } from "react-icons/fi";
import apiClient from "../../../api/client";

const AI_PROMPT_TEMPLATE = (userPrompt) => `
You are an assistant that designs CRM lead capture forms.
Respond ONLY with JSON in the following format:
{
  "fields": [
    {
      "label": "Field label",
      "type": "text|textarea|email|tel|number|select|checkbox",
      "required": true|false,
      "placeholder": "optional placeholder",
      "options": ["Option 1", "Option 2"] // only for select
    }
  ]
}
Use the user's requirements to decide the fields. Keep field count between 3 and 8.
User request: ${userPrompt}
`;

const FIELD_TYPE_FALLBACK = "text";
const SUPPORTED_TYPES = [
  "text",
  "textarea",
  "email",
  "tel",
  "number",
  "select",
  "checkbox",
];

const LeadFormAIHelper = ({ onReplaceFields, setPreviewMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    setError("");
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError("Describe how the form should look first.");
      return;
    }
    if (!onReplaceFields) return;

    try {
      setIsGenerating(true);
      setError("");

      const { data } = await apiClient.post("/ai/chat", {
        message: AI_PROMPT_TEMPLATE(prompt.trim()),
      });

      if (!data?.success) {
        throw new Error(data?.message || "AI request failed");
      }

      const parsedFields = extractFieldsFromResponse(data.data?.response);
      if (!parsedFields.length) {
        throw new Error("Could not understand AI response. Try again.");
      }

      onReplaceFields(parsedFields);
      setPreviewMessage?.("Form generated via AI");
      setHistory((prev) => [
        ...prev,
        { role: "user", content: prompt.trim() },
        { role: "assistant", content: "Generated a form configuration." },
      ]);
      setPrompt("");
    } catch (err) {
      setError(err.message || "Unable to generate form");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        aria-label="Open AI form helper"
        className="fixed bottom-12 right-12 z-40 w-12 h-12 rounded-full bg-[#3f8cff] text-white shadow-lg flex items-center justify-center hover:bg-[#3673ff] transition-colors"
        onClick={toggleOpen}
      >
        <FiMessageCircle size={20} />
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 px-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">
                  AI Form assistant
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Describe the form you need
                </h3>
              </div>
              <button
                aria-label="Close AI helper"
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
                onClick={toggleOpen}
              >
                <FiX size={18} />
              </button>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: Create a lead form for software demos including company size, preferred contact time, and budget."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-[#3f8cff]"
            />

            {history.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-3 max-h-40 overflow-auto text-xs text-slate-500 space-y-2">
                {history.map((entry, index) => (
                  <p key={index}>
                    <span className="font-semibold text-slate-700">
                      {entry.role === "user" ? "You" : "Assistant"}:
                    </span>{" "}
                    {entry.content}
                  </p>
                ))}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isGenerating}
              className="w-full h-11 rounded-2xl bg-[#3f8cff] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <FiLoader className="animate-spin" />
                  Generating form...
                </>
              ) : (
                "Generate with AI"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const extractFieldsFromResponse = (responseText = "") => {
  if (!responseText) return [];

  const jsonMatch = responseText.match(/```json([\s\S]*?)```/i);
  const plainMatch = responseText.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch
    ? jsonMatch[1]
    : plainMatch
    ? plainMatch[0]
    : responseText;

  try {
    const parsed = JSON.parse(jsonString);
    const fields = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.fields)
      ? parsed.fields
      : [];
    return fields
      .map((field) => ({
        label: field.label || "Untitled Field",
        type: normalizeType(field.type),
        required: Boolean(field.required),
        placeholder: field.placeholder || "",
        options:
          field.type === "select" && Array.isArray(field.options)
            ? field.options
            : [],
      }))
      .map((field, index) => ({
        ...field,
        id: `ai-field-${index}-${Date.now()}`,
      }));
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return [];
  }
};

const normalizeType = (type = "") => {
  const normalized = type.toLowerCase().trim();
  if (SUPPORTED_TYPES.includes(normalized)) {
    return normalized;
  }
  if (normalized.includes("phone")) return "tel";
  if (normalized.includes("email")) return "email";
  if (normalized.includes("number") || normalized.includes("numeric"))
    return "number";
  if (normalized.includes("dropdown") || normalized.includes("select"))
    return "select";
  if (normalized.includes("checkbox")) return "checkbox";
  if (normalized.includes("text area") || normalized.includes("long"))
    return "textarea";
  return FIELD_TYPE_FALLBACK;
};

export default LeadFormAIHelper;
