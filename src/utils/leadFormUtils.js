export const mapLeadDataToFormValue = (field, lead, contact) => {
  if (!field || !lead) return "";
  
  const fieldId = String(field.id);
  const fieldKey = field.key || fieldId;

  // 1. System Fields Mapping
  if (fieldKey === "system_name") {
    return contact?.name || lead.contact?.name || "";
  }
  if (fieldKey === "system_email") {
    return contact?.email || lead.contact?.email || "";
  }
  if (fieldKey === "system_phone") {
    return contact?.phone || lead.contact?.phone || "";
  }

  // 2. Common Fields Mapping (Company)
  // Check both key 'company' and label 'Company' for legacy/fallback
  if (fieldKey === "company" || field.label?.toLowerCase() === "company") {
    return contact?.company || lead.contact?.company || "";
  }

  // 3. Status Mapping
  if (fieldKey === "status") {
    if (typeof lead.status === "object" && lead.status !== null) {
      return lead.status._id || lead.status.id || "";
    }
    return lead.status || "";
  }

  // 4. Source Mapping
  if (fieldKey === "source") {
    return lead.source || "";
  }

  // 5. Custom Fields Mapping
  // Try top-level flat structure first (e.g., from AddLeadModal or legacy)
  if (lead[fieldKey] !== undefined && lead[fieldKey] !== null) {
    return lead[fieldKey];
  }

  // Fallback to nested customFields
  if (lead.customFields) {
    if (lead.customFields instanceof Map) {
      const val =
        lead.customFields.get(fieldKey) ?? lead.customFields.get(fieldId);
      if (val !== undefined && val !== null) return String(val);
    } else {
      const val = lead.customFields[fieldKey] ?? lead.customFields[fieldId];
      if (val !== undefined && val !== null) return String(val);
    }
  }

  return "";
};
