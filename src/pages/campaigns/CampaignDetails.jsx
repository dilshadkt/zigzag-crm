import { useRef, useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { FiCalendar, FiCheckCircle, FiDollarSign, FiEdit2, FiSave, FiTrash2, FiX, FiChevronDown, FiRefreshCw, FiClock, FiSearch, FiDownload, FiUser, FiPhone, FiMail, FiExternalLink, FiLoader } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useAddLeadsToCampaign, useDeleteCampaign, useGetCampaignById, useRemoveLeadFromCampaign, useUpdateCampaign, useFetchLiveFacebookData, useSyncCampaignLeads, useGetCampaignLeads } from "../../api/campaignDetails";
import AddLeadsModal from "../../components/campaigns/AddLeadsModal";
import Navigator from "../../components/shared/navigator";
import socketService from "../../services/socketService";
import { useQueryClient } from "@tanstack/react-query";

const CampaignDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: campaign, isLoading } = useGetCampaignById(id);
    const { mutate: updateCampaign, isPending: isUpdating } = useUpdateCampaign();
    const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();
    const { mutate: addLeads } = useAddLeadsToCampaign();
    const { mutate: removeLead } = useRemoveLeadFromCampaign();
    const { mutate: fetchLiveData, isPending: isFetchingLive } = useFetchLiveFacebookData();
    const { mutate: syncLeads, isPending: isSyncingLeads } = useSyncCampaignLeads();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [isAddLeadsModalOpen, setIsAddLeadsModalOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [leadSearch, setLeadSearch] = useState("");
    const [selectedLeads, setSelectedLeads] = useState(new Set());
    const [syncDateRange, setSyncDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncStatus, setSyncStatus] = useState("Initializing...");
    const statusDropdownRef = useRef(null);
    const observer = useRef();

    // Paginated leads hook
    const { 
        data: leadsData, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading: isLoadingLeads 
    } = useGetCampaignLeads(id, leadSearch);

    const allLeads = useMemo(() => {
        return leadsData?.pages.flatMap(page => page.data) || [];
    }, [leadsData]);

    // Infinite scroll observer
    const lastLeadElementRef = (node) => {
        if (isLoadingLeads || isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    };

    const filteredLeads = allLeads; // Search is now handled by the API

    const toggleSelect = (leadId) => {
        setSelectedLeads(prev => {
            const n = new Set(prev);
            n.has(leadId) ? n.delete(leadId) : n.add(leadId);
            return n;
        });
    };

    const toggleSelectAll = () => {
        if (selectedLeads.size === filteredLeads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(filteredLeads.map(l => l._id)));
        }
    };

    const handleExportCSV = () => {
        const toExport = filteredLeads.filter(l => selectedLeads.size === 0 || selectedLeads.has(l._id));
        if (toExport.length === 0) return toast.error("No leads to export");
        const rows = [["Name", "Email", "Phone", "Status", "Source", "Created"]];
        toExport.forEach(l => {
            rows.push([
                l.contact?.name || "",
                l.contact?.email || "",
                l.contact?.phone || "",
                l.status?.name || "",
                l.source || "",
                l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""
            ]);
        });
        const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${campaign?.name || "leads"}_leads.csv`; a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${toExport.length} leads`);
    };

    const handleAddLeads = (leadIds) => {
        addLeads({ id, leads: leadIds }, {
            onSuccess: (data) => {
                toast.success(data.message || "Leads added successfully");
                setIsAddLeadsModalOpen(false);
            },
            onError: () => toast.error("Failed to add leads")
        });
    };

    const handleRemoveLead = (leadId) => {
        if (window.confirm("Remove this lead from the campaign?")) {
            removeLead({ id, leadId }, {
                onSuccess: () => toast.success("Lead removed successfully"),
                onError: () => toast.error("Failed to remove lead")
            });
        }
    };

    // Initialize edit form when data loads or editing starts
    const startEditing = () => {
        setEditForm({
            name: campaign.name,
            description: campaign.description,
            budget: campaign.budget,
            amountSpent: campaign.amountSpent || 0,
            balanceAmount: campaign.balanceAmount || 0,
            totalResults: campaign.totalResults || 0,
            cpr: campaign.cpr || 0,
            reach: campaign.reach || 0,
            impressions: campaign.impressions || 0,
            startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : "",
            endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : "",
            status: campaign.status
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        updateCampaign({ id, data: editForm }, {
            onSuccess: () => {
                toast.success("Campaign updated successfully");
                setIsEditing(false);
            },
            onError: () => {
                toast.error("Failed to update campaign");
            }
        });
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this campaign?")) {
            deleteCampaign(id, {
                onSuccess: () => {
                    toast.success("Campaign deleted");
                    navigate("/campaigns");
                }
            });
        }
    };

    const handleStatusChange = (newStatus) => {
        updateCampaign({ id, data: { status: newStatus } }, {
            onSuccess: () => {
                toast.success("Campaign status updated");
                setIsStatusDropdownOpen(false);
            },
            onError: () => {
                toast.error("Failed to update status");
            }
        });
    };

    const handleSyncLeads = (dateRangeOverride = null) => {
        const range = dateRangeOverride || syncDateRange;
        setSyncProgress(0);
        setSyncStatus("Connecting to Meta APIs...");
        
        // Progress simulation
        const interval = setInterval(() => {
            setSyncProgress(prev => {
                if (prev < 30) {
                    setSyncStatus("Fetching leads from Facebook...");
                    return prev + 2;
                }
                if (prev < 60) {
                    setSyncStatus("Mapping lead fields...");
                    return prev + 1;
                }
                if (prev < 90) {
                    setSyncStatus("Storing leads in database...");
                    return prev + 0.5;
                }
                setSyncStatus("Finishing up...");
                return prev;
            });
        }, 300);

        syncLeads({ id, dateRange: range }, {
            onSuccess: (data) => {
                clearInterval(interval);
                setSyncProgress(100);
                setSyncStatus("Sync Complete!");
                setTimeout(() => {
                    toast.success(data.message || "Leads synced successfully");
                    setSyncProgress(0);
                }, 500);
            },
            onError: (err) => {
                clearInterval(interval);
                setSyncProgress(0);
                toast.error(err.response?.data?.message || "Failed to sync leads");
            }
        });
    };

    const handleSyncAllLeads = () => {
        handleSyncLeads({ startDate: null, endDate: null });
    };

    // Real-time socket updates for new leads
    const queryClient = useQueryClient();
    useEffect(() => {
        if (!id) return;

        // Join campaign-specific room
        const socket = socketService.getSocket();
        if (socket) {
            socket.emit("join_room", `campaign_${id}`);
            console.log(`[Socket] Joined campaign room: campaign_${id}`);
        }

        const handleNewLead = (data) => {
            if (data.campaignId === id) {
                // Invalidate queries to trigger refetch
                queryClient.invalidateQueries(['campaign', id]);
                queryClient.invalidateQueries(['campaignLeads', id]);
            }
        };

        socketService.onNewLead(handleNewLead);

        return () => {
            if (socket) {
                socket.emit("leave_room", `campaign_${id}`);
            }
            socketService.offNewLead(handleNewLead);
        };
    }, [id, queryClient]);

    // Fetch initial live data for this month on mount
    useEffect(() => {
        if (campaign?.facebookAdId && !isFetchingLive) {
            fetchLiveData({ 
                id, 
                startDate: syncDateRange.startDate, 
                endDate: syncDateRange.endDate 
            });
        }
    }, [campaign?.facebookAdId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusDropdownOpen(false);
            }
        };

        if (isStatusDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isStatusDropdownOpen]);

    const statusOptions = [
        { value: "planned", label: "Planned", color: "bg-gray-100 text-gray-600" },
        { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
        { value: "paused", label: "Paused", color: "bg-orange-100 text-orange-700" },
        { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-700" },
        { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
    ];

    const getStatusColor = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption?.color || "bg-gray-100 text-gray-600";
    };

    if (isLoading) return <div className="flexCenter h-full">Loading...</div>;
    if (!campaign) return <div className="flexCenter h-full">Campaign not found</div>;

    return (
        <section className="flex flex-col h-full bg-gray-50/50">
            {/* Header */}
            <div className="flexBetween mb-3 px-4 pt-4">
                <div className="flex items-center gap-3">
                    <Navigator />
                    <h3 className="font-bold text-xl text-gray-800">
                        {isEditing ? "Edit Campaign" : "Campaign Details"}
                    </h3>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all"
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all flex items-center gap-2"
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Saving..." : <><FiSave /> Save Changes</>}
                            </button>
                        </>
                    ) : (
                        <>
                            {campaign.facebookAdId && (
                                <button
                                    onClick={() => {
                                        fetchLiveData({ 
                                            id, 
                                            startDate: syncDateRange.startDate, 
                                            endDate: syncDateRange.endDate 
                                        }, {
                                            onSuccess: (data) => {
                                                toast.success(data.message || "Live data fetched!");
                                            },
                                            onError: (err) => {
                                                toast.error(err.response?.data?.message || "Failed to fetch live data");
                                            },
                                        });
                                    }}
                                    disabled={isFetchingLive}
                                    className={`px-4 py-2 border font-semibold rounded-xl transition-all flex items-center gap-2 text-sm ${isFetchingLive
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
                                        }`}
                                    title="Fetch real-time data from Facebook"
                                >
                                    <FiRefreshCw className={`w-4 h-4 ${isFetchingLive ? "animate-spin" : ""}`} />
                                    {isFetchingLive ? "Fetching..." : "Live Facebook Data"}
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                title="Delete Campaign"
                            >
                                <FiTrash2 />
                            </button>
                            <button
                                onClick={startEditing}
                                className="p-3 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                title="Edit Campaign"
                            >
                                <FiEdit2 />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-8">
                <div className="space-y-6">
                    {/* Main Info Card - full width */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        {isEditing ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Campaign Name</label>
                                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm" placeholder="Enter campaign name" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                                        <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows="3" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm" placeholder="What is this campaign about?" />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-800 mb-4">Timeline & Status</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                                            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm">
                                                <option value="planned">Planned</option>
                                                <option value="active">Active</option>
                                                <option value="paused">Paused</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
                                            <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                                            <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-800 mb-4">Financials & Performance</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[["Total Budget", "budget"], ["Amount Spent", "amountSpent"], ["Balance", "balanceAmount"], ["Total Results", "totalResults"], ["Cost Per Result", "cpr"], ["Reach", "reach"], ["Impressions", "impressions"]].map(([label, key]) => (
                                            <div key={key}>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                                                <input type="number" step="0.01" value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-1">{campaign.name}</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="relative" ref={statusDropdownRef}>
                                                <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-all cursor-pointer ${getStatusColor(campaign.status)}`}>
                                                    {campaign.status}<FiChevronDown className="text-xs" />
                                                </button>
                                                {isStatusDropdownOpen && (
                                                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden">
                                                        {statusOptions.map((option) => (
                                                            <button key={option.value} onClick={() => handleStatusChange(option.value)} className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2 ${campaign.status === option.value ? 'bg-blue-50' : ''}`}>
                                                                <span className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`}></span>{option.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400">• Created by {campaign.createdBy?.firstName || "System"}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Budget</div>
                                        <div className="text-2xl font-black text-gray-800">₹{campaign.budget?.toLocaleString() || 0}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About Campaign</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{campaign.description || "No description provided."}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Schedule</h4>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm"><FiCalendar /></div>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Starts</div><div className="text-sm font-semibold text-gray-800">{new Date(campaign.startDate).toLocaleDateString()}</div></div>
                                            </div>
                                            <div className="h-8 w-px bg-gray-200 mx-2"></div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm"><FiCalendar /></div>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Ends</div><div className="text-sm font-semibold text-gray-800">{new Date(campaign.endDate).toLocaleDateString()}</div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Real-time Performance</h4>
                                        {campaign.lastSyncedAt && <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400"><FiClock className="w-3 h-3" />Synced {new Date(campaign.lastSyncedAt).toLocaleString()}</div>}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                                        <StatBlock label="Amount Spent" value={`₹${(campaign.amountSpent || 0).toLocaleString()}`} color="text-blue-600" />
                                        <StatBlock label="Balance" value={`₹${(campaign.balanceAmount || 0).toLocaleString()}`} color="text-emerald-600" />
                                        <StatBlock label="Results" value={(campaign.totalResults || 0).toLocaleString()} />
                                        <StatBlock label="Today's Leads" value={(campaign.todayLeadsCount || 0).toLocaleString()} color="text-indigo-600" />
                                        <StatBlock label="Cost/Result" value={`₹${(campaign.cpr || 0).toFixed(2)}`} />
                                        <StatBlock label="Reach" value={(campaign.reach || 0).toLocaleString()} />
                                        <StatBlock label="Impressions" value={(campaign.impressions || 0).toLocaleString()} />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-3">
                                        <StatBlock label="Clicks" value={(campaign.clicks || 0).toLocaleString()} color="text-indigo-600" />
                                        <StatBlock label="CTR" value={`${(campaign.ctr || 0).toFixed(2)}%`} color="text-violet-600" />
                                        <StatBlock label="CPC" value={`₹${(campaign.cpc || 0).toFixed(2)}`} color="text-orange-600" />
                                        <StatBlock label="Frequency" value={(campaign.frequency || 0).toFixed(2)} color="text-pink-600" />
                                        <StatBlock label="Conversions" value={(campaign.conversions || 0).toLocaleString()} color="text-emerald-600" />
                                        <StatBlock label="Video Views" value={(campaign.videoViews || 0).toLocaleString()} color="text-cyan-600" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Leads Table — full width at bottom */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Leads Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-gray-800">Campaign Leads</h3>
                                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full">{campaign.leads?.length || 0}</span>
                                {selectedLeads.size > 0 && <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{selectedLeads.size} selected</span>}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Search */}
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
                                        value={leadSearch}
                                        onChange={e => setLeadSearch(e.target.value)}
                                        className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-48 transition-all"
                                    />
                                </div>
                                {/* Export */}
                                <button onClick={handleExportCSV} className="px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-1.5 uppercase tracking-wider">
                                    <FiDownload className="w-3 h-3" />
                                    {selectedLeads.size > 0 ? `Export ${selectedLeads.size}` : "Export All"}
                                </button>
                                <div className="flex items-center gap-2 p-1 bg-gray-100/50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-1.5 px-2">
                                        <FiCalendar className="w-3 h-3 text-gray-400" />
                                        <input 
                                            type="date" 
                                            value={syncDateRange.startDate}
                                            onChange={e => setSyncDateRange({...syncDateRange, startDate: e.target.value})}
                                            className="bg-transparent border-none text-[10px] font-bold text-gray-600 focus:ring-0 p-0 cursor-pointer"
                                        />
                                        <span className="text-[10px] text-gray-300">—</span>
                                        <input 
                                            type="date" 
                                            value={syncDateRange.endDate}
                                            onChange={e => setSyncDateRange({...syncDateRange, endDate: e.target.value})}
                                            className="bg-transparent border-none text-[10px] font-bold text-gray-600 focus:ring-0 p-0 cursor-pointer"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => handleSyncLeads()} 
                                        disabled={isSyncingLeads} 
                                        className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${isSyncingLeads ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-indigo-600 shadow-sm hover:bg-gray-50 border border-gray-100"}`}
                                    >
                                        <FiRefreshCw className={`w-3 h-3 ${isSyncingLeads ? "animate-spin" : ""}`} />
                                        Sync
                                    </button>
                                </div>

                                {campaign.facebookAdId && (
                                    <button 
                                        onClick={handleSyncAllLeads} 
                                        disabled={isSyncingLeads} 
                                        className="px-3 py-2 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-wider"
                                        title="Sync entire history"
                                    >
                                        <FiRefreshCw className="w-3 h-3" />
                                        Sync All
                                    </button>
                                )}
                                {/* Add */}
                                <button onClick={() => setIsAddLeadsModalOpen(true)} className="px-3 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-xl hover:bg-blue-700 transition-all uppercase tracking-wider">
                                    + Add Lead
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        {isLoadingLeads ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <FiLoader className="w-4 h-4 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Preparing Leads...</p>
                            </div>
                        ) : filteredLeads.length > 0 ? (
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-gray-50/80 border-b border-gray-100 backdrop-blur-md">
                                            <th className="px-4 py-3 text-left w-10">
                                                <input type="checkbox" checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0} onChange={toggleSelectAll} className="rounded w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                                            </th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Added</th>
                                            <th className="px-4 py-3 w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredLeads.map((lead, idx) => (
                                            <tr
                                                key={lead._id || idx}
                                                ref={filteredLeads.length === idx + 1 ? lastLeadElementRef : null}
                                                onClick={() => navigate(`/leads/${lead._id}`)}
                                                className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" checked={selectedLeads.has(lead._id)} onChange={() => toggleSelect(lead._id)} className="rounded w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                            {lead.contact?.name?.[0]?.toUpperCase() || <FiUser className="w-3 h-3" />}
                                                        </div>
                                                        <span className="font-semibold text-gray-800 text-xs">{lead.contact?.name || "Unknown"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        {lead.contact?.email && <FiMail className="w-3 h-3 text-gray-300 shrink-0" />}
                                                        <span className="truncate max-w-[160px]">{lead.contact?.email || "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        {lead.contact?.phone && <FiPhone className="w-3 h-3 text-gray-300 shrink-0" />}
                                                        {lead.contact?.phone || "—"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {lead.status?.name ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${lead.status?.color}18`, color: lead.status?.color || "#6b7280" }}>
                                                            {lead.status.name}
                                                        </span>
                                                    ) : <span className="text-xs text-gray-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-400">{lead.source || "—"}</td>
                                                <td className="px-4 py-3 text-xs text-gray-400">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}</td>
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => navigate(`/leads/${lead._id}`)} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View lead"><FiExternalLink className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => handleRemoveLead(lead._id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Remove"><FiX className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {isFetchingNextPage && (
                                    <div className="py-8 flex flex-col items-center justify-center gap-2 bg-gray-50/30 border-t border-gray-50">
                                        <FiLoader className="w-6 h-6 text-indigo-500 animate-spin" />
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Loading more leads...</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 px-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FiCheckCircle className="text-2xl text-gray-200" />
                                </div>
                                <p className="font-bold text-gray-800 mb-1">{leadSearch ? "No leads match your search" : "No leads yet"}</p>
                                <p className="text-xs text-gray-400 mb-6">{leadSearch ? "Try a different search term" : "Sync from Facebook or add leads manually"}</p>
                                {!leadSearch && (
                                    <div className="flex items-center justify-center gap-3">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3 px-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">From</span>
                                                    <input 
                                                        type="date" 
                                                        value={syncDateRange.startDate}
                                                        onChange={e => setSyncDateRange({...syncDateRange, startDate: e.target.value})}
                                                        className="bg-transparent border-none text-xs font-bold text-gray-700 focus:ring-0 p-0"
                                                    />
                                                </div>
                                                <div className="w-[1px] h-4 bg-gray-200"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">To</span>
                                                    <input 
                                                        type="date" 
                                                        value={syncDateRange.endDate}
                                                        onChange={e => setSyncDateRange({...syncDateRange, endDate: e.target.value})}
                                                        className="bg-transparent border-none text-xs font-bold text-gray-700 focus:ring-0 p-0"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSyncLeads()}
                                                disabled={isSyncingLeads}
                                                className={`px-6 py-2.5 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${isSyncingLeads
                                                        ? "bg-indigo-400 cursor-not-allowed"
                                                        : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                                    }`}
                                            >
                                                <FiRefreshCw className={`w-3.5 h-3.5 ${isSyncingLeads ? "animate-spin" : ""}`} />
                                                Sync Now
                                            </button>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={handleSyncAllLeads} className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1.5">
                                                <FiRefreshCw className="w-3 h-3" />
                                                Sync Entire History
                                            </button>
                                            <span className="text-gray-200">|</span>
                                            <button onClick={() => setIsAddLeadsModalOpen(true)} className="text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Add Manually</button>
                                        </div>
                                    </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddLeadsModal
                isOpen={isAddLeadsModalOpen}
                onClose={() => setIsAddLeadsModalOpen(false)}
                campaignId={id}
                onAdd={handleAddLeads}
                alreadyAssignedIds={campaign.leads?.map(l => l._id) || []}
            />

            {/* Full-screen Sync Loading Overlay */}
            {isSyncingLeads && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-white/20 flex flex-col items-center gap-6 max-w-sm w-full mx-4 relative overflow-hidden">
                        {/* Animated background pulse */}
                        <div className="absolute inset-0 bg-indigo-50/30 animate-pulse"></div>
                        
                        <div className="relative">
                            <div className="w-24 h-24 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-black text-indigo-600">{Math.round(syncProgress)}%</span>
                            </div>
                        </div>

                        <div className="text-center relative z-10">
                            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Syncing Leads</h3>
                            <p className="text-sm font-bold text-indigo-500 animate-pulse h-5">{syncStatus}</p>
                        </div>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative z-10 border border-slate-200/50">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-500 ease-out"
                                style={{ width: `${syncProgress}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 w-full mt-2 relative z-10">
                            {[25, 50, 75, 100].map(step => (
                                <div 
                                    key={step} 
                                    className={`h-1.5 rounded-full transition-all duration-700 ${syncProgress >= step ? 'bg-indigo-500' : 'bg-slate-100'}`}
                                ></div>
                            ))}
                        </div>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 relative z-10">Meta Ads Integration</p>
                    </div>
                </div>
            )}
        </section>
    );
};

// --- Sub-components ---

const SyncSettingsModal = ({ isOpen, onClose, onSync }) => {
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: ""
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/20">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Sync Leads</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Facebook Ads Manager</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400"><FiX /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Start Date</label>
                            <div className="relative group">
                                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input 
                                    type="date" 
                                    value={dateRange.startDate}
                                    onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">End Date</label>
                            <div className="relative group">
                                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input 
                                    type="date" 
                                    value={dateRange.endDate}
                                    onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                            <FiClock className="text-indigo-600 w-4 h-4" />
                        </div>
                        <p className="text-[10px] text-indigo-700 font-bold leading-relaxed uppercase tracking-tight">
                            Note: If empty, we'll pull the most recent leads from your active campaign.
                        </p>
                    </div>
                </div>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                    <button 
                        onClick={() => onSync(dateRange)}
                        className="flex-1 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <FiRefreshCw className="w-3.5 h-3.5" />
                        Execute Sync
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper component for stat display
const StatBlock = ({ label, value, color = "text-gray-800" }) => (
    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 line-clamp-1">{label}</div>
        <div className={`text-sm font-black ${color} truncate`}>{value}</div>
    </div>
);

export default CampaignDetails;
