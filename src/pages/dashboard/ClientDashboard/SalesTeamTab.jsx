import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiUser, FiPhone, FiMail, FiBriefcase,
  FiPlus, FiTrash2, FiEdit2, FiX, FiCheck,
  FiChevronRight, FiTrendingUp, FiAward, FiMapPin,
} from "react-icons/fi";
import {
  useGetClientSalesTeam,
  useCreateClientSalesPerson,
  useUpdateClientSalesPerson,
  useDeleteClientSalesPerson,
  useGetClientSalesPersonStats,
} from "../../../api/clientSalesTeam";
import { useGetLeads } from "../../../features/leads/api";
import { useProjectDetails } from "../../../api/hooks";

// ─── Avatar helper ────────────────────────────────────────────────────────────
const Avatar = ({ name, avatar, size = "w-10 h-10", color = "bg-indigo-500" }) => {
  const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return avatar ? (
    <img src={avatar} alt={name} className={`${size} rounded-full object-cover`} />
  ) : (
    <div className={`${size} rounded-full ${color} flex items-center justify-center text-white text-sm font-bold`}>
      {initials}
    </div>
  );
};

// ─── Stat Badge ───────────────────────────────────────────────────────────────
const StatBadge = ({ label, value, color = "bg-slate-100 text-slate-700" }) => (
  <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl ${color}`}>
    <span className="text-lg font-black leading-none">{value}</span>
    <span className="text-[10px] font-semibold mt-0.5 opacity-70">{label}</span>
  </div>
);

// ─── Person Stats Drawer ──────────────────────────────────────────────────────
const PersonStatsDrawer = ({ personId, projectId, onClose }) => {
  const { data, isLoading } = useGetClientSalesPersonStats(personId);
  const statsData = data?.data;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {statsData && <Avatar name={statsData.person?.name} avatar={statsData.person?.avatar} />}
            <div>
              <h3 className="text-base font-bold text-slate-900">{statsData?.person?.name || "Loading..."}</h3>
              <p className="text-xs text-slate-400">{statsData?.person?.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <FiX size={18} className="text-slate-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : statsData ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatBadge label="Total" value={statsData.stats.total} color="bg-blue-50 text-blue-700" />
              <StatBadge label="Won" value={statsData.stats.won} color="bg-emerald-50 text-emerald-700" />
              <StatBadge label="Follow-up" value={statsData.stats.inFollowUp} color="bg-amber-50 text-amber-700" />
              <StatBadge label="Other" value={statsData.stats.other} color="bg-slate-100 text-slate-600" />
            </div>

            {/* Conversion rate */}
            {statsData.stats.total > 0 && (
              <div className="p-4 bg-indigo-50 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700">Conversion Rate</span>
                  <span className="text-lg font-black text-indigo-700">
                    {Math.round((statsData.stats.won / statsData.stats.total) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((statsData.stats.won / statsData.stats.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Recent Leads */}
            {statsData.recentLeads?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Recent Leads</h4>
                <div className="space-y-2">
                  {statsData.recentLeads.map(lead => (
                    <div key={lead._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{lead.name}</p>
                        <p className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: lead.status?.color ? `${lead.status.color}20` : "#f1f5f9",
                          color: lead.status?.color || "#64748b",
                        }}
                      >
                        {lead.status?.name || "Unknown"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {statsData.person?.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiPhone size={14} className="text-slate-400" />
                  {statsData.person.phone}
                </div>
              )}
              {statsData.person?.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiMail size={14} className="text-slate-400" />
                  {statsData.person.email}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No data found</div>
        )}
      </div>
    </div>
  );
};

// ─── Add / Edit Form ──────────────────────────────────────────────────────────
const PersonForm = ({ onSubmit, onCancel, initial = null, isLoading, branches = [] }) => {
  const [form, setForm] = useState({
    name: initial?.name || "",
    phone: initial?.phone || "",
    email: initial?.email || "",
    role: initial?.role || "Sales Agent",
    branch: initial?.branch || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
      <h4 className="text-sm font-bold text-indigo-900">{initial ? "Edit Sales Person" : "Add Sales Person"}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name *</label>
          <input
            type="text" required
            placeholder="Full name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
          <input
            type="text"
            placeholder="e.g. Sales Agent"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
          <input
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Branch</label>
          <select
            value={form.branch}
            onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all appearance-none"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id || b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-60"
        >
          <FiCheck size={14} />
          {isLoading ? "Saving..." : initial ? "Save Changes" : "Add Member"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
};

// ─── Person Card ──────────────────────────────────────────────────────────────
const PersonCard = ({ person, stats, onView, onEdit, onDelete }) => {
  const convRate = stats?.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar name={person.name} avatar={person.avatar} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{person.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <FiBriefcase size={10} className="text-slate-400 flex-shrink-0" />
              <p className="text-xs text-slate-400 truncate">{person.role || "Sales Agent"}</p>
              {person.branch && (
                <>
                  <span className="text-slate-300">•</span>
                  <FiMapPin size={10} className="text-indigo-400 flex-shrink-0" />
                  <p className="text-xs text-indigo-500 font-medium truncate">{person.branch}</p>
                </>
              )}
            </div>
            {person.phone && (
              <div className="flex items-center gap-1 mt-0.5">
                <FiPhone size={10} className="text-slate-400 flex-shrink-0" />
                <p className="text-xs text-slate-400">{person.phone}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(person)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Edit"
          >
            <FiEdit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(person)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            title="Remove"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
        <div className="flex gap-2 flex-1">
          <div className="flex flex-col items-center px-2 py-1 bg-blue-50 rounded-lg min-w-0">
            <span className="text-sm font-black text-blue-700">{stats?.total || 0}</span>
            <span className="text-[9px] text-blue-500 font-semibold">Total</span>
          </div>
          <div className="flex flex-col items-center px-2 py-1 bg-emerald-50 rounded-lg min-w-0">
            <span className="text-sm font-black text-emerald-700">{stats?.won || 0}</span>
            <span className="text-[9px] text-emerald-500 font-semibold">Won</span>
          </div>
          {stats?.total > 0 && (
            <div className="flex flex-col items-center px-2 py-1 bg-indigo-50 rounded-lg min-w-0">
              <span className="text-sm font-black text-indigo-700">{convRate}%</span>
              <span className="text-[9px] text-indigo-500 font-semibold">Conv.</span>
            </div>
          )}
        </div>
        <button
          onClick={() => onView(person._id)}
          className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors flex-shrink-0"
        >
          View <FiChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

// ─── Main SalesTeamTab ────────────────────────────────────────────────────────
const SalesTeamTab = ({ projectId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [viewingPersonId, setViewingPersonId] = useState(null);

  const { data: currentProject } = useProjectDetails(projectId);
  const branchLogins = currentProject?.customFields?.branchLogins || [];
  const legacyBranches = currentProject?.customFields?.branches || currentProject?.branches || [];
  const branches = branchLogins.length > 0 ? branchLogins : legacyBranches;

  const { data: teamData, isLoading } = useGetClientSalesTeam(projectId);
  const team = teamData?.data || [];

  // Get team-wide stats via leads
  const { data: leadsData } = useGetLeads({ project: projectId, limit: 1000 });
  const leads = leadsData?.data || [];

  // Build stats per person from leads
  const personStatsMap = {};
  leads.forEach(lead => {
    const id = lead.clientOwner?._id || (typeof lead.clientOwner === "string" ? lead.clientOwner : null);
    if (!id) return;
    if (!personStatsMap[id]) personStatsMap[id] = { total: 0, won: 0, inFollowUp: 0 };
    personStatsMap[id].total++;
    const statusName = (lead.status?.name || "").toLowerCase();
    if (statusName.includes("won") || statusName.includes("closed")) personStatsMap[id].won++;
    else if (lead.isFollowUp) personStatsMap[id].inFollowUp++;
  });

  const { mutateAsync: createPerson, isPending: isCreating } = useCreateClientSalesPerson(projectId);
  const { mutateAsync: updatePerson, isPending: isUpdating } = useUpdateClientSalesPerson(projectId);
  const { mutateAsync: deletePerson } = useDeleteClientSalesPerson(projectId);

  const handleAdd = async (formData) => {
    try {
      await createPerson({ ...formData, project: projectId });
      toast.success("Sales team member added!");
      setShowAddForm(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add member");
    }
  };

  const handleEdit = async (formData) => {
    try {
      await updatePerson({ id: editingPerson._id, ...formData });
      toast.success("Details updated!");
      setEditingPerson(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async (person) => {
    if (!window.confirm(`Remove "${person.name}" from the sales team? Their leads will be unassigned.`)) return;
    try {
      await deletePerson(person._id);
      toast.success(`"${person.name}" removed`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Sales Team</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {team.length} member{team.length !== 1 ? "s" : ""} · Assign leads to your sales agents
          </p>
        </div>
        {!showAddForm && !editingPerson && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
          >
            <FiPlus size={16} />
            Add Member
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <PersonForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          isLoading={isCreating}
          branches={branches}
        />
      )}

      {/* Edit form */}
      {editingPerson && (
        <PersonForm
          initial={editingPerson}
          onSubmit={handleEdit}
          onCancel={() => setEditingPerson(null)}
          isLoading={isUpdating}
          branches={branches}
        />
      )}

      {/* Team grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-100 animate-pulse rounded-2xl h-36" />
          ))}
        </div>
      ) : team.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <FiUser size={28} className="text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-slate-700">No sales team yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Add your sales agents to assign leads to them and track their performance.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all"
          >
            <FiPlus size={15} /> Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(person => (
            <PersonCard
              key={person._id}
              person={person}
              stats={personStatsMap[person._id]}
              onView={setViewingPersonId}
              onEdit={setEditingPerson}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Stats drawer */}
      {viewingPersonId && (
        <PersonStatsDrawer
          personId={viewingPersonId}
          projectId={projectId}
          onClose={() => setViewingPersonId(null)}
        />
      )}
    </div>
  );
};

export default SalesTeamTab;
