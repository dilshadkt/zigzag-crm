import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useGetWhatsappTemplates } from "../../leads/api";

const whatsappUrl = (phone, text) => {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`; // bare Indian mobile numbers
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

// compact: small icon-only trigger for table rows. The menu opens upward by default, downward for rows.
const WhatsAppMenu = ({ phone, name, agent, compact = false, iconOnly = false }) => {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef(null);
  const { data } = useGetWhatsappTemplates();
  const templates = data?.data || [];

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!phone) return null;
  const firstName = (name || "there").trim().split(/\s+/)[0];

  const send = (template) => {
    const text = template.text
      .replaceAll("{name}", firstName)
      .replaceAll("{agent}", agent || "your account manager");
    window.open(whatsappUrl(phone, text), "_blank", "noopener");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={compact || iconOnly ? "relative" : "relative flex-1"}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          // Open upward when the button sits in the lower half of the screen so the menu isn't clipped
          setOpenUp(event.currentTarget.getBoundingClientRect().top > window.innerHeight / 2);
          setOpen((current) => !current);
        }}
        aria-label="Send WhatsApp message"
        className={
          iconOnly
            ? "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
            : compact
              ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
              : "inline-flex w-full items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 lg:px-3 lg:py-2 lg:text-xs"
        }
      >
        <FaWhatsapp className={iconOnly ? "h-4 w-4" : "h-3.5 w-3.5"} />
        {!iconOnly && (compact ? "Msg" : "WhatsApp")}
      </button>
      {open && (
        <div
          onClick={(event) => event.stopPropagation()}
          className={`absolute z-30 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ${
            compact || iconOnly ? "right-0" : "left-0"
          } ${(compact || iconOnly) && !openUp ? "top-full mt-1" : "bottom-full mb-1"}`}
        >
          {templates.length === 0 && (
            <p className="px-2.5 py-2 text-xs text-slate-400">No templates yet. Add some in Lead Settings.</p>
          )}
          {templates.map((template) => (
            <button
              key={template._id}
              type="button"
              onClick={() => send(template)}
              className="block w-full rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
            >
              <span className="block text-xs font-semibold text-slate-800">{template.name}</span>
              <span className="line-clamp-2 text-[11px] text-slate-400">{template.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhatsAppMenu;
