import { FiFileText, FiLink } from "react-icons/fi";

// Reference files / links attached to a rework (e.g. a client rejection)
const ReworkAttachmentList = ({ items }) => {
  if (!items?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <a
          key={item._id || `${item.url}-${index}`}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-[220px] items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100"
        >
          {item.kind === "link" ? (
            <FiLink className="h-3 w-3 shrink-0" />
          ) : (
            <FiFileText className="h-3 w-3 shrink-0" />
          )}
          <span className="truncate">{item.name || item.url}</span>
        </a>
      ))}
    </div>
  );
};

export default ReworkAttachmentList;
