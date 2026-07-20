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
    let currentSource = lead.source || "";
    
    // Normalize source strings that come from webhook like "Facebook Lead Ads"
    if (currentSource) {
      const lowerSrc = currentSource.toLowerCase();
      if (lowerSrc.includes("facebook")) currentSource = "Facebook";
      else if (lowerSrc.includes("whatsapp")) currentSource = "WhatsApp";
      else if (lowerSrc.includes("instagram")) currentSource = "Instagram";
    }

    if (!currentSource || currentSource === "Manual") {
      if (lead.facebookLeadId || lead.platform?.toLowerCase() === "facebook") {
        currentSource = "Facebook";
      } else if (lead.whatsappContactId || lead.platform?.toLowerCase() === "whatsapp") {
        currentSource = "WhatsApp";
      } else if (!currentSource) {
        currentSource = "Manual";
      }
    }
    
    // If we have options, ensure it maps to Other if missing, but we don't have options here.
    // The CustomSelect fallback will show the literal value if it doesn't match an option.
    return currentSource;
  }

  // 5. Custom Fields Mapping
  // Try top-level flat structure first (e.g., from AddLeadModal or legacy)
  if (lead[fieldKey] !== undefined && lead[fieldKey] !== null) {
    return lead[fieldKey];
  }

  // Try nested details.contact (modern structure)
  if (lead.details?.contact) {
    const val = lead.details.contact[fieldKey] ?? lead.details.contact[fieldId];
    if (val !== undefined && val !== null) return String(val);
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
