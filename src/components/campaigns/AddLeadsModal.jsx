import React, { useState } from "react";
import { FiX, FiSearch, FiCheck } from "react-icons/fi";
import { useGetLeads } from "../../features/leads/api"; // Correct import path
import PrimaryButton from "../shared/buttons/primaryButton";

const AddLeadsModal = ({ isOpen, onClose, campaignId, onAdd, alreadyAssignedIds = [] }) => {
    const [search, setSearch] = useState("");
    const [selectedLeads, setSelectedLeads] = useState([]);

    const { data: leadsData, isLoading } = useGetLeads({
        page: 1,
        limit: 50,
        search: search,
    });

    const leads = leadsData?.data || [];

    // Filter out leads that are already assigned to the campaign
    const availableLeads = leads.filter(lead => !alreadyAssignedIds.includes(lead._id));

    const toggleLeadSelection = (leadId) => {
        setSelectedLeads(prev =>
            prev.includes(leadId)
                ? prev.filter(id => id !== leadId)
                : [...prev, leadId]
        );
    };

    const handleAdd = () => {
        onAdd(selectedLeads);
        setSelectedLeads([]);
        // onClose(); // Let the parent close it after success or keep it open? Usually close.
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">Add Leads to Campaign</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-50">
                    <div className="flex bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 items-center gap-3 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <FiSearch className="text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search leads by name, email, or company..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : availableLeads.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p>No available leads found.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {availableLeads.map((lead) => {
                                const isSelected = selectedLeads.includes(lead._id);
                                return (
                                    <div
                                        key={lead._id}
                                        onClick={() => toggleLeadSelection(lead._id)}
                                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border
                                            ${isSelected
                                                ? "bg-blue-50 border-blue-200 shadow-sm"
                                                : "hover:bg-gray-50 border-transparent hover:border-gray-100"
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                                            ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}
                                        `}>
                                            {isSelected && <FiCheck className="text-white text-xs" />}
                                        </div>

                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                                            {lead.contact?.name?.[0] || "?"}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-800 text-sm truncate">{lead.contact?.name || "Unknown Lead"}</h4>
                                            <p className="text-xs text-gray-500 truncate">{lead.contact?.email}</p>
                                        </div>

                                        <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-medium text-gray-600 uppercase">
                                            {typeof lead.status === 'object' ? lead.status?.name : lead.status || "New"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
                    <span className="text-sm text-gray-500 font-medium">
                        {selectedLeads.length} lead{selectedLeads.length !== 1 && 's'} selected
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-600 font-medium hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-xl transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <PrimaryButton
                            text={`Add ${selectedLeads.length > 0 ? selectedLeads.length : ''} Lead${selectedLeads.length !== 1 ? 's' : ''}`}
                            onclick={handleAdd}
                            disabled={selectedLeads.length === 0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLeadsModal;
