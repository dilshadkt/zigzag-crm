import * as XLSX from "xlsx";

// Fallback used when a project has no lead form configured (mirrors AddLeadModal)
const DEFAULT_FIELDS = [
  { id: "system_name", key: "system_name", label: "Full Name", type: "text", required: true },
  { id: "system_email", key: "system_email", label: "Email", type: "email", required: true },
  { id: "system_phone", key: "system_phone", label: "Phone Number", type: "tel", required: true },
  { id: "company_1", key: "company", label: "Company", type: "text", required: false },
];

// Extra, non-form columns that can also be mapped
export const EXTRA_FIELDS = [
  { id: "__status", key: "__status", label: "Status", type: "text", required: false, isExtra: true },
  { id: "__branch", key: "__branch", label: "Branch", type: "text", required: false, isExtra: true },
  { id: "__source", key: "__source", label: "Source", type: "text", required: false, isExtra: true },
];

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Header names that commonly mean the same thing as the system fields
const SYSTEM_ALIASES = {
  system_name: ["name", "fullname", "contactname", "leadname", "customername", "clientname"],
  system_email: ["email", "emailid", "emailaddress", "mail", "mailid"],
  system_phone: ["phone", "phonenumber", "mobile", "mobilenumber", "contactnumber", "contactno", "whatsapp", "whatsappnumber", "phoneno", "mobileno"],
  company: ["company", "companyname", "organization", "organisation"],
  __status: ["status", "leadstatus", "stage"],
  __branch: ["branch", "branchname"],
  __source: ["source", "leadsource"],
};

export const isNameField = (field) =>
  field.key === "system_name" ||
  (field.type === "text" && ["name", "fullname"].includes(normalize(field.label)));

const isCompanyField = (field) =>
  field.key === "company" || ["company", "companyname"].includes(normalize(field.label));

export const getImportFields = (formFields = []) => {
  if (!formFields || formFields.length === 0) return DEFAULT_FIELDS;
  return formFields.map((field, index) => {
    const id = field.id || field._id?.toString?.() || field._id || `field_${index}`;
    return { ...field, id: String(id), key: field.key || String(id) };
  });
};

// Reads the first sheet. Returns { headers: string[], rows: any[][] } (rows exclude the header row)
export const parseLeadFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return { headers: [], rows: [] };

  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true, blankrows: false });
  if (matrix.length === 0) return { headers: [], rows: [] };

  const headerRow = matrix[0];
  // Drop trailing empty header columns, but keep an index-stable list
  let lastIndex = headerRow.length - 1;
  while (lastIndex >= 0 && String(headerRow[lastIndex] ?? "").trim() === "") lastIndex--;
  const headers = headerRow.slice(0, lastIndex + 1).map((h, i) => {
    const text = String(h ?? "").trim();
    return text || `Column ${i + 1}`;
  });

  const rows = matrix
    .slice(1)
    .map((row) => headers.map((_, i) => row[i] ?? ""))
    .filter((row) => row.some((cell) => String(cell).trim() !== ""));

  return { headers, rows };
};

// { [field.key]: headerIndex | "" } — each Excel column is used at most once
export const autoMapColumns = (fields, headers) => {
  const mapping = {};
  const used = new Set();
  const headerNorms = headers.map(normalize);

  const claim = (field, predicate) => {
    if (mapping[field.key] !== undefined && mapping[field.key] !== "") return;
    const idx = headerNorms.findIndex((h, i) => !used.has(i) && h && predicate(h));
    if (idx >= 0) {
      mapping[field.key] = idx;
      used.add(idx);
    }
  };

  // Pass 1: exact label / key / facebook field match
  fields.forEach((field) => {
    const candidates = [field.label, field.key, field.facebookField].map(normalize).filter(Boolean);
    claim(field, (h) => candidates.includes(h));
  });

  // Pass 2: well-known aliases for system fields
  fields.forEach((field) => {
    let aliasKey = field.key;
    if (isNameField(field)) aliasKey = "system_name";
    else if (isCompanyField(field)) aliasKey = "company";
    const aliases = SYSTEM_ALIASES[aliasKey];
    if (aliases) claim(field, (h) => aliases.includes(h));
  });

  fields.forEach((field) => {
    if (mapping[field.key] === undefined) mapping[field.key] = "";
  });
  return mapping;
};

const pad = (n) => String(n).padStart(2, "0");

const toText = (value) => {
  if (value instanceof Date) {
    // SheetJS cellDates can land a few seconds before midnight (timezone offset rounding),
    // which would show the previous day, so nudge forward before reading the calendar date.
    const d = new Date(value.getTime() + 60 * 1000);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return String(value ?? "").trim();
};

const coerceValue = (field, raw) => {
  const text = toText(raw);
  if (text === "") return undefined;

  switch (field.type) {
    case "number": {
      const num = Number(text.replace(/,/g, ""));
      return Number.isNaN(num) ? text : num;
    }
    case "checkbox":
      return ["true", "yes", "y", "1", "checked"].includes(text.toLowerCase());
    case "select": {
      const options = field.options || [];
      const match = options.find((opt) => String(opt).trim().toLowerCase() === text.toLowerCase());
      return match !== undefined ? match : text;
    }
    default:
      return text;
  }
};

// Builds one lead payload from a spreadsheet row. Returns null when the row has no name.
export const buildLeadFromRow = (row, mapping, fields, statuses = []) => {
  const contact = {};
  const customFields = {};
  let statusId;
  let source = "Import";

  fields.forEach((field) => {
    const idx = mapping[field.key];
    if (idx === "" || idx === undefined) return;
    const value = coerceValue(field, row[idx]);
    if (value === undefined) return;

    if (field.key === "system_name") contact.name = String(value);
    else if (field.key === "system_email") contact.email = String(value);
    else if (field.key === "system_phone") contact.phone = String(value);
    else if (isNameField(field)) {
      contact.name = String(value);
      customFields[field.key] = value;
    } else if (isCompanyField(field)) {
      contact.company = String(value);
      if (field.key !== "company") customFields[field.key] = value;
    } else customFields[field.key] = value;
  });

  EXTRA_FIELDS.forEach((extra) => {
    const idx = mapping[extra.key];
    if (idx === "" || idx === undefined) return;
    const text = toText(row[idx]);
    if (!text) return;

    if (extra.key === "__status") {
      const wanted = text.toLowerCase();
      const match = statuses.find(
        (s) => String(s.name).trim().toLowerCase() === wanted || String(s.key || "").toLowerCase() === wanted
      );
      if (match) statusId = match._id;
    } else if (extra.key === "__branch") customFields.branch = text;
    else if (extra.key === "__source") source = text;
  });

  if (!contact.name) return null;

  return {
    contact,
    ...(statusId ? { status: statusId } : {}),
    source,
    customFields,
  };
};

export const downloadLeadTemplate = (fields) => {
  const headers = fields.map((field) => field.label || field.key);
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  ws["!cols"] = headers.map((h) => ({ wch: String(h).length + 5 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads Template");
  XLSX.writeFile(wb, "lead_import_template.xlsx");
};
