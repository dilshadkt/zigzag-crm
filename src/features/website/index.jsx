import React, { useMemo } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { FiGlobe } from "react-icons/fi";
import { WebsiteContext, useWebsite } from "./context";
import { useSectionCounts, useWebsiteMeta } from "./hooks/useWebsite";
import { EmptyState, ErrorState, SegmentedTabs, Spinner, btnPrimary } from "../accounts/components/ui";
import ContentList from "./pages/ContentList";
import EntryEditor from "./pages/EntryEditor";

const NoWebsites = ({ isAdmin }) => (
  <section className="rounded-2xl bg-white h-full flex items-center justify-center">
    <EmptyState
      icon={FiGlobe}
      title="No website connected yet"
      text={
        isAdmin
          ? "Connect your websites in Settings > Integration. Their content is then managed here."
          : "Ask a company admin to connect the websites in Settings > Integration."
      }
      action={
        isAdmin && (
          <Link to="/settings/integration" className={btnPrimary}>
            Connect a website
          </Link>
        )
      }
    />
  </section>
);

const SiteShell = () => {
  const { siteId } = useParams();
  const { sites, types } = useWebsite();
  const site = sites.find((s) => s._id === siteId);
  if (!site) return <Navigate to="/website" replace />;
  return <SiteContent key={site._id} site={site} sections={types[site.kind] || []} />;
};

const SiteContent = ({ site, sections }) => {
  const { sites, types } = useWebsite();
  const { data: counts } = useSectionCounts(site._id);
  const navigate = useNavigate();
  const rest = useParams()["*"] || "";
  const [typeKey, entryId] = rest.split("/");
  const typeDef = sections.find((t) => t.key === typeKey);
  if (!typeDef) return <Navigate to={`/website/${site._id}/${sections[0].key}`} replace />;

  const openSite = (id) => {
    const next = sites.find((s) => s._id === id);
    navigate(`/website/${id}/${types[next.kind][0].key}`);
  };

  // The editor takes the whole screen, so a stray tab click cannot drop edits
  if (entryId) {
    return (
      <section className="flex flex-col rounded-2xl overflow-hidden h-full bg-white">
        <Routes>
          <Route path=":type/:entryId" element={<EntryEditor key={rest} site={site} typeDef={typeDef} />} />
        </Routes>
      </section>
    );
  }

  return (
    <section className="flex flex-col rounded-2xl overflow-hidden h-full bg-white">
      <header className="px-4 md:px-6 pt-4 border-b border-slate-100 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-bold text-slate-800">Websites</h1>
            {!site.isActive && (
              <p className="text-xs font-semibold text-amber-600">This website is turned off: it receives nothing from the CRM.</p>
            )}
          </div>
          {sites.length > 1 && (
            <SegmentedTabs tabs={sites.map((s) => ({ value: s._id, label: s.name }))} value={site._id} onChange={openSite} />
          )}
        </div>
        <nav className="flex gap-1 overflow-x-auto hide-scrollbar -mb-px" aria-label="Website sections">
          {sections.map((t) => (
            <NavLink
              key={t.key}
              to={`/website/${site._id}/${t.key}`}
              className={({ isActive }) =>
                `px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? "border-[#3F8CFF] text-[#3F8CFF]" : "border-transparent text-slate-500 hover:text-slate-800"
                }`
              }
            >
              {t.label}
              {counts?.counts?.[t.key] > 0 && <span className="ml-1.5 text-xs text-slate-400">{counts.counts[t.key]}</span>}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAFCFE]">
        <ContentList key={typeDef.key} site={site} typeDef={typeDef} />
      </div>
    </section>
  );
};

const Website = () => {
  const { data, isLoading, isError, error, refetch } = useWebsiteMeta();

  const value = useMemo(
    () => ({
      permissions: data?.permissions || {},
      sites: data?.sites || [],
      types: data?.types || {},
      uploadsReady: Boolean(data?.uploadsReady),
    }),
    [data]
  );

  if (isLoading) return <Spinner />;
  if (isError || !data) {
    return (
      <section className="rounded-2xl bg-white h-full">
        <ErrorState error={error?.message ? error : "You do not have access to website content."} onRetry={refetch} />
      </section>
    );
  }
  if (!value.sites.length) return <NoWebsites isAdmin={value.permissions.isAdmin} />;

  const first = value.sites[0];
  const home = `/website/${first._id}/${value.types[first.kind][0].key}`;

  return (
    <WebsiteContext.Provider value={value}>
      <Routes>
        <Route index element={<Navigate to={home} replace />} />
        <Route path=":siteId/*" element={<SiteShell />} />
      </Routes>
    </WebsiteContext.Provider>
  );
};

export default Website;
