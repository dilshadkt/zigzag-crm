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

  // Find existing mandatory fields
  const existingName = existingFields.find(
    (f) => f.key === "system_name" || f.id === "system_name"
  );
  const existingEmail = existingFields.find(
    (f) => f.key === "system_email" || f.id === "system_email"
  );
  const existingPhone = existingFields.find(
    (f) => f.key === "system_phone" || f.id === "system_phone"
  );

  // Separate mandatory and custom fields
  const systemFields = [];
  const customFields = [];

  existingFields.forEach((f) => {
    if (!isMandatoryField(f)) {
      customFields.push(f);
    }
  });

  // Add mandatory fields (preserving existing data if present, otherwise using defaults)
  // Preserve the required status - don't force it to true
  systemFields.push(
    existingName
      ? { ...existingName, isMandatory: true }
      : { ...MANDATORY_FIELDS[0] }
  );
  systemFields.push(
    existingEmail
      ? { ...existingEmail, isMandatory: true }
      : { ...MANDATORY_FIELDS[1] }
  );
  systemFields.push(
    existingPhone
      ? { ...existingPhone, isMandatory: true }
      : { ...MANDATORY_FIELDS[2] }
  );

  return [...systemFields, ...customFields];
};
