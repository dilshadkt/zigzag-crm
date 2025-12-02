import { useMemo } from "react";
import { useGetLeads, useGetLeadFormConfig, useGetLeadStatuses } from "../api";

export const useLeadsData = (filters = {}) => {
  const {
    page = 1,
    limit = 15,
    search,
    status,
    owner,
    source,
    sortBy = "createdAt",
    sortOrder = "desc",
    appliedFilters,
  } = filters;

  // Fetch leads data
  const {
    data: leadsData,
    isLoading: leadsLoading,
    error: leadsError,
    refetch: refetchLeads,
    isRefetching,
  } = useGetLeads({
    page,
    limit,
    search,
    status,
    owner,
    source,
    sortBy,
    sortOrder,
    filters: appliedFilters,
  });

  // Fetch form configuration
  const { data: formConfigData, isLoading: formConfigLoading } =
    useGetLeadFormConfig();

  // Fetch statuses
  const { data: statusesData, isLoading: statusesLoading } =
    useGetLeadStatuses();

  const isLoading = leadsLoading || formConfigLoading || statusesLoading;

  // Extract leads and pagination info
  const leads = useMemo(() => {
    return leadsData?.data || [];
  }, [leadsData]);

  const pagination = useMemo(() => {
    return (
      leadsData?.pagination || {
        page: 1,
        limit: 15,
        total: 0,
        pages: 0,
      }
    );
  }, [leadsData]);

  // Extract form fields
  const formFields = useMemo(() => {
    return formConfigData?.data?.fields || [];
  }, [formConfigData]);

  // Extract statuses
  const statuses = useMemo(() => {
    return statusesData?.data || [];
  }, [statusesData]);

  // Generate columns from backend meta or fallback to form fields
  const columns = useMemo(() => {
    // If backend provides columns (new formatted way)
    if (leadsData?.meta?.columns) {
      const backendColumns = leadsData.meta.columns;

      // Filter columns to match ONLY fields available in the form (plus essential meta)
      // Essential meta: createdAt, status (if not in form)

      // 1. Map form fields to expected column keys
      const validKeys = new Set();

      // Always allow createdAt (system meta)
      validKeys.add("createdAt");
      // Always allow status (system meta - often managed outside form)
      validKeys.add("status");
      // Always allow owner (system meta)
      validKeys.add("owner");

      // Create a map of field key to field data for enrichment
      const fieldDataMap = new Map();
      formFields.forEach((field) => {
        let key = field.key || field.id;
        // Map system keys
        if (key === "system_name") key = "name";
        if (key === "system_email") key = "email";
        if (key === "system_phone") key = "phone";
        if (key === "company") key = "companyName";

        validKeys.add(key);
        fieldDataMap.set(key, field);
      });

      // 2. Filter and enrich backend columns with field metadata
      return backendColumns
        .filter((col) => validKeys.has(col.key))
        .map((col) => {
          const fieldData = fieldDataMap.get(col.key);
          return {
            ...col,
            // Add field type and options if available
            type: fieldData?.type || col.type,
            fieldType: fieldData?.type || col.fieldType,
            options: fieldData?.options || col.options || [],
            // Default visibility logic
            visible: col.isSystem
              ? ["createdAt", "name", "status", "phone", "owner"].includes(col.key)
              : false, // Custom fields hidden by default
          };
        });
    }

    // Fallback: Default system columns (old way)
    const systemColumns = [
      { key: "createdAt", label: "Created On", visible: true, isSystem: true },
      { key: "contact.name", label: "Name", visible: true, isSystem: true },
      { key: "status", label: "Status", visible: true, isSystem: true },
      { key: "contact.phone", label: "Phone", visible: true, isSystem: true },
      { key: "contact.email", label: "Email", visible: false, isSystem: true },
    ];

    // Generate columns from form fields
    const fieldColumns = formFields
      .filter((field) => {
        // Only show certain field types as columns
        return ["text", "email", "tel", "select", "number"].includes(
          field.type
        );
      })
      .map((field) => ({
        key: field.id || field._id, // Use ID if available
        label: field.label,
        visible: false, // Hidden by default, user can enable
        isSystem: false,
        fieldId: field.id,
        fieldType: field.type,
        type: field.type,
        options: field.options || [], // Include options for select fields
      }));

    return [...systemColumns, ...fieldColumns];
  }, [leadsData?.meta?.columns, formFields]);

  return {
    leads,
    pagination,
    formFields,
    statuses,
    columns,
    isLoading,
    error: leadsError,
    refetchLeads,
    isRefetching
  };
};
