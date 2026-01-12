import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCampaignById, useUpdateCampaign, useDeleteCampaign, useAddLeadsToCampaign, useRemoveLeadFromCampaign } from "../../api/campaignDetails";
import Navigator from "../../components/shared/navigator";
import { FiCalendar, FiDollarSign, FiEdit2, FiTrash2, FiSave, FiX, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import AddLeadsModal from "../../components/campaigns/AddLeadsModal";

const CampaignDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: campaign, isLoading } = useGetCampaignById(id);
    const { mutate: updateCampaign, isLoading: isUpdating } = useUpdateCampaign();
    const { mutate: deleteCampaign, isLoading: isDeleting } = useDeleteCampaign();
    const { mutate: addLeads } = useAddLeadsToCampaign();
    const { mutate: removeLead } = useRemoveLeadFromCampaign();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [isAddLeadsModalOpen, setIsAddLeadsModalOpen] = useState(false);

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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            {isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Campaign Name</label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                placeholder="Enter campaign name"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                rows="3"
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                placeholder="What is this campaign about?"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-800 mb-4">Timeline & Status</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                >
                                                    <option value="planned">Planned</option>
                                                    <option value="active">Active</option>
                                                    <option value="paused">Paused</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={editForm.startDate}
                                                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                                                <input
                                                    type="date"
                                                    value={editForm.endDate}
                                                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-800 mb-4">Financials & Performance</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Total Budget</label>
                                                <div className="relative">
                                                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        value={editForm.budget}
                                                        onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                                                        className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Amount Spent</label>
                                                <div className="relative">
                                                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        value={editForm.amountSpent}
                                                        onChange={(e) => setEditForm({ ...editForm, amountSpent: e.target.value })}
                                                        className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Balance</label>
                                                <div className="relative">
                                                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        value={editForm.balanceAmount}
                                                        onChange={(e) => setEditForm({ ...editForm, balanceAmount: e.target.value })}
                                                        className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Total Results</label>
                                                <input
                                                    type="number"
                                                    value={editForm.totalResults}
                                                    onChange={(e) => setEditForm({ ...editForm, totalResults: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cost Per Result</label>
                                                <div className="relative">
                                                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={editForm.cpr}
                                                        onChange={(e) => setEditForm({ ...editForm, cpr: e.target.value })}
                                                        className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reach</label>
                                                <input
                                                    type="number"
                                                    value={editForm.reach}
                                                    onChange={(e) => setEditForm({ ...editForm, reach: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Impressions</label>
                                                <input
                                                    type="number"
                                                    value={editForm.impressions}
                                                    onChange={(e) => setEditForm({ ...editForm, impressions: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-1">{campaign.name}</h2>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                                                    ${campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                                        campaign.status === 'paused' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-100 text-gray-600'}
                                                `}>
                                                    {campaign.status}
                                                </span>
                                                <span className="text-xs text-gray-400">• Created by {campaign.createdBy?.firstName || "System"}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Budget</div>
                                            <div className="text-2xl font-black text-gray-800">
                                                ₹{campaign.budget?.toLocaleString() || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About Campaign</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                                {campaign.description || "No description provided."}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Schedule</h4>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm">
                                                        <FiCalendar />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Starts</div>
                                                        <div className="text-sm font-semibold text-gray-800">{new Date(campaign.startDate).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="h-8 w-px bg-gray-200 mx-2"></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm">
                                                        <FiCalendar />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Ends</div>
                                                        <div className="text-sm font-semibold text-gray-800">{new Date(campaign.endDate).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance Stats Grid */}
                                    <div className="pt-6 border-t border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Real-time Performance</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                            <StatBlock
                                                label="Amount Spent"
                                                value={`₹${(campaign.amountSpent || 0).toLocaleString()}`}
                                                color="text-blue-600"
                                            />
                                            <StatBlock
                                                label="Balance"
                                                value={`₹${(campaign.balanceAmount || 0).toLocaleString()}`}
                                                color="text-emerald-600"
                                            />
                                            <StatBlock
                                                label="Results"
                                                value={(campaign.totalResults || 0).toLocaleString()}
                                            />
                                            <StatBlock
                                                label="Cost/Result"
                                                value={`₹${(campaign.cpr || 0).toFixed(2)}`}
                                            />
                                            <StatBlock
                                                label="Reach"
                                                value={(campaign.reach || 0).toLocaleString()}
                                            />
                                            <StatBlock
                                                label="Impressions"
                                                value={(campaign.impressions || 0).toLocaleString()}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Recent Activity or Chart could go here */}
                    </div>

                    {/* Sidebar / Leads Section */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        Assigned Leads
                                        <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                            {campaign.leads?.length || 0}
                                        </span>
                                    </h3>
                                    <p className="text-[10px] text-gray-400 mt-1">Leads captured via this campaign</p>
                                </div>
                                <button
                                    onClick={() => setIsAddLeadsModalOpen(true)}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-all"
                                >
                                    + Add Lead
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                                {campaign.leads?.length > 0 ? (
                                    <div className="space-y-2">
                                        {campaign.leads.map((lead, idx) => (
                                            <div key={lead._id || idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-all group border border-transparent hover:border-gray-100">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                                    {lead.contact?.name?.[0] || "?"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm text-gray-800 truncate" title={lead.contact?.name}>
                                                        {lead.contact?.name || "Unknown Lead"}
                                                    </div>
                                                    <div className="text-[10px] font-medium text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <span className="truncate max-w-[120px]">{lead.contact?.email || lead.type}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{lead.status}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveLead(lead._id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Remove from campaign"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 px-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <FiCheckCircle className="text-2xl text-gray-200" />
                                        </div>
                                        <p className="font-bold text-gray-800 mb-1">No leads assigned</p>
                                        <p className="text-xs text-gray-400 mb-6">Start tracking performance by adding leads</p>
                                        <button
                                            onClick={() => setIsAddLeadsModalOpen(true)}
                                            className="px-6 py-2 bg-white text-blue-600 font-bold rounded-xl border border-gray-200 hover:border-blue-500 transition-all text-xs"
                                        >
                                            Add Your First Lead
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
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
        </section>
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
