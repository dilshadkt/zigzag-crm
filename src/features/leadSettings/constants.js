export const LEAD_SETTINGS_TABS = [
  "Leads",
  "Assignment Rules",
  "Scoring Rules",
  "Statuses",
  "Form Builder",
  "Email Templates",
  "SMS Templates",
];

export const DEFAULT_STATUSES = [
  {
    id: 1,
    name: "New Lead",
    description: "Fresh leads that need initial contact",
    color: "#3f8cff",
    order: 1,
    isDefault: true,
  },
  {
    id: 2,
    name: "Contacted",
    description: "Leads that have been contacted",
    color: "#f4b63e",
    order: 2,
    isDefault: false,
  },
  {
    id: 3,
    name: "Qualified",
    description: "Leads that meet qualification criteria",
    color: "#22c55e",
    order: 3,
    isDefault: false,
  },
  {
    id: 4,
    name: "Proposal Sent",
    description: "Leads with proposals sent",
    color: "#a855f7",
    order: 4,
    isDefault: false,
  },
];

export const DEFAULT_FORM_FIELDS = [
  {
    id: "company",
    label: "Company Name",
    type: "text",
    required: true,
    placeholder: "Tech Solutions Inc.",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "name@company.com",
  },
  {
    id: "budget",
    label: "Estimated Budget",
    type: "number",
    required: false,
    placeholder: "5000",
  },
  {
    id: "services",
    label: "Interested Service",
    type: "select",
    required: false,
    options: ["Consulting", "Implementation", "Support"],
  },
];

export const FIELD_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
];

// Mandatory fields that must always exist and be required
export const MANDATORY_FIELDS = [
  {
    id: "system_name",
    key: "system_name",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter full name",
    isMandatory: true,
  },
  {
    id: "system_email",
    key: "system_email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "name@company.com",
    isMandatory: true,
  },
  {
    id: "system_phone",
    key: "system_phone",
    label: "Phone",
    type: "tel",
    required: true,
    placeholder: "Enter contact number",
    isMandatory: true,
  },
];

// Helper function to check if a field is mandatory
export const isMandatoryField = (field) => {
  if (!field) return false;
  return ["system_name", "system_email", "system_phone"].includes(
    field.key || field.id
  );
};

// Helper function to ensure mandatory fields are present and properly configured
export const ensureMandatoryFields = (fields) => {
  const existingFields = (fields || []).map((f) => ({ ...f }));

  // Check presence using stable keys
  const hasName = existingFields.some(
    (f) => f.key === "system_name" || f.id === "system_name"
  );
  const hasEmail = existingFields.some(
    (f) => f.key === "system_email" || f.id === "system_email"
  );
  const hasPhone = existingFields.some(
    (f) => f.key === "system_phone" || f.id === "system_phone"
  );

  const fieldsWithMandatory = [...existingFields];

  if (!hasName) {
    fieldsWithMandatory.unshift({ ...MANDATORY_FIELDS[0] });
  }
  if (!hasEmail) {
    const insertIdx = !hasName
      ? 1
      : fieldsWithMandatory.findIndex(
          (f) => f.key === "system_name" || f.id === "system_name"
        ) + 1;
    // Just append if complex to calculate, but let's try to keep order: Name, Email, Phone
    fieldsWithMandatory.splice(1, 0, { ...MANDATORY_FIELDS[1] });
  }
  if (!hasPhone) {
    fieldsWithMandatory.splice(2, 0, { ...MANDATORY_FIELDS[2] });
  }

  // Clean up order if needed, but for now just ensure they exist
  // Ideally we want Name, Email, Phone at the top
  const systemFields = [];
  const customFields = [];

  fieldsWithMandatory.forEach((f) => {
    if (isMandatoryField(f)) systemFields.push(f);
    else customFields.push(f);
  });

  // Sort system fields: Name, Email, Phone
  systemFields.sort((a, b) => {
    const order = { system_name: 1, system_email: 2, system_phone: 3 };
    return (order[a.key || a.id] || 99) - (order[b.key || b.id] || 99);
  });

  return [...systemFields, ...customFields];
};
