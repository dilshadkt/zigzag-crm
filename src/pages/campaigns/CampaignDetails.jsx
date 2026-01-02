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
            <div className="flexBetween mb-3">
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
                                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                                disabled={isUpdating}
                            >
                                Save Changes
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-4 py-6 border border-gray-100">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        rows="3"
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="planned">Planned</option>
                                            <option value="active">Active</option>
                                            <option value="paused">Paused</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                        <input
                                            type="number"
                                            value={editForm.budget}
                                            onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                                            className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={editForm.startDate}
                                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                            className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={editForm.endDate}
                                            onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                            className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className=" font-semibold text-gray-800">{campaign.name}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold  tracking-wider
                                        ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                                    `}>
                                        {campaign.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                    {campaign.description || "No description provided."}
                                </p>

                                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex flex-col text-xs">
                                        <span className=" text-gray-500 mb-1">Budget</span>
                                        <div className="flex items-center gap-1 font-semibold text-gray-800">
                                            {campaign.budget.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col text-xs">
                                        <span className=" text-gray-500 mb-1">Start Date</span>
                                        <div className="flex items-center gap-1 font-semibold text-gray-800">
                                            <FiCalendar className="text-gray-400" />
                                            {new Date(campaign.startDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col text-xs">
                                        <span className=" text-gray-500 mb-1">End Date</span>
                                        <div className="flex items-center gap-1 font-semibold text-gray-800">
                                            <FiCalendar className="text-gray-400" />
                                            {new Date(campaign.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar / Leads Section */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-4 py-6  border border-gray-100 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium  text-gray-800
                             flex items-center gap-2">
                                Assigned Leads
                                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{campaign.leads?.length || 0}</span>
                            </h3>
                            <button
                                onClick={() => setIsAddLeadsModalOpen(true)}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                + Add
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[500px]">
                            {campaign.leads?.length > 0 ? (
                                <div className="space-y-2">
                                    {campaign.leads.map((lead, idx) => (
                                        <div key={lead._id || idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all group border border-transparent hover:border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                                {lead.contact?.name?.[0] || "?"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-gray-800 truncate" title={lead.contact?.name}>{lead.contact?.name || "Unknown Lead"}</div>
                                                <div className="text-xs text-gray-500 truncate" title={lead.contact?.email}>{lead.contact?.email}</div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveLead(lead._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                title="Remove from campaign"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-4 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FiX className="text-xl text-gray-300" />
                                    </div>
                                    <p className="font-medium text-gray-600 mb-1">No leads assigned</p>
                                    <p className="text-xs mb-4">Add leads to track campaign performance</p>
                                    <button
                                        onClick={() => setIsAddLeadsModalOpen(true)}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors text-sm"
                                    >
                                        Add Leads
                                    </button>
                                </div>
                            )}
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

export default CampaignDetails;
