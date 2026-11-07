import { memo, useEffect, useState } from "react";
import { WALL_HEIGHT } from "./layout";

const poly = (points) => points.map((p) => `${p.x},${p.y}`).join(" ");

const skyFor = (hour) => {
  if (hour >= 6 && hour < 17) return { top: "#7cc4ff", bottom: "#d8efff", night: false, sun: "#fde68a" };
  if (hour >= 17 && hour < 19) return { top: "#f59e8b", bottom: "#fde1b0", night: false, sun: "#fb923c" };
  return { top: "#0f1e3d", bottom: "#253a66", night: true, sun: "#f1f5f9" };
};

const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const Clock = ({ now }) => {
  const minutes = now.getMinutes();
  const hours = (now.getHours() % 12) + minutes / 60;
  return (
    <g>
      <circle cx="0" cy="0" r="24" fill="#fff" stroke="#334155" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="0" y1="-19" x2="0" y2={i % 3 ? "-16.5" : "-14"} stroke="#334155" strokeWidth={i % 3 ? 1 : 2} transform={`rotate(${i * 30})`} />
      ))}
      <line x1="0" y1="2" x2="0" y2="-11" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" transform={`rotate(${hours * 30})`} />
      <line x1="0" y1="3" x2="0" y2="-17" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" transform={`rotate(${minutes * 6})`} />
      <circle cx="0" cy="0" r="2.2" fill="#ef4444" />
    </g>
  );
};

const BigPlant = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx="0" cy="2" rx="22" ry="9" fill="var(--vo-shadow)" />
    <path d="M-14,0 L14,0 L11,-26 L-11,-26 Z" fill="#c2703d" />
    <rect x="-13" y="-30" width="26" height="5" rx="2" fill="#a85d2f" />
    {[
      [-14, -52, -30],
      [12, -56, 28],
      [0, -66, 0],
      [-6, -44, -55],
      [8, -42, 55],
    ].map(([cx, cy, r], i) => (
      <ellipse key={i} cx={cx} cy={cy} rx="9" ry="22" fill={i % 2 ? "#2e8b47" : "#3cba5e"} transform={`rotate(${r} ${cx} ${cy + 18})`} />
    ))}
  </g>
);

const OfficeRoom = ({ layout, stats }) => {
  const now = useNow();
  const { floor, toScreen, width, height, zones } = layout;
  const { u0, v0, u1, v1 } = floor;
  const sky = skyFor(now.getHours());
  const H = WALL_HEIGHT;

  const floorPts = [toScreen(u0, v0), toScreen(u1, v0), toScreen(u1, v1), toScreen(u0, v1)];
  const slab = 26;
  const frontLeft = [toScreen(u0, v1), toScreen(u1, v1), toScreen(u1, v1, -slab), toScreen(u0, v1, -slab)];
  const frontRight = [toScreen(u1, v0), toScreen(u1, v1), toScreen(u1, v1, -slab), toScreen(u1, v0, -slab)];
  const wallRight = [toScreen(u0, v0), toScreen(u1, v0), toScreen(u1, v0, H), toScreen(u0, v0, H)];
  const wallLeft = [toScreen(u0, v0), toScreen(u0, v1), toScreen(u0, v1, H), toScreen(u0, v0, H)];
  const trimRight = [toScreen(u0, v0, H), toScreen(u1, v0, H), toScreen(u1, v0 - 14, H), toScreen(u0 - 14, v0 - 14, H)];
  const trimLeft = [toScreen(u0, v0, H), toScreen(u0, v1, H), toScreen(u0 - 14, v1, H), toScreen(u0 - 14, v0 - 14, H)];

  // Planks along u
  const planks = Array.from({ length: Math.max(0, Math.ceil((v1 - v0) / 46) - 1) }, (_, i) => {
    const v = v0 + 46 * (i + 1);
    const a = toScreen(u0, v);
    const b = toScreen(u1, v);
    return <line key={v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--vo-floor-line)" strokeWidth="1.5" />;
  });

  // Windows on the right wall, a clock and the board on the left wall
  const windowCount = Math.max(1, Math.floor((u1 - u0) / 300));
  const windowStep = (u1 - u0) / windowCount;
  const windows = Array.from({ length: windowCount }, (_, i) => {
    const a = u0 + windowStep * i + windowStep / 2 - 70;
    const o = toScreen(a, v0, H - 28);
    return { key: i, o };
  });
  // The board reads toward the back corner, so its origin is its front edge
  const boardOrigin = toScreen(u0, v0 + 230, H - 32);
  const clockAt = toScreen(u0, Math.min(v1 - 50, v0 + 300), H - 70);

  return (
    <svg className="absolute left-0 top-0" width={width} height={height} style={{ overflow: "visible" }} aria-hidden="true">
      <defs>
        <linearGradient id="vo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
      </defs>

      {/* floor slab */}
      <polygon points={poly(frontLeft)} fill="var(--vo-desk-front)" opacity="0.55" />
      <polygon points={poly(frontRight)} fill="var(--vo-desk-side)" opacity="0.55" />
      <polygon points={poly(floorPts)} fill="var(--vo-floor)" />
      {planks}

      {/* walls */}
      <polygon points={poly(wallLeft)} fill="var(--vo-wall-left)" />
      <polygon points={poly(wallRight)} fill="var(--vo-wall-right)" />
      <polygon points={poly(trimLeft)} fill="var(--vo-wall-trim)" />
      <polygon points={poly(trimRight)} fill="var(--vo-wall-trim)" />
      <polyline points={poly([toScreen(u0, v1, 10), toScreen(u0, v0, 10), toScreen(u1, v0, 10)])} fill="none" stroke="var(--vo-wall-trim)" strokeWidth="5" />

      {windows.map(({ key, o }) => (
        <g key={key} transform={`matrix(1 0.5 0 1 ${o.x} ${o.y})`}>
          <rect x="-6" y="-6" width="152" height="102" rx="4" fill="var(--vo-wall-trim)" />
          <rect x="0" y="0" width="140" height="90" fill="url(#vo-sky)" />
          {sky.night ? (
            <g fill="#fff">
              <circle cx="104" cy="24" r="10" fill={sky.sun} />
              <circle cx="110" cy="20" r="8" fill={sky.top} />
              {[[20, 18], [44, 40], [70, 14], [30, 62], [88, 58], [124, 70]].map(([x, y]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" opacity="0.85" />
              ))}
            </g>
          ) : (
            <g>
              {key === 0 && <circle cx="110" cy="26" r="13" fill={sky.sun} />}
              <g className="vo-cloud" fill="#fff" opacity="0.9">
                <ellipse cx="44" cy="40" rx="20" ry="8" />
                <ellipse cx="56" cy="34" rx="12" ry="8" />
              </g>
            </g>
          )}
          <path d="M70,0 V90 M0,45 H140" stroke="var(--vo-wall-trim)" strokeWidth="5" />
        </g>
      ))}

      <g transform={`matrix(1 -0.5 0 1 ${clockAt.x} ${clockAt.y})`}>
        <Clock now={now} />
      </g>

      <g transform={`matrix(1 -0.5 0 1 ${boardOrigin.x} ${boardOrigin.y})`} fontFamily="Nunito Sans, system-ui, sans-serif">
        <rect x="-4" y="-4" width="178" height="108" rx="6" fill="#94a3b8" />
        <rect x="0" y="0" width="170" height="100" rx="4" fill="#f8fafc" />
        <text x="12" y="22" fontSize="14" fontWeight="900" fill="#1e293b">TODAY</text>
        <text x="12" y="44" fontSize="12" fontWeight="700" fill="#16a34a">{stats.done} tasks done</text>
        <text x="12" y="62" fontSize="12" fontWeight="700" fill="#2563eb">{stats.open} still open</text>
        <text x="12" y="80" fontSize="12" fontWeight="700" fill="#dc2626">{stats.overloaded} overloaded</text>
        <text x="12" y="96" fontSize="10" fontWeight="600" fill="#64748b">{stats.working} people working</text>
      </g>

      {/* department rugs */}
      {zones.map((zone) => {
        const label = `${zone.name.toUpperCase()} · ${zone.members.length}`;
        // Shrink long names to the zone's width (about 0.72em per bold capital + spacing)
        const fontSize = Math.max(11, Math.min(22, zone.width / (label.length * 0.8)));
        return (
        <g key={zone.name}>
          <polygon points={poly(zone.rug)} fill="var(--vo-rug-a)" stroke="var(--vo-rug-line)" strokeWidth="2" />
          {/* painted on the floor: x follows u, y follows v */}
          <text
            transform={`matrix(1 0.5 -1 0.5 ${zone.decal.x} ${zone.decal.y})`}
            fontSize={fontSize}
            fontWeight="900"
            letterSpacing="2"
            fill="var(--vo-decal)"
            fontFamily="Nunito Sans, system-ui, sans-serif"
          >
            {label}
          </text>
        </g>
        );
      })}

      {/* corner plants */}
      {(() => {
        const back = toScreen(u0 + 45, v0 + 45);
        const right = toScreen(u1 - 40, v0 + 40);
        const left = toScreen(u0 + 40, v1 - 40);
        return (
          <g>
            <BigPlant x={back.x} y={back.y} />
            <BigPlant x={right.x} y={right.y} />
            <BigPlant x={left.x} y={left.y} />
          </g>
        );
      })()}
    </svg>
  );
};

export default memo(OfficeRoom);
