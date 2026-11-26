import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiCopy, FiGlobe, FiPlus } from "react-icons/fi";
import {
  useCreateSite,
  useRegenerateKey,
  useSiteOptions,
  useUpdateSite,
  useWebsiteMeta,
} from "../../../features/website/hooks/useWebsite";
import { publicSiteUrl } from "../../../features/website/api/websiteApi";
import {
  ConfirmModal,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  Spinner,
  StatusBadge,
  btnGhost,
  btnPrimary,
  btnSmall,
  inputCls,
  selectCls,
} from "../../../features/accounts/components/ui";

const KINDS = {
  agency: { label: "Agency website", hint: "Works, blogs, pages, experts, client logos, testimonials, offers and careers" },
  academy: { label: "Academy website", hint: "Blogs, testimonials, stories, certifications, placements, gallery, pages and events" },
};
const STATE = {
  on: { label: "Connected", cls: "bg-emerald-50 text-emerald-700" },
  off: { label: "Turned off", cls: "bg-slate-100 text-slate-600" },
};

const when = (value) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Not yet";

const Detail = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-semibold text-slate-400">{label}</dt>
    <dd className="text-sm text-slate-700 break-words">{children}</dd>
  </div>
);

const SiteForm = ({ site, options, onClose }) => {
  const create = useCreateSite();
  const update = useUpdateSite();
  const [form, setForm] = useState({
    name: site?.name || "",
    kind: site?.kind || "agency",
    domains: (site?.domains || []).join("\n"),
    project: site?.leads?.project || "",
    owner: site?.leads?.owner || "",
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const busy = create.isPending || update.isPending;

  const save = (e) => {
    e.preventDefault();
    const body = {
      name: form.name,
      domains: form.domains,
      leads: { project: form.project || null, owner: form.owner || null },
    };
    const done = { onSuccess: onClose };
    if (site) update.mutate({ id: site._id, ...body }, done);
    else create.mutate({ ...body, kind: form.kind }, done);
  };

  return (
    <Drawer
      isOpen
      onClose={onClose}
      title={site ? "Edit website" : "Connect a website"}
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="website-form" className={btnPrimary} disabled={busy || !form.name.trim()}>
            {busy ? "Saving…" : site ? "Save" : "Connect"}
          </button>
        </>
      }
    >
      <form id="website-form" onSubmit={save} className="space-y-4">
        <Field label="Website name" required>
          <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Zigzag Digital Solutions" maxLength={80} />
        </Field>
        <Field label="Website type" hint={KINDS[form.kind].hint}>
          <select className={selectCls} value={form.kind} onChange={set("kind")} disabled={Boolean(site)}>
            {Object.entries(KINDS).map(([value, kind]) => (
              <option key={value} value={value}>
                {kind.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Web addresses"
          hint="One per line. Enquiry forms are accepted only from these (and their subdomains). Leave empty to accept from anywhere."
        >
          <textarea className={inputCls} rows={3} value={form.domains} onChange={set("domains")} placeholder="zigzagdigitalsolutions.com" />
        </Field>
        <Field label="File enquiries under client" hint="Website enquiries become leads of this client.">
          <select className={selectCls} value={form.project} onChange={set("project")}>
            <option value="">No client</option>
            {(options?.clients || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Default lead owner" hint="Used when no lead assignment rule matches. Without one, a company admin owns the lead.">
          <select className={selectCls} value={form.owner} onChange={set("owner")}>
            <option value="">A company admin</option>
            {(options?.owners || []).map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
                {u.isAdmin ? " (admin)" : ""}
              </option>
            ))}
          </select>
        </Field>
      </form>
    </Drawer>
  );
};

const SiteCard = ({ site, options, onEdit, onNewKey }) => {
  const update = useUpdateSite();
  const url = publicSiteUrl(site.siteKey);
  const nameIn = (list, id) => list?.find((x) => x._id === id)?.name;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Address copied");
    } catch {
      toast.error("Could not copy. Select the address and copy it yourself.");
    }
  };

  return (
    <li className="rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">{site.name}</h3>
            <StatusBadge status={site.isActive ? "on" : "off"} map={STATE} />
          </div>
          <p className="text-xs text-slate-500">{KINDS[site.kind].label}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btnSmall} onClick={() => onEdit(site)}>
            Edit
          </button>
          <button className={btnSmall} onClick={() => onNewKey(site)}>
            New address
          </button>
          <button className={btnSmall} disabled={update.isPending} onClick={() => update.mutate({ id: site._id, isActive: !site.isActive })}>
            {site.isActive ? "Turn off" : "Turn on"}
          </button>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-slate-400 mb-1">
          API address (set as <code>NEXT_PUBLIC_BASE_URL</code> where the website is hosted, then redeploy it)
        </p>
        <div className="flex items-center gap-2">
          <input readOnly value={url} onFocus={(e) => e.target.select()} className={`${inputCls} font-mono !text-xs`} aria-label={`API address of ${site.name}`} />
          <button className={btnSmall} onClick={copy} aria-label="Copy address">
            <FiCopy /> Copy
          </button>
        </div>
      </div>

      <dl className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <Detail label="Web addresses">{site.domains.join(", ") || "Any"}</Detail>
        <Detail label="Enquiries go to">{nameIn(options?.clients, site.leads?.project) || "No client"}</Detail>
        <Detail label="Default owner">{nameIn(options?.owners, site.leads?.owner) || "A company admin"}</Detail>
        <Detail label="Last visit from the site">{when(site.lastRequestAt)}</Detail>
        <Detail label="Last enquiry">{when(site.lastEnquiryAt)}</Detail>
      </dl>
    </li>
  );
};

/** Settings > Integration: connects public websites to the CRM (admins only). */
const WebsiteConnections = () => {
  const { data, isLoading, isError, error, refetch } = useWebsiteMeta();
  const { data: options } = useSiteOptions(Boolean(data?.permissions?.isAdmin));
  const regenerate = useRegenerateKey();
  const [editing, setEditing] = useState(null); // a site, or "new"
  const [renewing, setRenewing] = useState(null);
  const sites = data?.sites || [];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <FiGlobe className="w-7 h-7 text-[#3F8CFF]" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-gray-800">Websites</h2>
            <p className="text-[12px] text-gray-500 max-w-lg">
              Connect your websites so their content is managed in the CRM and their enquiry forms arrive as leads.
            </p>
            {sites.length > 0 && (
              <Link to="/website" className="text-xs font-semibold text-[#3F8CFF] hover:underline">
                Manage content
              </Link>
            )}
          </div>
        </div>
        <button className={btnPrimary} onClick={() => setEditing("new")} disabled={!data}>
          <FiPlus /> Connect website
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !sites.length ? (
        <EmptyState title="No website connected yet" text="Connect each website once, then give it the address shown here." />
      ) : (
        <ul className="space-y-3">
          {sites.map((site) => (
            <SiteCard key={site._id} site={site} options={options} onEdit={setEditing} onNewKey={setRenewing} />
          ))}
        </ul>
      )}
      {data && !data.uploadsReady && (
        <p className="mt-3 text-xs text-amber-600">
          Image uploads are off. Add the AWS keys, AWS_REGION and AWS_S3_BUCKET to the API .env, then restart the server.
        </p>
      )}

      {editing && <SiteForm site={editing === "new" ? null : editing} options={options} onClose={() => setEditing(null)} />}
      <ConfirmModal
        isOpen={Boolean(renewing)}
        onClose={() => setRenewing(null)}
        title="Create a new address?"
        message={renewing && `${renewing.name} stops receiving content and enquiries until it is given the new address.`}
        confirmLabel="Create new address"
        danger
        busy={regenerate.isPending}
        onConfirm={() => regenerate.mutate(renewing._id, { onSuccess: () => setRenewing(null) })}
      />
    </div>
  );
};

export default WebsiteConnections;
