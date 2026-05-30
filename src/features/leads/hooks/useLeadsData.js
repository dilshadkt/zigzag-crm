import React, { useMemo, useEffect, useState } from "react";
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
    projectId,
    isFollowUp,
    branchFilter,
    startDate,
    endDate,
    timezoneOffset,
  } = filters;

  // Fetch leads data
  const {
    data: leadsData,
    isLoading: leadsLoading,
    error: leadsError,
    refetch: refetchLeads,
    isRefetching,
    isFetching,
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
    project: projectId,
    isFollowUp,
    branch: branchFilter,
    startDate,
    endDate,
    timezoneOffset,
  });

  // Fetch form configuration
  const { data: formConfigData, isLoading: formConfigLoading } =
    useGetLeadFormConfig(projectId);

  // Fetch statuses
  const { data: statusesData, isLoading: statusesLoading } =
    useGetLeadStatuses();

  const isLoading = leadsLoading || formConfigLoading || statusesLoading;
  
  const [accumulatedLeads, setAccumulatedLeads] = React.useState([]);

  // Extract leads and pagination info
  React.useEffect(() => {
    if (leadsData?.data) {
      if (filters.isInfiniteScroll) {
        if (page === 1) {
          setAccumulatedLeads(leadsData.data);
        } else {
          setAccumulatedLeads((prev) => {
            const prevIds = new Set(prev.map(p => p._id || p.id));
            const newLeads = leadsData.data.filter(l => !prevIds.has(l._id || l.id));
            return [...prev, ...newLeads];
          });
        }
      } else {
        setAccumulatedLeads(leadsData.data);
      }
    }
  }, [leadsData?.data, filters.isInfiniteScroll, page]);

  const leads = useMemo(() => {
    return accumulatedLeads;
  }, [accumulatedLeads]);

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
      // Always allow score (system meta - lead scoring)
      validKeys.add("score");
      // Always allow owner (system meta)
      validKeys.add("owner");
      // Always allow branch (system meta)
      validKeys.add("branch");

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
              ? ["createdAt", "name", "status", "score", "phone", "owner", "branch"].includes(col.key)
              : false, // Custom fields hidden by default
          };
        });
    }

    // Fallback: Default system columns (old way)
    const systemColumns = [
      { key: "createdAt", label: "Created On", visible: true, isSystem: true },
      { key: "name", label: "Name", visible: true, isSystem: true },
      { key: "status", label: "Status", visible: true, isSystem: true },
      { key: "score", label: "Score", visible: true, isSystem: true, type: "score" },
      { key: "phone", label: "Phone", visible: true, isSystem: true },
      { key: "email", label: "Email", visible: false, isSystem: true },
      { key: "owner", label: "Owner", visible: true, isSystem: true },
      { key: "branch", label: "Branch", visible: true, isSystem: true },
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
    isRefetching,
    isFetching
  };
};
