import React from "react";
import { FiLink } from "react-icons/fi";
import { getVoiceUrls } from "../../../utils/categoryFields";

const renderContent = (content) => {
  if (!content) return "";
  const decoded = String(content)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const isHtml = /<[a-z/][\s\S]*?>/i.test(decoded);
  if (isHtml) {
    return <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: decoded }} />;
  }
  return <div className="whitespace-pre-wrap">{decoded}</div>;
};

const CategoryFieldValue = ({ field, className = "text-xs text-gray-700 leading-relaxed" }) => {
  if (!field) return null;

  if (field.type === "voice") {
    const urls = getVoiceUrls(field.value);
    if (!urls.length) return null;
    return (
      <div className="space-y-1.5">
        {urls.map((url, index) => (
          <audio key={`${url}-${index}`} src={url} controls className="h-8 w-full max-w-md" />
        ))}
      </div>
    );
  }

  const text = String(field.value ?? "").trim();
  if (!text) return null;

  const isLink = field.type === "url" || text.startsWith("http");
  if (isLink) {
    return (
      <a
        href={text.startsWith("http") ? text : `https://${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-2 break-all"
      >
        {text}
        <FiLink className="w-2.5 h-2.5 shrink-0" />
      </a>
    );
  }

  return <div className={className}>{renderContent(text)}</div>;
};

export default CategoryFieldValue;
