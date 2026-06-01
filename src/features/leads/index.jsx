import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { FiPlus, FiDownload, FiTrash2, FiFolder, FiUser } from "react-icons/fi";
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
import LeadsDashboard from "./components/LeadsDashboard";
import { useLeadsData } from "./hooks/useLeadsData";
import { useCreateLead, useUpdateLead, useDeleteLead, useBulkCreateLeads, useGetLeadStats, useGetLeads, useBulkUpdateLeads, useBulkDeleteLeads } from "./api";
import { useSyncAllCampaignLeads } from "../../api/campaignDetails";
import { useCompanyActiveProjects, useGetAllEmployees } from "../../api/hooks";
import { useGetClientSalesTeam } from "../../api/clientSalesTeam";

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

const LeadsFeature = ({
  onSelectLead,
  onOpenSettings,
  projectId,
  isFollowUpOnly = false,
  branchFilter = "",
  branches = [],
  projectFilter = "",
  isClient = false,
  onBranchFilterChange,
  onProjectFilterChange,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: projects = [] } = useCompanyActiveProjects();
  const { data: employeesData } = useGetAllEmployees(!isClient);
  const { data: salesTeamData } = useGetClientSalesTeam(projectId || null);
  const ownersList = (isClient || projectId) ? (salesTeamData?.data || []) : (employeesData?.employees || []);
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === "company-admin";
  const isEmployee = user?.role === "employee";
  // Check if current user is client (either from prop or from user role)
  const isUserClient = isClient || user?.role === "client";
  const canManageAllLeads = (hasPermission("leads", "viewAll")) && !isUserClient;
  const canAddLead = hasPermission("leads", "create") || (isUserClient && user?.permissions?.includes("add_lead"));
  const canEditLead = hasPermission("leads", "edit") || hasPermission("tasks", "editLead");

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
  const [showDashboard, setShowDashboard] = useState(true);
  const [isBulkBranchMenuOpen, setBulkBranchMenuOpen] = useState(false);
  const [bulkBarPos, setBulkBarPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [projectFilterState, setProjectFilter] = useState("");
  const [ownerFilterState, setOwnerFilterState] = useState(() => sessionStorage.getItem('leads_ownerFilter') || "");

  useEffect(() => {
    if (ownerFilterState) sessionStorage.setItem('leads_ownerFilter', ownerFilterState);
    else sessionStorage.removeItem('leads_ownerFilter');
  }, [ownerFilterState]);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Persist states to session storage
  const [activeStatusId, setActiveStatusId] = useState(() => sessionStorage.getItem('leads_activeStatusId') || null);
  const [activeAction, setActiveAction] = useState(() => sessionStorage.getItem('leads_activeAction') || null);
  const [appliedFilters, setAppliedFilters] = useState(() => {
    const saved = sessionStorage.getItem(`leads_appliedFilters_${projectId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [statsDateRange, setStatsDateRange] = useState(() => {
    const saved = sessionStorage.getItem('leads_statsDateRange');
    return saved ? JSON.parse(saved) : { startDate: '', endDate: '', preset: '' };
  });

  useEffect(() => {
    if (activeStatusId) sessionStorage.setItem('leads_activeStatusId', activeStatusId);
    else sessionStorage.removeItem('leads_activeStatusId');
  }, [activeStatusId]);

  useEffect(() => {
    if (activeAction) sessionStorage.setItem('leads_activeAction', activeAction);
    else sessionStorage.removeItem('leads_activeAction');
  }, [activeAction]);

  useEffect(() => {
    sessionStorage.setItem(`leads_appliedFilters_${projectId}`, JSON.stringify(appliedFilters));
  }, [appliedFilters, projectId]);

  useEffect(() => {
    sessionStorage.setItem('leads_statsDateRange', JSON.stringify(statsDateRange));
  }, [statsDateRange]);

  // Stats
  const { data: statsData, isLoading: statsLoading } = useGetLeadStats({
    project: projectFilterState || projectFilter || projectId,
    timezoneOffset: new Date().getTimezoneOffset(),
    ...(statsDateRange.startDate && statsDateRange.endDate ? {
      startDate: statsDateRange.startDate,
      endDate: statsDateRange.endDate
    } : {}),
    ...(branchFilter ? { branch: branchFilter } : {}),
    ...(ownerFilterState ? { owner: ownerFilterState } : {}),
    ...(isFollowUpOnly ? { isFollowUp: true } : {})
  });



  const leadStats = useMemo(() => {
    return statsData?.data;
  }, [statsData]);


  // Mutations
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const bulkUpdateMutation = useBulkUpdateLeads();
  const bulkDeleteMutation = useBulkDeleteLeads();
  const syncAllCampaignLeadsMutation = useSyncAllCampaignLeads();

  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  // Handle URL filters on mount
  useEffect(() => {
    const scheduled = searchParams.get('scheduled');
    const minScore = searchParams.get('minScore');
    const ownerId = searchParams.get('owner');

    if (scheduled === 'today') {
      setAppliedFilters({
        scheduled: { operator: 'today', value: 'today' }
      });
      setActiveAction('followup');
      toast.success("Showing today's follow-ups");
    } else if (minScore) {
      setAppliedFilters({
        score: { operator: 'greaterThan', value: minScore }
      });
      setActiveAction('hot');
      toast.success(`Showing leads with score > ${minScore}`);
    } else if (ownerId) {
      setAppliedFilters({
        owner: { operator: 'equals', value: ownerId }
      });
      toast.success("Filtering leads by assigned employee");
    }

    // Clear params from URL to avoid re-applying on refresh if not desired, 
    // but typically we keep them. User asked to "list the lead who need to follow up"
    // so applying it on mount is better.
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when branch filter changes
  useEffect(() => {
    setPage(1);
  }, [branchFilter]);

  // Reset page when project filter changes
  useEffect(() => {
    setPage(1);
  }, [projectFilterState]);

  // Reset page when owner filter changes
  useEffect(() => {
    setPage(1);
  }, [ownerFilterState]);

  // Use the custom hook to get leads data
  const {
    leads,
    pagination,
    formFields,
    statuses,
    columns: generatedColumns,
    isLoading,
    refetchLeads,
    isRefetching,
    isFetching
  } = useLeadsData({
    page,
    limit: pageSize,
    search: debouncedSearch,
    status: activeStatusId,
    // Only force own owner if user is employee AND NOT allowed to see all leads
    // Otherwise allow filtering by owner from ownerFilterState or appliedFilters (dashboard click)
    owner: (isEmployee && !canManageAllLeads) ? user._id : (ownerFilterState || appliedFilters.owner?.value || null),
    appliedFilters,
    projectId: projectFilterState || projectFilter || projectId,
    isFollowUp: isFollowUpOnly,
    branchFilter,
    startDate: statsDateRange.startDate,
    endDate: statsDateRange.endDate,
    timezoneOffset: new Date().getTimezoneOffset(),
    isInfiniteScroll: isClient && isMobile,
  });

  const loadMoreRef = useRef(null);
  const fetchingPageRef = useRef(null);

  useEffect(() => {
    if (!isFetching) {
      fetchingPageRef.current = null;
    }
  }, [isFetching]);

  const handleScroll = useCallback((e) => {
    if (!isClient || !isMobile) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (page < pagination?.pages && !isFetching && fetchingPageRef.current !== page) {
        fetchingPageRef.current = page;
        setPage(p => p + 1);
      }
    }
  }, [isClient, isMobile, page, pagination?.pages, isFetching]);
  const handleStatusFilter = (statusId) => {
    setActiveStatusId((prev) => (prev === statusId ? null : statusId));
    setAppliedFilters({});
    setActiveAction(null);
    setPage(1);
  };

  const handleActionFilter = (action) => {
    setActiveAction((prev) => (prev === action ? null : action));
    setActiveStatusId(null);
    setPage(1);

    switch (action) {
      case 'hot':
        setAppliedFilters({ score: { operator: 'greaterThan', value: '70' } });
        break;
      case 'weak':
        setAppliedFilters({ score: { operator: 'lessThan', value: '30' } });
        break;
      case 'followup':
        setAppliedFilters({ scheduled: { operator: 'today', value: 'today' } });
        break;
      case 'today':
        setAppliedFilters({ createdAt: { operator: 'today', value: 'today' } });
        break;
      case 'week':
        setAppliedFilters({ createdAt: { operator: 'last7days', value: 'last7days' } });
        break;
      default:
        setAppliedFilters({});
    }
  };

  const handleDatePresetChange = (e) => {
    const preset = e.target.value;
    if (!preset) {
      setStatsDateRange({ preset: '', startDate: '', endDate: '' });
      return;
    }

    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'today':
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case 'this_week':
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        break;
      case 'last_week':
        const lastWeekEnd = new Date(start);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay());
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekStart.getDate() - 6);
        start = lastWeekStart;
        end = lastWeekEnd;
        break;
      case 'this_month':
        start.setDate(1);
        break;
      case 'last_month':
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        end.setDate(0);
        break;
      default:
        break;
    }

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${d}`;
    };

    setStatsDateRange({
      preset,
      startDate: formatDate(start),
      endDate: formatDate(end)
    });
  };

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

  const visibleLeads = useMemo(() => {
    return leads;
  }, [leads]);


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
      syncAllCampaignLeadsMutation.mutate(null, {
        onSuccess: (data) => {
          toast.success(data?.message || "Campaign sync started in background");
          refetchLeads();
        },
        onError: (err) => {
          console.error("[Sync All] Error:", err);
          toast.error(err?.response?.data?.message || "Failed to sync campaign leads");
        }
      });
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
          "score",
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

  const handleAssignConfirm = async (assigneeId, assignType) => {
    if (!selectedLeadForAssign) return;

    try {
      const updatePayload = assignType === "salesPerson"
        ? { clientOwner: assigneeId }
        : { owner: assigneeId };

      if (selectedLeadForAssign === 'bulk') {
        if (selectedLeadIds.length === 0) return;
        await bulkUpdateMutation.mutateAsync({
          leadIds: selectedLeadIds,
          updateData: updatePayload,
        });
        toast.success(assignType === "salesPerson" ? `Assigned ${selectedLeadIds.length} leads to sales team member` : `Assigned ${selectedLeadIds.length} leads to owner`);
        setSelectedLeadIds([]);
      } else {
        const leadId = selectedLeadForAssign._id || selectedLeadForAssign.id;
        await updateLeadMutation.mutateAsync({
          leadId,
          leadData: updatePayload,
        });
        toast.success(assignType === "salesPerson" ? "Lead assigned to sales team member" : "Lead owner updated successfully");
      }
      
      setAssignModalOpen(false);
      setSelectedLeadForAssign(null);
      refetchLeads();
      queryClient.invalidateQueries(["leads"]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to assign lead(s)");
    }
  };

  // Wrapper so handleAssignConfirm receives (id, type) from the modal
  const handleAssignWithType = (assigneeId, assignType) => handleAssignConfirm(assigneeId, assignType);

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

  const handleMoveToBranch = async (lead, branchName) => {
    try {
      const leadId = lead._id || lead.id;
      const updatedCustomFields = {
        ...(lead.customFields || {}),
        branch: branchName,
      };

      await updateLeadMutation.mutateAsync({
        leadId,
        leadData: {
          branch: branchName,
          customFields: updatedCustomFields
        },
      });

      toast.success(`Lead moved to branch: ${branchName}`);
      refetchLeads();
      queryClient.invalidateQueries(["leads"]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to move lead to branch");
    }
  };

  const handleMoveToProject = async (lead, targetProjectId, targetProjectName) => {
    try {
      const leadId = lead._id || lead.id;

      await updateLeadMutation.mutateAsync({
        leadId,
        leadData: {
          project: targetProjectId,
        },
      });

      toast.success(`Lead moved to project: ${targetProjectName}`);
      refetchLeads();
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["projectDetails", projectId]);
      queryClient.invalidateQueries(["projectDetails", targetProjectId]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to move lead to project");
    }
  };

  const handleBulkMoveToBranch = async (branchName) => {
    if (selectedLeadIds.length === 0) return;

    try {
      await bulkUpdateMutation.mutateAsync({
        leadIds: selectedLeadIds,
        updateData: {
          branch: branchName,
          "customFields.branch": branchName
        },
      });

      toast.success(`Moved ${selectedLeadIds.length} leads to branch: ${branchName}`);
      setSelectedLeadIds([]);
      refetchLeads();
      queryClient.invalidateQueries(["leads"]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to move leads to branch");
    }
  };

  const handleDragStart = (e) => {
    // Only drag if left clicking on the bar (not buttons)
    if (e.button !== 0) return;

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - bulkBarPos.x,
      y: e.clientY - bulkBarPos.y,
    };

    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;

    setBulkBarPos({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y,
    });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

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
    <section className="h-full overflow-hidden">
      <div 
        className="h-full overflow-y-auto scrollbar-hide flex flex-col gap-y-1" 
        id="leads-scroll-container"
        onScroll={handleScroll}
      >

        {/* Global Filters Row */}
        {((branches && branches.length > 0 && !isClient) || true) && (
          <div className="flex flex-row flex-wrap justify-start sm:justify-end items-center gap-2 sm:gap-3 bg-white p-2 md:p-3 px-4 border border-slate-100 rounded-xl shrink-0 animate-in fade-in duration-300 overflow-x-auto no-scrollbar">
            {/* Date Filter */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:flex text-[10px] font-extrabold text-slate-400 uppercase tracking-widest items-center gap-1.5">
                <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Date Range:
              </span>
              <select
                value={statsDateRange?.preset || ''}
                onChange={handleDatePresetChange}
                className="w-auto px-2 sm:px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none min-w-[110px] cursor-pointer bg-slate-50/50 hover:bg-white transition-all duration-300 text-slate-700"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </select>
            </div>

            {/* Branch Filter (Provided by Parent) */}
            {branches && branches.length > 0 && typeof onBranchFilterChange === 'function' && (
              <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-200 pl-2 sm:pl-3">
                <span className="hidden sm:flex text-[10px] font-extrabold text-slate-400 uppercase tracking-widest items-center gap-1.5">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Branch View:
                </span>
                <select
                  value={branchFilter || ""}
                  onChange={(e) => onBranchFilterChange(e.target.value)}
                  className="w-auto px-2 sm:px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none min-w-[110px] cursor-pointer bg-slate-50/50 hover:bg-white transition-all duration-300 text-slate-700"
                >
                  <option value="">Global Overview</option>
                  {branches.map(b => (
                    <option key={b.id || b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Project Filter */}
            {!isClient && !projectId && (
              <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-200 pl-2 sm:pl-3">
                <span className="hidden sm:flex text-[10px] font-extrabold text-slate-400 uppercase tracking-widest items-center gap-1.5">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3" />
                  </svg>
                  Project View:
                </span>
                <select
                  value={projectFilterState || ""}
                  onChange={(e) => {
                    setProjectFilter(e.target.value);
                    if (onProjectFilterChange) onProjectFilterChange(e.target.value);
                  }}
                  className="w-auto px-2 sm:px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none min-w-[110px] cursor-pointer bg-slate-50/50 hover:bg-white transition-all duration-300 text-slate-700"
                >
                  <option value="">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Owner Filter */}
            {ownersList && ownersList.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-200 pl-2 sm:pl-3">
                <span className="hidden sm:flex text-[10px] font-extrabold text-slate-400 uppercase tracking-widest items-center gap-1.5">
                  <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Owner:
                </span>
                <select
                  value={ownerFilterState}
                  onChange={(e) => setOwnerFilterState(e.target.value)}
                  className="w-auto px-2 sm:px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none min-w-[110px] cursor-pointer bg-slate-50/50 hover:bg-white transition-all duration-300 text-slate-700"
                >
                  <option value="">All Owners</option>
                  {ownersList.map(u => {
                    const id = u._id || u.id;
                    const name = (isClient || projectId) ? u.name : (`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || "Unknown");
                    return <option key={id} value={id}>{name}</option>;
                  })}
                </select>
              </div>
            )}
          </div>
        )}

        {/* dashboard section  */}
        {showDashboard && (
          <div className="shrink-0 bg-white rounded-2xl p-2 md:p-3 md:px-4 border border-slate-100 overflow-x-auto
           touch-pan-x scrollbar-hide">
            <LeadsDashboard
              stats={leadStats}
              isLoading={statsLoading}
              activeStatusId={activeStatusId}
              onStatusClick={handleStatusFilter}
              activeAction={activeAction}
              onActionClick={handleActionFilter}
              statsDateRange={statsDateRange}
              setStatsDateRange={setStatsDateRange}
            />
          </div>
        )}
        <div className="relative bg-white grow shrink-0 rounded-2xl border border-slate-100 pb-2">
          <div className="sticky top-0 z-40 bg-white rounded-t-2xl">
            <LeadsPageHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddLead={handleAction("add-lead")}
              onAddFilter={handleAction("add-filter")}
              onRefresh={handleAction("refresh")}
              isRefreshing={isRefetching || syncAllCampaignLeadsMutation.isPending}
              onToggleLayout={openColumnEditor}
              onDownload={handleAction("download")}
              onMoreActions={openLeadMenu}
              showDashboard={showDashboard}
              onToggleDashboard={() => setShowDashboard(!showDashboard)}
              isClient={isClient}
              canAddLead={canAddLead}
            />
          </div>
          {isLoading ? (
            <LeadsTableShimmer columns={columns.filter((col) => col.visible)} />
          ) : (
            <>
              <div>
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
                  onConvert={!isClient ? handleConvert : null}
                  onCopyURL={handleCopyURL}
                  statuses={statuses}
                  onStatusChange={handleStatusChange}
                  onCustomFieldChange={handleCustomFieldChange}
                  onMoveToBranch={handleMoveToBranch}
                  branches={branches}
                  canManage={canEditLead}
                  projects={projects}
                  onMoveToProject={!isClient ? handleMoveToProject : null}
                  scrollContainerId="leads-scroll-container"
                  bottomContent={
                    isClient && isMobile ? (
                      <div ref={loadMoreRef} className="py-6 flex justify-center">
                        {isFetching && (
                          <div className="w-5 h-5 border-2 border-[#3f8cff] border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    ) : null
                  }
                />
              </div>
              {!(isClient && isMobile) && (
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-2 md:p-3 rounded-b-2xl z-30">
                  <LeadsPagination
                    pageSize={pageSize}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1); // Reset to first page when changing page size
                    }}
                    currentPage={page}
                    onPageChange={setPage}
                    visibleCount={visibleLeads.length}
                    totalCount={pagination?.total}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Bulk Actions Bar */}
        {selectedLeadIds.length > 0 && (
          <div
            className={`fixed z-50 bg-slate-900 text-white ${
              isMobile ? 'bottom-[90px] right-6 px-4 py-2.5 gap-3' : 'bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 gap-6'
            } rounded-full shadow-2xl flex items-center border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300 ${isDragging ? 'cursor-grabbing scale-105 opacity-90 transition-none' : 'cursor-grab'}`}
            style={{
              transform: isMobile 
                ? `translate(${bulkBarPos.x}px, ${bulkBarPos.y}px)`
                : `translate(calc(-50% + ${bulkBarPos.x}px), ${bulkBarPos.y}px)`,
              transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseDown={handleDragStart}
          >
            <div className={`flex items-center ${isMobile ? 'gap-2 pr-3' : 'gap-3 pr-6'} border-r border-slate-700 pointer-events-none select-none`}>
              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {selectedLeadIds.length}
              </span>
              {!isMobile && <span className="text-sm font-medium">Leads Selected</span>}
            </div>

            <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-4'}`} onMouseDown={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setSelectedLeadForAssign('bulk');
                  setAssignModalOpen(true);
                }}
                className={`flex items-center gap-2 text-[13px] font-medium transition-colors hover:text-blue-400`}
                title="Change Owner"
              >
                <FiUser className={`${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
                {!isMobile && "Change Owner"}
              </button>

              <div className="relative">
                {canEditLead && (
                  <button
                    onClick={() => setBulkBranchMenuOpen(!isBulkBranchMenuOpen)}
                    className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${isBulkBranchMenuOpen ? 'text-blue-400' : 'hover:text-blue-400'}`}
                    title="Move to Branch"
                  >
                    <FiFolder className={`${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
                    {!isMobile && "Move to Branch"}
                  </button>
                )}

                {/* Branch Selection Tooltip/Menu */}
                {isBulkBranchMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[-1]"
                      onClick={() => setBulkBranchMenuOpen(false)}
                    />
                    <div className={`absolute bottom-full ${isMobile ? 'right-0' : 'left-0'} mb-1.5 w-40 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Branch
                      </div>
                      {branches && branches.length > 0 ? (
                        branches.map((branch) => (
                          <button
                            key={branch.id || branch.name}
                            onClick={() => {
                              handleBulkMoveToBranch(branch.name);
                              setBulkBranchMenuOpen(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                          >
                            {branch.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-1.5 text-xs text-slate-400">No branches found</div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete ${selectedLeadIds.length} leads?`)) {
                    try {
                      await bulkDeleteMutation.mutateAsync(selectedLeadIds);
                      toast.success(`Successfully deleted ${selectedLeadIds.length} leads`);
                      setSelectedLeadIds([]);
                      refetchLeads();
                      queryClient.invalidateQueries(["leads"]);
                    } catch (error) {
                      toast.error(error?.response?.data?.message || "Failed to delete leads");
                    }
                  }
                }}
                className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                disabled={bulkDeleteMutation.isPending}
                title="Delete Leads"
              >
                <FiTrash2 className="w-4 h-4" />
                {!isMobile && (bulkDeleteMutation.isPending ? "Deleting..." : "Delete")}
              </button>

              <button
                onClick={() => setSelectedLeadIds([])}
                className={`text-sm font-medium text-slate-400 hover:text-white transition-colors ${isMobile ? 'pl-2 border-l border-slate-700' : ''}`}
                title="Cancel Selection"
              >
                {isMobile ? "✕" : "Cancel"}
              </button>
            </div>
          </div>
        )}
      </div>

      {isColumnEditorOpen && (
        <div
          className="absolute inset-0 bg-black/0 z-50"
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
          className="absolute inset-0 bg-black/0 z-50"
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
        projectId={projectId}
        branches={branches}
        defaultBranch={branchFilter}
      />

      <AssignLeadModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedLeadForAssign(null);
        }}
        onAssign={handleAssignWithType}
        currentOwner={selectedLeadForAssign?.owner}
        currentClientOwner={selectedLeadForAssign?.clientOwner}
        isClient={isClient}
        projectId={selectedLeadForAssign?.project?._id || selectedLeadForAssign?.project || projectId}
      />

      <LeadsFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
        formFields={formFields}
        statuses={statuses}
        currentFilters={appliedFilters}
        isClient={isClient}
        projectId={projectId}
      />

      {/* Floating Add Lead Button for Mobile / Client Dashboard */}
      {canAddLead && (
        <button
          onClick={() => setAddLeadModalOpen(true)}
          className="fixed bottom-[90px] left-6 z-50 md:hidden flex items-center justify-center bg-[#3f8cff] text-white w-12 h-12 rounded-full shadow-xl hover:bg-[#2f6bff] active:scale-95 transition-all duration-300"
          aria-label="Add lead"
        >
          <FiPlus size={22} />
        </button>
      )}
    </section>
  );
};

export default LeadsFeature;
