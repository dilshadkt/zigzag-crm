import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { IoClose } from "react-icons/io5";
import { FiMinus, FiPlus, FiMaximize, FiSearch, FiAlertTriangle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import apiClient from "../../../api/client";
import Workstation, { ScreenClip, VIEWBOX } from "./Workstation";
import OfficeRoom from "./OfficeRoom";
import PersonCard from "./PersonCard";
import { buildLayout } from "./layout";
import { roleFor, lookFor, STATE_META, STATE_ORDER } from "./roles";
import "./virtualOffice.css";

const REFRESH_MS = 60000;
const MIN_SCALE = 0.2;
const MAX_SCALE = 2.2;

const useVirtualOffice = () =>
  useQuery({
    queryKey: ["virtualOffice"],
    queryFn: async () => (await apiClient.get("/dashboard/virtual-office")).data,
    refetchInterval: REFRESH_MS,
    refetchIntervalInBackground: false,
    staleTime: 30000,
    // The client rejects with the response body; a permission error won't fix itself
    retry: (count, error) => count < 2 && !/access/i.test(error?.message || ""),
  });

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

const VirtualOfficeModal = ({ onClose }) => {
  const { data, isLoading, isError, error, dataUpdatedAt, isFetching } = useVirtualOffice();
  const people = useMemo(() => data?.data || [], [data]);

  const [stateFilter, setStateFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [view, setView] = useState({ x: 0, y: 0, s: 1 });
  const [dragging, setDragging] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(() => window.innerWidth >= 640);

  const viewportRef = useRef(null);
  const tooltipRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef(null);
  const moved = useRef(false);
  const fittedFor = useRef(null);

  // Precompute look and role once per person; the station only re-renders when its data changes
  const enriched = useMemo(
    () =>
      people.map((person) => {
        const role = roleFor(person.position);
        return { ...person, role, look: lookFor(person, role) };
      }),
    [people]
  );
  const layout = useMemo(() => buildLayout(enriched), [enriched]);

  const counts = useMemo(() => {
    const c = Object.fromEntries(STATE_ORDER.map((s) => [s, 0]));
    enriched.forEach((p) => (c[p.state] = (c[p.state] || 0) + 1));
    return c;
  }, [enriched]);
  const stats = useMemo(
    () => ({
      done: enriched.reduce((sum, p) => sum + p.completedCount, 0),
      open: enriched.reduce((sum, p) => sum + p.openCount, 0),
      overloaded: counts.overloaded,
      working: counts.working + counts.overloaded,
    }),
    [enriched, counts]
  );
  const departments = useMemo(() => layout.zones.map((z) => z.name), [layout]);
  const overloaded = useMemo(
    () => enriched.filter((p) => p.state === "overloaded").sort((a, b) => b.openCount / b.limit - a.openCount / a.limit),
    [enriched]
  );

  const query = search.trim().toLowerCase();
  const isMatch = useCallback(
    (p) =>
      (!stateFilter || p.state === stateFilter) &&
      (!department || (p.department || "General") === department) &&
      (!query || p.name.toLowerCase().includes(query) || p.position.toLowerCase().includes(query)),
    [stateFilter, department, query]
  );
  const filtering = !!(stateFilter || department || query);

  /* ---------- pan & zoom ---------- */

  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el || !layout.width) return;
    const { width, height } = el.getBoundingClientRect();
    const s = clamp(Math.min(width / layout.width, height / layout.height) * 0.94, MIN_SCALE, 1.15);
    setView({ s, x: (width - layout.width * s) / 2, y: (height - layout.height * s) / 2 });
  }, [layout]);

  useLayoutEffect(() => {
    if (!people.length) return;
    const key = `${layout.width}x${layout.height}`;
    if (fittedFor.current === key) return;
    fittedFor.current = key;
    fit();
  }, [fit, layout, people.length]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setView((v) => {
        const s = clamp(v.s * Math.exp(-e.deltaY * 0.0015), MIN_SCALE, MAX_SCALE);
        return { s, x: px - ((px - v.x) * s) / v.s, y: py - ((py - v.y) * s) / v.s };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isLoading]);

  const zoomBy = (factor) => {
    const el = viewportRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setView((v) => {
      const s = clamp(v.s * factor, MIN_SCALE, MAX_SCALE);
      return { s, x: width / 2 - ((width / 2 - v.x) * s) / v.s, y: height / 2 - ((height / 2 - v.y) * s) / v.s };
    });
  };

  const placeTooltip = () => {
    const el = tooltipRef.current;
    if (!el) return;
    const { innerWidth, innerHeight } = window;
    const w = el.offsetWidth || 320;
    const h = el.offsetHeight || 300;
    let x = pointer.current.x + 18;
    let y = pointer.current.y + 18;
    if (x + w > innerWidth - 12) x = pointer.current.x - w - 18;
    if (y + h > innerHeight - 12) y = innerHeight - h - 12;
    el.style.transform = `translate(${Math.max(12, x)}px, ${Math.max(12, y)}px)`;
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    moved.current = false;
  };
  const onPointerMove = (e) => {
    pointer.current = { x: e.clientX, y: e.clientY };
    const start = drag.current;
    if (start) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!moved.current && Math.hypot(dx, dy) > 4) {
        moved.current = true;
        setDragging(true);
        setHovered(null);
        viewportRef.current?.setPointerCapture?.(e.pointerId);
      }
      // The updater runs later, after pointer-up may have cleared drag.current,
      // so it must only use the values captured here
      if (moved.current) setView((v) => ({ ...v, x: start.vx + dx, y: start.vy + dy }));
      return;
    }
    if (hovered && !pinned) placeTooltip();
  };
  const onPointerUp = (e) => {
    drag.current = null;
    if (dragging) setDragging(false);
    viewportRef.current?.releasePointerCapture?.(e.pointerId);
  };

  /* ---------- hover & select ---------- */

  const onEnter = useCallback((person, e) => {
    if (drag.current && moved.current) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    setHovered(person._id);
  }, []);
  const onLeave = useCallback(() => setHovered(null), []);
  const onSelect = useCallback((person, e) => {
    if (moved.current) return;
    e.stopPropagation();
    pointer.current = { x: e.clientX, y: e.clientY };
    setPinned((current) => (current === person._id ? null : person._id));
  }, []);

  const shownId = pinned || hovered;
  const shown = shownId ? enriched.find((p) => p._id === shownId) : null;
  useLayoutEffect(() => {
    if (shown) placeTooltip();
  }, [shownId, shown]);

  const focusPerson = (person) => {
    const station = layout.stations.find((s) => s.person._id === person._id);
    const el = viewportRef.current;
    if (!station || !el) return;
    const { width, height } = el.getBoundingClientRect();
    const s = Math.max(view.s, 0.9);
    setView({ s, x: width / 2 - station.x * s, y: height / 2 - (station.y - 60) * s });
    pointer.current = { x: Math.min(width / 2 + 120, window.innerWidth - 340), y: 140 };
    setPinned(person._id);
  };

  /* ---------- modal chrome ---------- */

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (pinned) setPinned(null);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, pinned]);

  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;

  const body = (() => {
    if (isLoading) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold">Setting up the office…</p>
        </div>
      );
    }
    if (isError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-sm text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <FiAlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="font-bold text-gray-800">Couldn&apos;t open the office</p>
            <p className="text-sm text-gray-500 mt-1">{error?.message || "Please try again in a moment."}</p>
          </div>
        </div>
      );
    }
    if (!people.length) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-semibold">
          No employees yet, so the office is empty.
        </div>
      );
    }
    return (
      <div className="vo-world" style={{ width: layout.width, height: layout.height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}>
        <OfficeRoom layout={layout} stats={stats} />
        {layout.stations.map(({ person, x, y, depth }) => (
          <div key={person._id} style={{ position: "absolute", left: x + VIEWBOX.x, top: y + VIEWBOX.y, zIndex: 10 + depth }}>
            <Workstation
              person={person}
              look={person.look}
              role={person.role}
              dimmed={filtering && !isMatch(person)}
              highlighted={shownId === person._id}
              onEnter={onEnter}
              onLeave={onLeave}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    );
  })();

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex" role="dialog" aria-modal="true" aria-label="Virtual office">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="vo-root relative z-10 flex flex-col w-full h-full">
        {/* header */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-3 sm:px-5 py-2.5 flex flex-wrap items-center gap-2 sm:gap-3 shadow-sm">
          <div className="flex items-center gap-2 mr-auto min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shrink-0">🏢</div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">Virtual Office</h2>
              <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isFetching ? "bg-amber-500" : "bg-green-500"} animate-pulse`} />
                {updatedAt ? `Live · updated ${updatedAt}` : "Live"} · hover a desk to see their tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 order-3 sm:order-none w-full sm:w-auto overflow-x-auto sm:overflow-visible sm:flex-wrap">

            {STATE_ORDER.map((state) => {
              const meta = STATE_META[state];
              const active = stateFilter === state;
              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => setStateFilter(active ? null : state)}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                    active ? "border-gray-800 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  title={`Show only: ${meta.label}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                  <span className={active ? "text-white/80" : "text-gray-400"}>{counts[state] || 0}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <label className="relative hidden md:block">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find someone"
                className="h-8 w-40 pl-8 pr-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-400"
              />
            </label>
            {departments.length > 1 && (
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-8 hidden md:block text-xs rounded-lg border border-gray-200 bg-white text-gray-700 px-2 outline-none"
                aria-label="Department"
              >
                <option value="">All teams</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-600" aria-label="Close">
              <IoClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* scene */}
        <div
          ref={viewportRef}
          className={`vo-viewport relative flex-1 overflow-hidden${dragging ? " vo-dragging" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={() => !moved.current && setPinned(null)}
        >
          <ScreenClip />
          {body}

          {!isLoading && !isError && people.length > 0 && (
            <>
              {/* zoom */}
              <div className="absolute right-3 bottom-3 flex flex-col gap-1 bg-white rounded-xl shadow-md border border-gray-200 p-1" onPointerDown={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => zoomBy(1.2)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-700" aria-label="Zoom in">
                  <FiPlus />
                </button>
                <button type="button" onClick={() => zoomBy(1 / 1.2)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-700" aria-label="Zoom out">
                  <FiMinus />
                </button>
                <button type="button" onClick={fit} className="p-2 rounded-lg hover:bg-gray-100 text-gray-700" aria-label="Fit to screen">
                  <FiMaximize />
                </button>
              </div>

              {/* who needs help */}
              {overloaded.length > 0 && (
                <div
                  className="absolute left-3 top-3 w-64 max-w-[calc(100%-24px)] bg-white rounded-2xl shadow-md border border-red-200 overflow-hidden"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setAlertsOpen((o) => !o)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 text-xs font-bold"
                  >
                    <FiAlertTriangle className="w-4 h-4" />
                    {overloaded.length} {overloaded.length === 1 ? "person is" : "people are"} over their limit
                    {alertsOpen ? <FiChevronUp className="ml-auto" /> : <FiChevronDown className="ml-auto" />}
                  </button>
                  {alertsOpen && (
                    <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                      {overloaded.map((p) => (
                        <li key={p._id}>
                          <button type="button" onClick={() => focusPerson(p)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50">
                            <img src={p.profileImage || "/image/dummy/avatar1.svg"} alt="" className="w-7 h-7 rounded-full object-cover bg-gray-100" />
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-bold text-gray-800 truncate">{p.name}</span>
                              <span className="block text-[11px] text-gray-500 truncate">{p.position}</span>
                            </span>
                            <span className="text-xs font-black text-red-600">
                              {p.openCount}/{p.limit}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* legend */}
              <div className="absolute left-3 bottom-3 hidden sm:flex items-center gap-3 bg-white/90 rounded-xl border border-gray-200 px-3 py-1.5 text-[11px] text-gray-600 font-semibold">
                <span>Drag to move · scroll to zoom · click a desk to pin</span>
              </div>
            </>
          )}
        </div>

        {shown && (
          <div
            ref={tooltipRef}
            className="vo-tooltip"
            style={{ pointerEvents: pinned ? "auto" : "none" }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <PersonCard person={shown} pinned={!!pinned} onClose={() => setPinned(null)} />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default VirtualOfficeModal;
