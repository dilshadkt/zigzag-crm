import React from "react";
import { FiLink } from "react-icons/fi";

const LinkPreview = ({ url }) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!url) return;
    setLoading(true);

    // Using microlink API to get metadata (free tier)
    fetch(`https://api.microlink.io?url=${encodeURIComponent(url.trim())}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          setData(json.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Link preview error:", err);
        setLoading(false);
      });
  }, [url]);

  if (loading) {
    return (
      <div className="mt-2 w-full max-w-[320px] h-20 bg-gray-50/50 rounded-xl border border-gray-100/80 flex items-center gap-3 px-3 animate-pulse">
        <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-2 w-2/3 bg-gray-200 rounded"></div>
          <div className="h-2 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || (!data.title && !data.image)) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-2.5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 max-w-[450px] group/preview overflow-hidden shadow-sm"
    >
      {data.image?.url && (
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50 bg-gray-50 shadow-inner">
          <img
            src={data.image.url}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 mb-1.5">
          {data.logo?.url && (
            <img src={data.logo.url} alt="" className="w-4 h-4 rounded-md shadow-sm" />
          )}
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
            {data.publisher || data.author || "Preview"}
          </span>
        </div>
        <h6 className="text-[12px] font-bold text-gray-900 line-clamp-1 group-hover/preview:text-blue-600 transition-colors mb-1">
          {data.title}
        </h6>
        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
          {data.description}
        </p>
        <div className="mt-2 flex items-center gap-1 text-[9px] text-blue-500 font-medium opacity-0 group-hover/preview:opacity-100 transition-opacity">
          <span>View Source</span>
          <FiLink className="w-2 h-2" />
        </div>
      </div>
    </a>
  );
};

export default LinkPreview;
