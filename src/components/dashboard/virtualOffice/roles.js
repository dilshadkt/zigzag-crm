// Positions are free text per company, so a role is guessed from the name.
// The first rule that matches wins, so specific names come before broad ones.
const ROLE_RULES = [
  { role: "video", re: /video|motion|editor|animat|film|camera|vfx|edit/i },
  { role: "social", re: /social\s*media|\bsmm\b|influenc|community/i },
  { role: "marketer", re: /market|\bppc\b|\bseo\b|ads?\b|performance|growth|campaign|media\s*buy/i },
  { role: "designer", re: /design|graphic|creative|\bui\b|\bux\b|illustrat|artist|brand/i },
  { role: "developer", re: /develop|engineer|program|software|\bit\b|tech|coder|web|app|devops|qa|tester/i },
  { role: "writer", re: /content|writer|copy|editor|blog|script|journal/i },
  { role: "accountant", re: /account|financ|audit|payroll|billing|cashier|tax/i },
  { role: "hr", re: /\bhr\b|human|recruit|talent|people|admin/i },
  { role: "manager", re: /manag|\bagm\b|\bgm\b|head|lead|director|chief|ceo|coo|cto|founder|supervis|owner|principal/i },
  { role: "caller", re: /call|sales|coordinat|cordinat|counsel|counci|business\s*dev|\bbd\b|support|customer|client|relation|front\s*office|reception|telic|tele/i },
];

export const ROLE_LABELS = {
  developer: "Coding",
  designer: "Designing",
  video: "Editing video",
  marketer: "Running campaigns",
  social: "Posting to socials",
  writer: "Writing",
  accountant: "Crunching numbers",
  hr: "Handling people stuff",
  manager: "Planning the work",
  caller: "On a call",
  generic: "Working",
};

export const roleFor = (position = "") => {
  const rule = ROLE_RULES.find(({ re }) => re.test(position));
  return rule ? rule.role : "generic";
};

// Stable small number from an id, so each person always looks the same
export const hashOf = (value = "") => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const SKIN = ["#f6d2b8", "#eebc98", "#d9a07a", "#c08560", "#9c6a48", "#7a4f35"];
const HAIR = ["#1f1a17", "#2e2420", "#4a3426", "#6b4a2f", "#141414", "#3b2a22", "#8a5a3b"];
const SCARF = ["#7c6cf0", "#e86d8f", "#2fa58c", "#e0a33b", "#4f86e8", "#9a5bd0"];
const MALE_STYLES = ["short", "side", "curly", "buzz", "short", "side"];
const FEMALE_STYLES = ["long", "bun", "scarf", "pony", "long", "scarf"];
const ANY_STYLES = [...MALE_STYLES, ...FEMALE_STYLES];

// Shirt colour follows the role so a team reads as one colour block
export const ROLE_SHIRT = {
  developer: "#3b6fe0",
  designer: "#e2558a",
  video: "#7a52d6",
  marketer: "#f08a2c",
  social: "#e0457a",
  writer: "#2c9b8a",
  accountant: "#3a8f4f",
  hr: "#d1663b",
  manager: "#2f3e5c",
  caller: "#1f9fc4",
  generic: "#5868e0",
};

export const lookFor = (person, role) => {
  const h = hashOf(String(person._id));
  const gender = String(person.gender || "").toLowerCase();
  const styles = gender.startsWith("f") ? FEMALE_STYLES : gender.startsWith("m") ? MALE_STYLES : ANY_STYLES;
  const hairStyle = styles[h % styles.length];
  return {
    skin: SKIN[(h >>> 3) % SKIN.length],
    hair: HAIR[(h >>> 6) % HAIR.length],
    scarf: SCARF[(h >>> 9) % SCARF.length],
    hairStyle,
    beard: gender.startsWith("m") && (h >>> 12) % 3 === 0,
    glasses: (h >>> 14) % 4 === 0,
    shirt: ROLE_SHIRT[role] || ROLE_SHIRT.generic,
    // Negative delay puts everyone at a different point of the same loop
    phase: -((h >>> 4) % 1000) / 250,
  };
};

export const STATE_META = {
  working: { label: "Working", color: "#22c55e", soft: "rgba(34,197,94,0.18)" },
  overloaded: { label: "Overloaded", color: "#ef4444", soft: "rgba(239,68,68,0.22)" },
  sleeping: { label: "No tasks", color: "#818cf8", soft: "rgba(129,140,248,0.18)" },
  break: { label: "On break", color: "#f59e0b", soft: "rgba(245,158,11,0.2)" },
  away: { label: "On leave", color: "#94a3b8", soft: "rgba(148,163,184,0.18)" },
};

export const STATE_ORDER = ["working", "overloaded", "sleeping", "break", "away"];
