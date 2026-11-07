import { memo } from "react";
import { STATE_META } from "./roles";

// One desk drawn in a 2:1 isometric projection. u runs to the lower right,
// v to the lower left and h straight up, all in SVG user units. The tile the
// desk stands on is 200 x 100 on screen and centred on (0, 0).
const P = (u, v, h = 0) => [u - v, (u + v) / 2 - h];
const pts = (...corners) => corners.map((c) => P(...c).join(",")).join(" ");

// The monitor screen is the u = -36 face; this maps a flat 32 x 40 screen
// drawing onto it so its content can be drawn as if it faced the viewer.
const SCREEN = "matrix(1 -0.5 0 1 -62 -87)";

export const VIEWBOX = { x: -100, y: -180, w: 200, h: 240 };

const Desk = () => (
  <g>
    {/* desk top, front panel, side panel */}
    <polygon points={pts([-44, 24, 30], [40, 24, 30], [40, 24, 0], [-44, 24, 0])} fill="var(--vo-desk-front)" />
    <polygon points={pts([40, -4, 30], [40, 24, 30], [40, 24, 0], [40, -4, 0])} fill="var(--vo-desk-side)" />
    <polygon points={pts([-44, -4, 30], [40, -4, 30], [40, 24, 30], [-44, 24, 30])} fill="var(--vo-desk-top)" />
    <polyline points={pts([-44, 24, 30], [40, 24, 30], [40, -4, 30])} fill="none" stroke="var(--vo-desk-edge)" strokeWidth="1.2" />
    {/* drawer handle */}
    <line x1="-10" y1="10" x2="0" y2="15" stroke="var(--vo-desk-edge)" strokeWidth="1.5" strokeLinecap="round" />
  </g>
);

const Chair = () => (
  <g>
    <ellipse cx="26" cy="-6" rx="14" ry="6" fill="var(--vo-shadow)" />
    <line x1="26" y1="-8" x2="26" y2="-30" stroke="#4b5563" strokeWidth="3" />
    <polygon points={pts([-9, -33, 60], [17, -33, 60], [17, -33, 26], [-9, -33, 26])} fill="var(--vo-chair)" />
    <polygon points={pts([-9, -33, 24], [17, -33, 24], [17, -11, 24], [-9, -11, 24])} fill="var(--vo-chair-seat)" />
  </g>
);

const Monitor = ({ children, off }) => (
  <g>
    {/* stand and foot */}
    <polygon points={pts([-40, 6, 30], [-32, 6, 30], [-32, 14, 30], [-40, 14, 30])} fill="#374151" />
    <line x1="-46" y1="-43" x2="-46" y2="-58" stroke="#4b5563" strokeWidth="3" />
    {/* bezel: a little thicker than the screen, plus its left edge */}
    <polygon points={pts([-36, 28, 84], [-36, -8, 84], [-36, -8, 40], [-36, 28, 40])} fill="#1f2937" />
    <polygon points={pts([-36, 28, 84], [-40, 28, 84], [-40, 28, 40], [-36, 28, 40])} fill="#111827" />
    <g transform={SCREEN}>
      <rect x="0" y="0" width="32" height="40" fill={off ? "#0b1220" : "#0f172a"} />
      {!off && children}
      {/* glare */}
      <polygon points="0,0 12,0 0,14" fill="#fff" opacity="0.06" />
    </g>
  </g>
);

const Keyboard = () => (
  <g>
    <polygon points={pts([-8, -2, 30.5], [22, -2, 30.5], [22, 7, 30.5], [-8, 7, 30.5])} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.6" />
    <polyline points={pts([-5, 1.5, 30.6], [19, 1.5, 30.6])} stroke="#9ca3af" strokeWidth="0.6" />
    <polyline points={pts([-5, 4.5, 30.6], [19, 4.5, 30.6])} stroke="#9ca3af" strokeWidth="0.6" />
  </g>
);

const Mug = ({ x = -40, y = -36, steam }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-3.5" y="-7" width="7" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
    <path d="M3.5,-5 q3,0 3,2.5 t-3,2.5" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />
    <ellipse cx="0" cy="-7" rx="3.5" ry="1.2" fill="#7c4a2d" />
    {steam && (
      <g className="vo-steam-soft">
        <path d="M-1,-10 q-2,-3 0,-6 t0,-6" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
      </g>
    )}
  </g>
);

const Plant = ({ x = -62, y = -28 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-4,0 L4,0 L3,-7 L-3,-7 Z" fill="#c2703d" />
    <ellipse cx="-3" cy="-11" rx="3" ry="5" fill="#34a853" transform="rotate(-25 -3 -11)" />
    <ellipse cx="3" cy="-12" rx="3" ry="5.5" fill="#2e8b47" transform="rotate(25 3 -12)" />
    <ellipse cx="0" cy="-14" rx="2.5" ry="5" fill="#3cba5e" />
  </g>
);

/* ---------- screens, one per role ---------- */

const CODE_COLORS = ["#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#a78bfa", "#94a3b8"];
const CodeScreen = () => {
  const lines = Array.from({ length: 12 }, (_, i) => ({
    x: 3 + (i % 3) * 3,
    w: 8 + ((i * 7) % 15),
    c: CODE_COLORS[i % CODE_COLORS.length],
  }));
  return (
    <g clipPath="url(#vo-screen-clip)">
      <g className="vo-code-scroll">
        {[...lines, ...lines].map((l, i) => (
          <rect key={i} x={l.x} y={3 + i * 4} width={l.w} height="1.8" rx="0.9" fill={l.c} />
        ))}
      </g>
    </g>
  );
};

const DesignScreen = () => (
  <g>
    <rect x="2" y="2" width="5" height="36" fill="#1e293b" />
    <circle cx="18" cy="15" r="7" className="vo-hue" fill="#f472b6" />
    <rect x="12" y="24" width="14" height="9" rx="2" className="vo-hue vo-hue-2" fill="#60a5fa" />
    <path d="M22,5 l5,8 h-10 z" className="vo-hue vo-hue-3" fill="#fbbf24" />
  </g>
);

const VideoScreen = () => (
  <g>
    <rect x="2" y="2" width="28" height="20" fill="#312e81" />
    <path d="M13,8 l7,4 l-7,4 z" fill="#e0e7ff" />
    <rect x="2" y="26" width="28" height="3" fill="#a78bfa" />
    <rect x="2" y="31" width="18" height="3" fill="#f472b6" />
    <rect x="12" y="35" width="16" height="3" fill="#34d399" />
    <rect x="4" y="24" width="1.2" height="16" fill="#fff" className="vo-playhead" />
  </g>
);

const ChartScreen = () => (
  <g>
    {[6, 12, 18, 24].map((x, i) => (
      <rect key={x} x={x} y={14} width="4" height="22" fill={i === 3 ? "#34d399" : "#f59e0b"} className="vo-bar" style={{ animationDelay: `${i * -0.35}s` }} />
    ))}
    <polyline points="4,30 12,24 18,26 28,8" fill="none" stroke="#f8fafc" strokeWidth="1.2" />
    <path d="M28,8 l-4,0 m4,0 l0,4" stroke="#f8fafc" strokeWidth="1.2" />
  </g>
);

const SocialScreen = () => (
  <g>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={3 + (i % 3) * 9.5} y={4 + Math.floor(i / 3) * 12} width="8" height="10" rx="1.5" fill={["#f472b6", "#60a5fa", "#fbbf24", "#a78bfa", "#34d399", "#fb7185"][i]} opacity="0.85" />
    ))}
    <rect x="3" y="30" width="26" height="6" rx="3" fill="#1e293b" />
    <circle cx="7" cy="33" r="1.6" fill="#f43f5e" className="vo-pop" />
  </g>
);

const DocScreen = () => (
  <g>
    <rect x="3" y="3" width="26" height="34" fill="#f8fafc" />
    <rect x="6" y="7" width="14" height="2.2" fill="#334155" />
    {[12, 16, 20, 24, 28, 32].map((y, i) => (
      <rect key={y} x="6" y={y} width="20" height="1.6" fill="#94a3b8" className="vo-line-grow" style={{ animationDelay: `${i * -0.6}s` }} />
    ))}
  </g>
);

const SheetScreen = () => (
  <g>
    <rect x="2" y="2" width="28" height="36" fill="#ecfdf5" />
    {[2, 9, 16, 23].map((x) => <line key={`c${x}`} x1={x} y1="2" x2={x} y2="38" stroke="#a7f3d0" strokeWidth="0.6" />)}
    {[2, 8, 14, 20, 26, 32].map((y) => <line key={`r${y}`} x1="2" y1={y} x2="30" y2={y} stroke="#a7f3d0" strokeWidth="0.6" />)}
    <rect x="9" y="14" width="7" height="6" fill="#34d399" opacity="0.6" className="vo-cell" />
  </g>
);

const PeopleScreen = () => (
  <g>
    {[4, 17].map((y) =>
      [3, 17].map((x) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y} width="12" height="11" rx="1.5" fill="#1e293b" />
          <circle cx={x + 6} cy={y + 4} r="2.2" fill="#fbbf24" />
          <rect x={x + 2.5} y={y + 7.5} width="7" height="1.6" fill="#64748b" />
        </g>
      ))
    )}
    <rect x="3" y="31" width="26" height="5" rx="2" fill="#22c55e" className="vo-pop" />
  </g>
);

const KanbanScreen = () => (
  <g>
    {[2, 12.5, 23].map((x, c) => (
      <g key={x}>
        <rect x={x} y="2" width="8" height="36" rx="1" fill="#1e293b" />
        {[0, 1, 2].slice(0, 3 - c).map((r) => (
          <rect key={r} x={x + 1} y={5 + r * 7} width="6" height="5" rx="1" fill={["#60a5fa", "#fbbf24", "#34d399"][c]} />
        ))}
      </g>
    ))}
    <rect x="13.5" y="26" width="6" height="5" rx="1" fill="#fbbf24" className="vo-card-move" />
  </g>
);

const CallScreen = () => (
  <g>
    {[4, 11, 18, 25, 32].map((y, i) => (
      <g key={y}>
        <circle cx="6" cy={y + 1.5} r="2" fill={i === 1 ? "#22c55e" : "#475569"} />
        <rect x="10" y={y} width={14 - (i % 2) * 4} height="1.8" fill="#94a3b8" />
      </g>
    ))}
    <rect x="2" y="9" width="28" height="6" fill="#22c55e" opacity="0.18" />
  </g>
);

const GenericScreen = () => (
  <g>
    <rect x="2" y="2" width="28" height="5" fill="#334155" />
    <rect x="3" y="10" width="12" height="12" rx="1" fill="#60a5fa" opacity="0.8" />
    <rect x="17" y="10" width="12" height="5" fill="#94a3b8" />
    <rect x="17" y="17" width="9" height="5" fill="#94a3b8" />
    <rect x="3" y="25" width="26" height="1.8" fill="#64748b" className="vo-line-grow" />
    <rect x="3" y="30" width="20" height="1.8" fill="#64748b" className="vo-line-grow" style={{ animationDelay: "-1.2s" }} />
  </g>
);

const SCREENS = {
  developer: CodeScreen,
  designer: DesignScreen,
  video: VideoScreen,
  marketer: ChartScreen,
  social: SocialScreen,
  writer: DocScreen,
  accountant: SheetScreen,
  hr: PeopleScreen,
  manager: KanbanScreen,
  caller: CallScreen,
  generic: GenericScreen,
};

const OverloadScreen = () => (
  <g>
    <rect x="0" y="0" width="32" height="40" fill="#7f1d1d" className="vo-flash" />
    <path d="M16,8 l11,20 h-22 z" fill="#fbbf24" />
    <rect x="15" y="14" width="2.2" height="8" fill="#7f1d1d" />
    <rect x="15" y="24" width="2.2" height="2.2" fill="#7f1d1d" />
    <rect x="4" y="32" width="24" height="3" fill="#fca5a5" />
  </g>
);

const SleepScreen = () => (
  <g>
    <circle cx="10" cy="12" r="1.5" fill="#6366f1" className="vo-saver" />
  </g>
);

const BreakScreen = () => (
  <g opacity="0.8">
    <rect x="9" y="14" width="12" height="12" rx="2" fill="#a16207" />
    <path d="M21,17 q4,0 4,3 t-4,3" fill="none" stroke="#a16207" strokeWidth="1.5" />
    <path d="M12,11 q-1.5,-2 0,-4 M16,11 q-1.5,-2 0,-4" stroke="#fde68a" strokeWidth="1" fill="none" />
  </g>
);

/* ---------- the person ---------- */

const Hair = ({ look, back }) => {
  const { hair, hairStyle, scarf } = look;
  if (back) {
    if (hairStyle === "long") return <path d="M13,-80 Q13,-92 26,-92 Q39,-92 39,-80 L40,-60 Q26,-56 12,-60 Z" fill={hair} />;
    if (hairStyle === "scarf") return <path d="M12,-78 Q12,-93 26,-93 Q40,-93 40,-78 L42,-56 Q26,-50 10,-56 Z" fill={scarf} />;
    if (hairStyle === "pony") return <ellipse cx="40" cy="-72" rx="4" ry="8" fill={hair} />;
    return null;
  }
  switch (hairStyle) {
    case "bun":
      return (
        <g fill={hair}>
          <circle cx="26" cy="-91" r="5.5" />
          <path d="M14,-76 Q14,-89 26,-89 Q38,-89 38,-76 Q34,-83 26,-83 Q18,-83 14,-76 Z" />
        </g>
      );
    case "scarf":
      return (
        <g>
          <path d="M14,-74 Q14,-90 26,-90 Q38,-90 38,-74 Q38,-82 26,-83 Q14,-82 14,-74 Z" fill={scarf} />
          <path d="M14,-72 Q16,-62 26,-61 Q36,-62 38,-72 L40,-62 Q26,-55 12,-62 Z" fill={scarf} />
        </g>
      );
    case "long":
    case "pony":
      return <path d="M14,-74 Q13,-90 26,-90 Q39,-90 38,-74 Q36,-84 27,-84 Q22,-80 14,-74 Z" fill={hair} />;
    case "curly":
      return (
        <g fill={hair}>
          {[16, 21, 26, 31, 36].map((x, i) => <circle key={x} cx={x} cy={-85 + (i % 2) * 1.5 - (i === 2 ? 2 : 0)} r="4.5" />)}
          <circle cx="14.5" cy="-79" r="3.5" />
          <circle cx="37.5" cy="-79" r="3.5" />
        </g>
      );
    case "buzz":
      return <path d="M14.5,-78 Q15,-89 26,-89 Q37,-89 37.5,-78 Q33,-84 26,-84 Q19,-84 14.5,-78 Z" fill={hair} opacity="0.85" />;
    case "side":
      return <path d="M14,-76 Q13,-90 27,-90 Q39,-89 38,-77 Q34,-84 24,-83 Q19,-82 14,-76 Z" fill={hair} />;
    default:
      return <path d="M14,-77 Q14,-90 26,-90 Q38,-90 38,-77 Q35,-85 26,-85 Q17,-85 14,-77 Z" fill={hair} />;
  }
};

const Face = ({ look, mood }) => {
  const eyeY = -76;
  let eyes;
  if (mood === "sleep") {
    eyes = (
      <g stroke="#3f2a1d" strokeWidth="1" fill="none" strokeLinecap="round">
        <path d="M19,-76 q2,1.5 4,0" />
        <path d="M27,-76 q2,1.5 4,0" />
      </g>
    );
  } else if (mood === "panic") {
    eyes = (
      <g>
        <circle cx="21" cy={eyeY} r="2.6" fill="#fff" stroke="#3f2a1d" strokeWidth="0.6" />
        <circle cx="30" cy={eyeY} r="2.6" fill="#fff" stroke="#3f2a1d" strokeWidth="0.6" />
        <circle cx="21" cy={eyeY} r="1" fill="#1f2937" />
        <circle cx="30" cy={eyeY} r="1" fill="#1f2937" />
        <path d="M18,-81 l5,1.5 M33,-81 l-5,1.5" stroke="#3f2a1d" strokeWidth="1" strokeLinecap="round" />
      </g>
    );
  } else if (mood === "relaxed") {
    eyes = (
      <g stroke="#3f2a1d" strokeWidth="1" fill="none" strokeLinecap="round">
        <path d="M19,-75 q2,-2 4,0" />
        <path d="M28,-75 q2,-2 4,0" />
      </g>
    );
  } else {
    eyes = (
      <g fill="#1f2937">
        <circle cx="20.5" cy={eyeY} r="1.4" className="vo-blink" />
        <circle cx="28.5" cy={eyeY} r="1.4" className="vo-blink" />
      </g>
    );
  }
  let mouth = <path d="M22,-70.5 q3,2 6,0" stroke="#7c2d12" strokeWidth="1" fill="none" strokeLinecap="round" />;
  if (mood === "panic") mouth = <ellipse cx="25.5" cy="-69.5" rx="2.2" ry="2.8" fill="#7c2d12" className="vo-gasp" />;
  if (mood === "sleep") mouth = <ellipse cx="25" cy="-70" rx="1.2" ry="1" fill="#7c2d12" />;
  if (mood === "talk") mouth = <ellipse cx="25" cy="-70" rx="2" ry="1.6" fill="#7c2d12" className="vo-talk" />;
  return (
    <g>
      {eyes}
      {look.glasses && mood !== "sleep" && (
        <g fill="none" stroke="#1f2937" strokeWidth="0.9">
          <circle cx="20.8" cy={eyeY} r="3.4" />
          <circle cx="29.2" cy={eyeY} r="3.4" />
          <line x1="24.2" y1={eyeY} x2="25.8" y2={eyeY} />
        </g>
      )}
      <circle cx="17.5" cy="-71.5" r="2" fill="#f87171" opacity="0.25" />
      <circle cx="33" cy="-71.5" r="2" fill="#f87171" opacity="0.25" />
      {mouth}
      {look.beard && <path d="M16,-74 Q17,-62 26,-62 Q35,-62 36,-74 Q33,-67 26,-67 Q19,-67 16,-74 Z" fill={look.hair} opacity="0.9" />}
    </g>
  );
};

const Head = ({ look, mood, className, extra }) => (
  <g className={className}>
    <Hair look={look} back />
    <rect x="23" y="-66" width="6" height="6" fill={look.skin} />
    <circle cx="26" cy="-76" r="12" fill={look.skin} />
    <circle cx="14" cy="-75" r="2.2" fill={look.skin} />
    <circle cx="38" cy="-75" r="2.2" fill={look.skin} />
    <Face look={look} mood={mood} />
    <Hair look={look} />
    {extra}
  </g>
);

const Torso = ({ look, className }) => (
  <g className={className}>
    <path d="M12,-20 L12,-52 Q12,-62 26,-62 Q40,-62 40,-52 L40,-20 Z" fill={look.shirt} />
    <path d="M22,-62 L26,-56 L30,-62 Z" fill={look.skin} />
    <path d="M12,-20 L12,-52 Q12,-62 26,-62" fill="none" stroke="#000" strokeOpacity="0.08" strokeWidth="2" />
  </g>
);

const Arm = ({ d, look }) => <path d={d} fill="none" stroke={look.shirt} strokeWidth="6.5" strokeLinecap="round" style={{ filter: "brightness(0.92)" }} />;
const Hand = ({ cx, cy, look, className }) => <circle cx={cx} cy={cy} r="3.3" fill={look.skin} className={className} />;

const TypingArms = ({ look, fast }) => (
  <g>
    <Arm d="M15,-55 Q6,-42 2,-27" look={look} />
    <Arm d="M37,-55 Q31,-38 18,-23" look={look} />
    <Hand cx="2" cy="-26" look={look} className={fast ? "vo-type vo-fast" : "vo-type"} />
    <Hand cx="18" cy="-22" look={look} className={fast ? "vo-type vo-type-b vo-fast" : "vo-type vo-type-b"} />
  </g>
);

const Headset = () => (
  <g>
    <path d="M13,-78 Q13,-93 26,-93 Q39,-93 39,-78" fill="none" stroke="#111827" strokeWidth="2.2" />
    <rect x="10.5" y="-80" width="4.5" height="8" rx="2" fill="#111827" />
    <rect x="37" y="-80" width="4.5" height="8" rx="2" fill="#111827" />
    <path d="M13,-73 Q14,-66 21,-67" fill="none" stroke="#111827" strokeWidth="1.3" />
    <circle cx="21.5" cy="-67" r="1.4" fill="#111827" />
  </g>
);

const Headphones = () => (
  <g>
    <path d="M12,-77 Q12,-95 26,-95 Q40,-95 40,-77" fill="none" stroke="#7c3aed" strokeWidth="3" />
    <rect x="9" y="-82" width="6" height="10" rx="3" fill="#7c3aed" />
    <rect x="37" y="-82" width="6" height="10" rx="3" fill="#7c3aed" />
  </g>
);

/* ---------- role scenes (what the arms and props do) ---------- */

const RoleProps = ({ role, look }) => {
  switch (role) {
    case "designer":
      return (
        <g>
          <polygon points={pts([-4, -2, 30.5], [22, -2, 30.5], [22, 10, 30.5], [-4, 10, 30.5])} fill="#1f2937" />
          <polygon points={pts([-1, 0, 30.7], [19, 0, 30.7], [19, 8, 30.7], [-1, 8, 30.7])} fill="#334155" />
          <Arm d="M15,-55 Q8,-42 4,-30" look={look} />
          <Hand cx="4" cy="-29" look={look} />
          <g className="vo-draw">
            <Arm d="M37,-55 Q32,-38 20,-26" look={look} />
            <Hand cx="20" cy="-25" look={look} />
            <line x1="20" y1="-25" x2="16" y2="-19" stroke="#f472b6" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>
      );
    case "social":
      return (
        <g>
          <Keyboard />
          <Arm d="M15,-55 Q6,-42 2,-27" look={look} />
          <Hand cx="2" cy="-26" look={look} className="vo-type" />
          <Arm d="M37,-55 Q44,-44 38,-48" look={look} />
          <g className="vo-scroll-phone">
            <rect x="33" y="-58" width="9" height="15" rx="2" fill="#111827" />
            <rect x="34.2" y="-56.5" width="6.6" height="11.5" rx="1" fill="#f472b6" />
            <Hand cx="38" cy="-46" look={look} />
          </g>
          {[0, 1, 2].map((i) => (
            <path key={i} className="vo-heart" style={{ animationDelay: `${i * -0.8}s` }} d="M40,-62 c-1.5,-2.5 -5,-1 -3,2 l3,3 l3,-3 c2,-3 -1.5,-4.5 -3,-2 z" fill="#f43f5e" />
          ))}
        </g>
      );
    case "accountant":
      return (
        <g>
          <polygon points={pts([-8, -2, 30.5], [8, -2, 30.5], [8, 7, 30.5], [-8, 7, 30.5])} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.6" />
          <polygon points={pts([12, -2, 31], [24, -2, 31], [24, 10, 31], [12, 10, 31])} fill="#334155" />
          <polygon points={pts([14, -1, 31.2], [22, -1, 31.2], [22, 2, 31.2], [14, 2, 31.2])} fill="#86efac" />
          <Arm d="M15,-55 Q6,-42 0,-30" look={look} />
          <Hand cx="0" cy="-29" look={look} className="vo-type" />
          <Arm d="M37,-55 Q34,-38 22,-20" look={look} />
          <Hand cx="22" cy="-19" look={look} className="vo-type vo-fast" />
          <g className="vo-coin">
            <ellipse cx="-30" cy="-26" rx="4" ry="2" fill="#f59e0b" />
            <ellipse cx="-30" cy="-28" rx="4" ry="2" fill="#fbbf24" />
          </g>
        </g>
      );
    case "hr":
      return (
        <g>
          <Keyboard />
          <polygon points={pts([14, 4, 30.6], [30, 4, 30.6], [30, 18, 30.6], [14, 18, 30.6])} fill="#fff" stroke="#cbd5e1" strokeWidth="0.5" />
          <Arm d="M15,-55 Q6,-42 2,-27" look={look} />
          <Hand cx="2" cy="-26" look={look} className="vo-type" />
          <g className="vo-stamp">
            <Arm d="M37,-55 Q34,-40 26,-28" look={look} />
            <rect x="22" y="-28" width="8" height="5" rx="1" fill="#dc2626" />
            <rect x="24.5" y="-34" width="3" height="6" fill="#7f1d1d" />
            <Hand cx="26" cy="-34" look={look} />
          </g>
        </g>
      );
    case "manager":
      return (
        <g>
          <Keyboard />
          <Arm d="M15,-55 Q6,-42 2,-27" look={look} />
          <Hand cx="2" cy="-26" look={look} className="vo-type" />
          <g className="vo-sip">
            <Arm d="M37,-55 Q46,-46 38,-62" look={look} />
            <Mug x={38} y={-60} />
            <Hand cx="38" cy="-62" look={look} />
          </g>
          {[0, 1].map((i) => (
            <g key={i} className="vo-tick" style={{ animationDelay: `${i * -1.4}s` }}>
              <circle cx="50" cy="-86" r="5" fill="#22c55e" />
              <path d="M47.5,-86 l2,2 l3.5,-4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>
      );
    default:
      return (
        <g>
          <Keyboard />
          <TypingArms look={look} />
        </g>
      );
  }
};

const Zzz = () => (
  <g fill="var(--vo-zzz)" fontWeight="800" fontFamily="Nunito Sans, system-ui, sans-serif">
    {[0, 1, 2].map((i) => (
      <text key={i} x="34" y="-52" fontSize={8 + i * 2} className="vo-zzz" style={{ animationDelay: `calc(var(--vo-phase) + ${i * -1}s)` }}>
        z
      </text>
    ))}
  </g>
);

const PaperTower = () => (
  <g className="vo-wobble">
    {Array.from({ length: 7 }, (_, i) => (
      <polygon key={i} points={pts([-26, 6, 31 + i * 3.2], [-10, 6, 31 + i * 3.2], [-10, 20, 31 + i * 3.2], [-26, 20, 31 + i * 3.2])} fill={i % 2 ? "#f8fafc" : "#e2e8f0"} stroke="#cbd5e1" strokeWidth="0.5" />
    ))}
  </g>
);

const FlyingPapers = () => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-22 + i * 6} y={-58} width="8" height="10" fill="#fff" stroke="#cbd5e1" strokeWidth="0.5" className="vo-paper" style={{ animationDelay: `${i * -0.55}s` }} />
    ))}
  </g>
);

const SpeechDots = () => (
  <g className="vo-float">
    <path d="M44,-100 h18 a5,5 0 0 1 5,5 v6 a5,5 0 0 1 -5,5 h-12 l-5,4 l1,-4 h-2 a5,5 0 0 1 -5,-5 v-6 a5,5 0 0 1 5,-5 z" fill="#fff" stroke="#cbd5e1" strokeWidth="0.6" />
    {[49, 54, 59].map((x, i) => <circle key={x} cx={x} cy="-92" r="1.5" fill="#64748b" className="vo-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
  </g>
);

const NameTag = ({ name, color }) => {
  const label = name.length > 12 ? `${name.slice(0, 11)}…` : name;
  const w = Math.max(34, label.length * 5.6 + 18);
  return (
    <g transform="translate(26 -122)">
      <rect x={-w / 2} y="-8" width={w} height="15" rx="7.5" fill="var(--vo-tag-bg)" stroke="var(--vo-tag-border)" strokeWidth="0.8" />
      <circle cx={-w / 2 + 8} cy="-0.5" r="2.8" fill={color} />
      <text x={-w / 2 + 14} y="3" fontSize="9" fontWeight="700" fill="var(--vo-tag-text)" fontFamily="Nunito Sans, system-ui, sans-serif">
        {label}
      </text>
    </g>
  );
};

// A suitcase by the empty chair and a sign floating over the desk
const LeaveCard = () => (
  <g>
    <g transform="translate(40 -18)">
      <rect x="-9" y="-16" width="18" height="16" rx="2.5" fill="#f59e0b" />
      <rect x="-4" y="-20" width="8" height="5" rx="1.5" fill="none" stroke="#b45309" strokeWidth="1.6" />
      <line x1="-9" y1="-9" x2="9" y2="-9" stroke="#b45309" strokeWidth="1.2" />
    </g>
    <g className="vo-float">
      <rect x="-4" y="-96" width="58" height="18" rx="9" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
      <text x="25" y="-83.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#b45309" fontFamily="Nunito Sans, system-ui, sans-serif">
        ON LEAVE
      </text>
    </g>
  </g>
);

const Person = ({ look, role, state }) => {
  if (state === "away") return null;

  if (state === "sleeping") {
    // Slumped forward: the body sinks behind the desk, the head goes down on it
    return (
      <g transform="translate(-3 10)">
        <Torso look={look} className="vo-breathe" />
      </g>
    );
  }

  if (state === "break") {
    return (
      <g>
        <Torso look={look} className="vo-breathe" />
        <Head look={look} mood="relaxed" className="vo-nod-slow" />
      </g>
    );
  }

  const overloaded = state === "overloaded";
  const mood = overloaded ? "panic" : role === "caller" ? "talk" : "focus";
  const headClass = overloaded ? "" : role === "video" ? "vo-bob" : role === "manager" ? "vo-nod" : "";
  const headExtra = role === "caller" ? <Headset /> : role === "video" ? <Headphones /> : null;

  return (
    <g className={overloaded ? "vo-shake" : ""}>
      <Torso look={look} />
      <Head look={look} mood={mood} className={headClass} extra={headExtra} />
      {overloaded && (
        <g>
          {[0, 1].map((i) => (
            <path key={i} className="vo-sweat" style={{ animationDelay: `${i * -0.5}s` }} d={i ? "M40,-84 q2,3 0,4 q-2,-1 0,-4 z" : "M12,-82 q2,3 0,4 q-2,-1 0,-4 z"} fill="#7dd3fc" />
          ))}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={20 + i * 6} cy="-92" r="4" fill="#e2e8f0" className="vo-steam" style={{ animationDelay: `${i * -0.4}s` }} />
          ))}
        </g>
      )}
      {!overloaded && role === "caller" && <SpeechDots />}
    </g>
  );
};

const Workstation = ({ person, look, role, dimmed, highlighted, onEnter, onLeave, onSelect }) => {
  const { state } = person;
  const meta = STATE_META[state] || STATE_META.working;
  const Screen =
    state === "overloaded" ? OverloadScreen : state === "sleeping" ? SleepScreen : state === "break" ? BreakScreen : SCREENS[role] || GenericScreen;

  return (
    <svg
      className={`vo-station vo-state-${state}${dimmed ? " vo-dim" : ""}${highlighted ? " vo-highlight" : ""}`}
      viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`}
      width={VIEWBOX.w}
      height={VIEWBOX.h}
      style={{ "--vo-phase": `${look.phase}s`, "--vo-state": meta.color }}
      aria-label={`${person.name}, ${person.position}, ${meta.label}`}
    >
      <g
        className="vo-hit"
        onMouseEnter={(e) => onEnter(person, e)}
        onMouseLeave={onLeave}
        onClick={(e) => onSelect(person, e)}
      >
        {/* invisible hover area: the tile plus the space the person takes up */}
        <polygon points="0,-50 100,0 0,50 -100,0" fill="transparent" />
        <rect x="-70" y="-135" width="125" height="135" fill="transparent" />

        <ellipse cx="-4" cy="4" rx="84" ry="42" fill={meta.soft} className={state === "overloaded" ? "vo-ring-pulse" : ""} />
        <ellipse cx="-4" cy="4" rx="84" ry="42" fill="none" stroke={meta.color} strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray={state === "sleeping" || state === "away" ? "4 4" : "none"} />
        <ellipse cx="-10" cy="18" rx="56" ry="18" fill="var(--vo-shadow)" />

        <Chair />
        <Person look={look} role={role} state={state} />
        <Desk />
        <Monitor off={state === "away"}>
          <Screen />
        </Monitor>

        {state === "overloaded" ? <PaperTower /> : state !== "break" && <Mug steam={state === "working"} />}
        {state !== "overloaded" && <Plant />}
        {state === "away" && <LeaveCard />}

        {/* Arms and hands sit on the desk, so they are drawn after it */}
        {state !== "away" && state !== "sleeping" && state !== "break" && (
          <g className={state === "overloaded" ? "vo-shake" : ""}>
            {state === "overloaded" ? (
              <TypingArms look={look} fast />
            ) : (
              <RoleProps role={role} look={look} />
            )}
          </g>
        )}
        {state === "sleeping" && (
          <g>
            {/* folded arms as a pillow, head resting on them */}
            <path d="M4,-30 Q22,-40 42,-28" fill="none" stroke={look.shirt} strokeWidth="9" strokeLinecap="round" style={{ filter: "brightness(0.92)" }} />
            <g className="vo-breathe-head">
              <g transform="translate(-4 36) rotate(-16 26 -76)">
                <Head look={look} mood="sleep" />
              </g>
            </g>
            <Zzz />
          </g>
        )}
        {state === "break" && (
          <g>
            <Arm d="M15,-55 Q8,-40 6,-30" look={look} />
            <Hand cx="6" cy="-29" look={look} />
            <g className="vo-sip">
              <Arm d="M37,-55 Q46,-46 38,-62" look={look} />
              <Mug x={38} y={-60} steam />
              <Hand cx="38" cy="-62" look={look} />
            </g>
          </g>
        )}

        {state === "overloaded" && (
          <g>
            <FlyingPapers />
            <g className="vo-alarm">
              <circle cx="52" cy="-100" r="9" fill="#ef4444" />
              <text x="52" y="-96" textAnchor="middle" fontSize="12" fontWeight="900" fill="#fff" fontFamily="system-ui">!</text>
            </g>
          </g>
        )}

        <NameTag name={person.firstName || person.name} color={meta.color} />
      </g>
    </svg>
  );
};

export const ScreenClip = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
    <defs>
      <clipPath id="vo-screen-clip">
        <rect x="0" y="0" width="32" height="40" />
      </clipPath>
    </defs>
  </svg>
);

const sameStation = (a, b) =>
  a.person === b.person && a.dimmed === b.dimmed && a.highlighted === b.highlighted && a.role === b.role;

export default memo(Workstation, sameStation);
