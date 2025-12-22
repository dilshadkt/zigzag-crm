import { useMemo, useRef, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useAuth } from "../../hooks/useAuth";
import LeadsPageHeader from "./components/LeadsPageHeader";
import LeadsTable from "./components/LeadsTable";
import LeadsTableShimmer from "./components/LeadsTableShimmer";
import LeadsPagination from "./components/LeadsPagination";
import LeadsColumnEditor from "./components/LeadsColumnEditor";
import LeadActionsMenu from "./components/LeadActionsMenu";
import LeadUploadModal from "./components/LeadUploadModal";
import AddLeadModal from "./components/AddLeadModal";
import AssignLeadModal from "./components/AssignLeadModal";
import LeadsFilterDrawer from "./components/LeadsFilterDrawer";
import { useLeadsData } from "./hooks/useLeadsData";
import { useCreateLead, useUpdateLead, useDeleteLead, useBulkCreateLeads } from "./api";

const STORAGE_KEY = "leads-column-visibility";

// Helper functions for localStorage persistence
const loadColumnVisibility = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Ensure it's an object
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Error loading column visibility:", error);
    return null;
  }
};

const saveColumnVisibility = (columns) => {
  try {
    const visibilityMap = {};
    columns.forEach((col) => {
      visibilityMap[col.key] = col.visible;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibilityMap));
  } catch (error) {
    console.error("Error saving column visibility:", error);
  }
};

const clearColumnVisibility = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing column visibility:", error);
  }
};

const LeadsFeature = ({ onSelectLead, onOpenSettings }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEmployee = user?.role === "employee";
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [columns, setColumns] = useState([]);
  const [isColumnEditorOpen, setColumnEditorOpen] = useState(false);
  const [isLeadMenuOpen, setLeadMenuOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isAddLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [columnDraft, setColumnDraft] = useState([]);
  const hasInitializedColumns = useRef(false);
  const lastGeneratedColumnsKeys = useRef(null);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState(null);
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const navigate = useNavigate();

  // Mutations
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Use the custom hook to get leads data
  const {
    leads,
    pagination,
    formFields,
    statuses,
    columns: generatedColumns,
    isLoading,
    refetchLeads,
    isRefetching
  } = useLeadsData({
    page,
    limit: pageSize,
    search: debouncedSearch,
    appliedFilters,
  });

  // Initialize columns from generated columns
  useEffect(() => {
    // Only initialize if we have columns
    if (generatedColumns.length > 0) {
      const currentKeys = generatedColumns.map((c) => c.key).join(",");

      setColumns((prev) => {
        // On first initialization (when columns are empty or we haven't loaded from localStorage yet), always check localStorage
        if (prev.length === 0 || !hasInitializedColumns.current) {
          const savedVisibility = loadColumnVisibility();
          const initializedColumns = generatedColumns.map((col) => {
            // Use saved visibility if available, otherwise use default
            if (
              savedVisibility &&
              col.key in savedVisibility &&
              typeof savedVisibility[col.key] === "boolean"
            ) {
              return { ...col, visible: savedVisibility[col.key] };
            }
            return col;
          });
          setColumnDraft(initializedColumns);
          hasInitializedColumns.current = true;
          lastGeneratedColumnsKeys.current = currentKeys;
          return initializedColumns;
        }

        // If generated columns keys haven't changed, don't update (prevents unnecessary re-renders)
        if (lastGeneratedColumnsKeys.current === currentKeys) {
          return prev;
        }

        // If we already have columns, we need to merge in any new columns
        // while preserving the user's visibility choices
        const newColumnKeys = new Set(generatedColumns.map((c) => c.key));
        const prevColumnKeys = new Set(prev.map((c) => c.key));

        // Check if there are any changes
        const hasNewColumns = generatedColumns.some(
          (col) => !prevColumnKeys.has(col.key)
        );

        // If keys match exactly, no need to update (prevents loops)
        if (!hasNewColumns && prev.length === generatedColumns.length) {
          lastGeneratedColumnsKeys.current = currentKeys;
          return prev;
        }

        // Merge logic: Keep existing visibility for known columns, add new columns as hidden (or default)
        const mergedColumns = generatedColumns.map((newCol) => {
          const existing = prev.find((p) => p.key === newCol.key);
          if (existing) {
            return { ...newCol, visible: existing.visible };
          }
          return newCol;
        });

        setColumnDraft(mergedColumns);
        lastGeneratedColumnsKeys.current = currentKeys;
        return mergedColumns;
      });
    }
  }, [generatedColumns]);

  // Create lead mutation
  const { mutate: createLead, isLoading: isCreatingLead } = useCreateLead();
  const { mutate: bulkCreateLeads, isLoading: isBulkCreating } = useBulkCreateLeads();

  const visibleLeads = leads;

  const handleToggleSelect = (leadId) => {
    setSelectedLeadIds((prev) => {
      const stringId = String(leadId);
      return prev.includes(stringId)
        ? prev.filter((id) => id !== stringId)
        : [...prev, stringId];
    });
  };

  const handleToggleSelectAll = (shouldSelect, leadIds) => {
    setSelectedLeadIds((prev) => {
      const stringIds = leadIds.map((id) => String(id));
      if (shouldSelect) {
        const uniqueIds = new Set([...prev, ...stringIds]);
        return Array.from(uniqueIds);
      }
      return prev.filter((id) => !stringIds.includes(id));
    });
  };

  const handleAction = (action) => () => {
    if (action === "add-lead") {
      setAddLeadModalOpen(true);
    } else if (action === "add-filter") {
      setFilterDrawerOpen(true);
    } else if (action === "refresh") {
      refetchLeads();
    } else {
      console.info(`Leads action triggered: ${action}`);
    }
  };

  const handleLeadCreated = () => {
    refetchLeads(); // Reload leads after creating a new one
    queryClient.invalidateQueries(["leads"]);
  };

  const openColumnEditor = () => {
    setColumnDraft(columns.map((column) => ({ ...column })));
    setColumnEditorOpen(true);
  };

  const handleColumnToggle = (key) => {
    setColumnDraft((prev) => {
      const visibleCount = prev.filter((column) => column.visible).length;
      return prev.map((column) => {
        if (column.key === key) {
          if (column.visible && visibleCount === 1) {
            return column;
          }
          return { ...column, visible: !column.visible };
        }
        return column;
      });
    });
  };

  const resetColumns = () => {
    // Reset to default system columns visibility
    const defaultColumns = generatedColumns.map((col) => ({
      ...col,
      visible:
        col.isSystem &&
        [
          "createdAt",
          "contact.name",
          "name",
          "status",
          "contact.phone",
          "phone",
        ].includes(col.key),
    }));
    setColumnDraft(defaultColumns);
    // Clear saved visibility when resetting
    clearColumnVisibility();
  };

  const applyColumns = () => {
    setColumns(columnDraft);
    // Save column visibility to localStorage
    saveColumnVisibility(columnDraft);
    setColumnEditorOpen(false);
  };

  const closeColumnEditor = () => setColumnEditorOpen(false);
  const openLeadMenu = () => setLeadMenuOpen(true);
  const closeLeadMenu = () => setLeadMenuOpen(false);

  const openUploadModal = () => {
    setLeadMenuOpen(false);
    setUploadModalOpen(true);
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setIsUploading(false);
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleUploadStart = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(10); // Start progress

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Get headers and data
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!headers || headers.length === 0) {
          toast.error("File is empty or has no headers");
          setIsUploading(false);
          return;
        }

        // Validate Headers
        const normalize = (str) => String(str).toLowerCase().trim().replace(/['"]/g, '');
        const headerSet = new Set(headers.map(normalize));

        // Use formFields or fallback to default fields if empty
        let fieldsToUse = formFields;
        if (!fieldsToUse || fieldsToUse.length === 0) {
          fieldsToUse = [
            { label: "Full Name", key: "system_name", required: true },
            { label: "Email", key: "system_email", required: true },
            { label: "Phone Number", key: "system_phone", required: true },
            { label: "Company", key: "company" },
          ];
        }

        const missingFields = fieldsToUse.filter(f => f.required && !headerSet.has(normalize(f.label)) && !headerSet.has(normalize(f.key)));

        if (missingFields.length > 0) {
          const missingNames = missingFields.map(f => f.label || f.key).join(", ");
          if (!window.confirm(`Missing required columns: ${missingNames}. Do you want to proceed with potential data loss?`)) {
            setIsUploading(false);
            setUploadProgress(0);
            return;
          }
        }

        setUploadProgress(30); // Processing data...

        // Process Rows
        const processedLeads = jsonData.map(row => {
          const contact = {};
          const customFields = {};
          let statusId = null;

          // Helper to get value from row by checking label/key
          const getValue = (field) => {
            const normLabel = normalize(field.label);
            const normKey = normalize(field.key);

            // Find matching key in row
            const rowKey = Object.keys(row).find(k => {
              const nk = normalize(k);
              return nk === normLabel || nk === normKey;
            });

            return rowKey ? row[rowKey] : undefined;
          };

          fieldsToUse.forEach(field => {
            let value = getValue(field);

            // Handle Select / Dropdown defaults
            if (field.type === 'select') {
              // Check if value is valid option
              const isValidOption = value && field.options && field.options.includes(value);
              if (!isValidOption && field.options && field.options.length > 0) {
                // Set first value if empty or invalid
                value = field.options[0];
              }
            }

            // Map to correct structure
            const key = field.key || field.id;
            if (['system_name', 'name', 'Full Name'].includes(key)) contact.name = value;
            else if (['system_email', 'email', 'Email'].includes(key)) contact.email = value;
            else if (['system_phone', 'phone', 'Phone Number'].includes(key)) contact.phone = value;
            else if (['company', 'Company', 'companyName'].includes(key)) contact.company = value;
            else if (key === 'status') {
              // Try to match status name
              const statusObj = statuses.find(s => s.name === value || s.key === value || s._id === value);
              if (statusObj) statusId = statusObj._id;
            }
            else {
              customFields[key] = value;
            }
          });

          // Handle Status Default (First value if missing/invalid)
          if (!statusId) {
            const defaultStatus = statuses.find(s => s.isDefault) || statuses[0];
            statusId = defaultStatus?._id;
          }

          return {
            contact,
            status: statusId,
            customFields,
            source: 'Import'
          };
        });

        setUploadProgress(60); // Sending to server...

        // Send to server
        bulkCreateLeads(processedLeads, {
          onSuccess: () => {
            setUploadProgress(100);
            toast.success(`Imported ${processedLeads.length} leads successfully`);
            setTimeout(() => {
              closeUploadModal();
              refetchLeads();
            }, 500);
          },
          onError: (err) => {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to import leads");
            setUploadProgress(0);
            setIsUploading(false);
          }
        });

      } catch (error) {
        console.error("Error processing file:", error);
        toast.error("Error processing file. Please check format.");
        setIsUploading(false);
        setUploadProgress(0);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsUploading(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const canToggleColumn =
    columnDraft.filter((column) => column.visible).length > 1;

  // Action handlers
  const handleEdit = (lead) => {
    const leadId = lead._id || lead.id;
    if (leadId) {
      navigate(`/leads/${leadId}`, { state: lead });
    }
  };

  const handleSendEmail = (lead) => {
    const email = lead.contact?.email || lead.email;
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      toast.error("No email address found for this lead");
    }
  };

  const handleCreateTask = (lead) => {
    // Navigate to create task page with lead context
    navigate("/board", { state: { leadContext: lead } });
    toast.success("Redirecting to create task...");
  };

  const handleAssign = (lead) => {
    setSelectedLeadForAssign(lead);
    setAssignModalOpen(true);
  };

  const handleAssignConfirm = async (employeeId) => {
    if (!selectedLeadForAssign) return;

    try {
      const leadId = selectedLeadForAssign._id || selectedLeadForAssign.id;
      await updateLeadMutation.mutateAsync({
        leadId,
        leadData: { owner: employeeId },
      });
      toast.success("Lead owner updated successfully");
      setAssignModalOpen(false);
      setSelectedLeadForAssign(null);
      // Refetch leads to show updated owner with avatar
      refetchLeads();
      // Also invalidate queries to ensure fresh data
      queryClient.invalidateQueries(["leads"]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to assign lead");
    }
  };

  const handleDelete = async (lead) => {
    const leadName = lead.contact?.name || lead.name || "this lead";
    if (
      window.confirm(
        `Are you sure you want to delete ${leadName}? This action cannot be undone.`
      )
    ) {
      try {
        const leadId = lead._id || lead.id;
        await deleteLeadMutation.mutateAsync(leadId);
        toast.success("Lead deleted successfully");
        refetchLeads();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete lead");
      }
    }
  };

  const handleConvert = (lead) => {
    // TODO: Implement convert lead to customer/opportunity
    toast.info("Convert functionality coming soon");
  };

  const handleCopyURL = (lead) => {
    const leadId = lead._id || lead.id;
    const url = `${window.location.origin}/leads/${leadId}`;
    navigator.clipboard.writeText(url);
    toast.success("Lead URL copied to clipboard");
  };

  const handleStatusChange = async (lead, statusId) => {
    try {
      const leadId = lead._id || lead.id;
      await updateLeadMutation.mutateAsync({
        leadId,
        leadData: { status: statusId },
      });
      toast.success("Lead status updated successfully");
      refetchLeads();
      queryClient.invalidateQueries(["leads"]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleCustomFieldChange = async (lead, fieldKey, newValue) => {
    try {
      const leadId = lead._id || lead.id;

      // Update the customFields object
      const updatedCustomFields = {
        ...(lead.customFields || {}),
        [fieldKey]: newValue,
      };

      await updateLeadMutation.mutateAsync({
        leadId,
        leadData: { customFields: updatedCustomFields },
      });

      toast.success("Field updated successfully");
      refetchLeads();
      queryClient.invalidateQueries(["leads"]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update field");
    }
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setPage(1); // Reset to first page when filters change
    const filterCount = Object.keys(filters).length;
    if (filterCount > 0) {
      toast.success(`${filterCount} filter(s) applied successfully`);
    } else {
      toast.info("All filters cleared");
    }
  };

  const handleDownloadTemplate = () => {
    // Generate content from formFields
    let fieldsToUse = formFields;

    // Fallback if no form fields are loaded (mirrors AddLeadModal fallback)
    if (!fieldsToUse || fieldsToUse.length === 0) {
      fieldsToUse = [
        { label: "Full Name", key: "system_name" },
        { label: "Email", key: "system_email" },
        { label: "Phone Number", key: "system_phone" },
        { label: "Company", key: "company" },
      ];
    }

    // Use labels as headers, fallback to keys if label is missing
    const headers = fieldsToUse.map((field) => field.label || field.key);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]); // Add headers as first row

    // Adjust column widths based on header length (optional polish)
    const wscols = headers.map(h => ({ wch: h.length + 5 }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Leads Template");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "lead_import_template.xlsx");
  };

  return (
    <div className="relative bg-white h-full rounded-3xl border border-slate-100 overflow-hidden flex flex-col">
      <LeadsPageHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddLead={handleAction("add-lead")}
        onAddFilter={handleAction("add-filter")}
        onRefresh={handleAction("refresh")}
        isRefreshing={isRefetching}
        onToggleLayout={openColumnEditor}
        onDownload={handleAction("download")}
        onMoreActions={openLeadMenu}
      />
      {isLoading ? (
        <LeadsTableShimmer columns={columns.filter((col) => col.visible)} />
      ) : (
        <>
          <LeadsTable
            leads={visibleLeads}
            columns={columns.filter((col) => col.visible)}
            selectedLeadIds={selectedLeadIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onRowClick={onSelectLead}
            onEdit={handleEdit}
            onSendEmail={handleSendEmail}
            onCreateTask={handleCreateTask}
            onAssign={handleAssign}
            onDelete={handleDelete}
            onConvert={handleConvert}
            onCopyURL={handleCopyURL}
            statuses={statuses}
            onStatusChange={handleStatusChange}
            onCustomFieldChange={handleCustomFieldChange}
            isEmployee={isEmployee}
          />
          <LeadsPagination
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1); // Reset to first page when changing page size
            }}
            currentPage={page}
            onPageChange={setPage}
            visibleCount={visibleLeads.length}
            totalCount={pagination.total}
          />
        </>
      )}

      {isColumnEditorOpen && (
        <div
          className="absolute inset-0 bg-black/0 z-20"
          onClick={closeColumnEditor}
        >
          <div
            className="absolute right-6 top-5"
            onClick={(event) => event.stopPropagation()}
          >
            <LeadsColumnEditor
              columns={columnDraft}
              onToggleColumn={handleColumnToggle}
              onReset={resetColumns}
              onApply={applyColumns}
              onClose={closeColumnEditor}
              canToggleColumn={canToggleColumn}
            />
          </div>
        </div>
      )}

      {isLeadMenuOpen && (
        <div
          className="absolute inset-0 bg-black/0 z-30"
          onClick={closeLeadMenu}
        >
          <div
            className="absolute right-6 top-18"
            onClick={(event) => event.stopPropagation()}
          >
            <LeadActionsMenu
              onClose={closeLeadMenu}
              onUpload={openUploadModal}
              onDownloadTemplate={handleDownloadTemplate}
              onSettings={() => {
                closeLeadMenu();
                onOpenSettings && onOpenSettings();
              }}
            />
          </div>
        </div>
      )}

      <LeadUploadModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        file={selectedFile}
        onFileSelect={setSelectedFile}
        onUpload={handleUploadStart}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
      />

      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setAddLeadModalOpen(false)}
        onSuccess={handleLeadCreated}
      />

      <AssignLeadModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedLeadForAssign(null);
        }}
        onAssign={handleAssignConfirm}
        currentOwner={selectedLeadForAssign?.owner}
      />

      <LeadsFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
        formFields={formFields}
        statuses={statuses}
        currentFilters={appliedFilters}
      />
    </div>
  );
};

export default LeadsFeature;
