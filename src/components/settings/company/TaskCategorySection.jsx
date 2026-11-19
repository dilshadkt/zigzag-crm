import React from "react";
import { FiEdit3, FiTrash2, FiTag, FiAlertCircle } from "react-icons/fi";

const TaskCategorySection = ({
  categories = [],
  isLoading,
  error,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("");

  // Departments that actually have categories, with how many each holds
  const departmentOptions = React.useMemo(() => {
    const byId = new Map();
    let withoutDepartment = 0;
    (categories || []).forEach((c) => {
      const id = String(c.department?._id || c.department || "");
      if (!id) {
        withoutDepartment += 1;
        return;
      }
      const entry = byId.get(id) || { id, name: c.department?.name || "Unknown", count: 0 };
      entry.count += 1;
      byId.set(id, entry);
    });
    const list = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
    return { list, withoutDepartment };
  }, [categories]);

  const filteredCategories = React.useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return (categories || []).filter((c) => {
      if (departmentFilter) {
        const id = String(c.department?._id || c.department || "");
        if (departmentFilter === "none" ? id : id !== departmentFilter) return false;
      }
      if (!needle) return true;
      return (
        c.name?.toLowerCase().includes(needle) ||
        c.department?.name?.toLowerCase().includes(needle)
      );
    });
  }, [categories, searchTerm, departmentFilter]);

  const isFiltering = Boolean(searchTerm.trim() || departmentFilter);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-[13px] font-medium text-gray-500">
          Retrieving task categories...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-800">
              Connection Error
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Could not fetch task categories. {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <FiTag className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-800 mb-1">
          No Task Categories
        </h3>
        <p className="text-[12px] text-gray-500 text-center max-w-sm px-6">
          Add task categories to organize and classify tasks during creation.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col font-sans">
      <div className="px-5 py-3 border-b border-gray-50 bg-white flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-0 px-3 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
        />
        <select
          aria-label="Filter by department"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="sm:w-64 px-3 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
        >
          <option value="">All departments</option>
          {departmentOptions.list.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name} ({dept.count})
            </option>
          ))}
          {departmentOptions.withoutDepartment > 0 && (
            <option value="none">
              No department ({departmentOptions.withoutDepartment})
            </option>
          )}
        </select>
        {isFiltering && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setDepartmentFilter("");
            }}
            className="text-[12px] font-semibold text-blue-500 hover:text-blue-600 whitespace-nowrap cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
      <div className="px-5 py-2 border-b border-gray-50 bg-gray-50/50">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 pl-1">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
              Category Name & Color
            </h3>
          </div>
          <div className="col-span-2">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
              Status
            </h3>
          </div>
          <div className="col-span-2 text-right">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight pr-2">
              Action
            </h3>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category._id}
              className="px-4 py-3 hover:bg-gray-50/50 transition-all duration-200 group bg-white border-b border-gray-50 last:border-b-0"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-8">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <FiTag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <div className="text-[13px] font-bold text-gray-800 truncate leading-tight flex items-center gap-2">
                        {category.name}
                        {category.mapsToQuota && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-tight">
                            Maps to: {category.mapsToQuota}
                          </span>
                        )}
                      </div>
                      {(category.points > 0 || category.price > 0 || category.time > 0 || category.department || category.fields?.length > 0) && (
                        <div className="text-[11px] text-gray-500 truncate leading-tight mt-0.5 flex gap-2">
                          {category.points > 0 && <span>Points: {category.points}</span>}
                          {category.price > 0 && <span>Price: {category.price}</span>}
                          {category.time > 0 && <span>Time: {category.time}m</span>}
                          {category.department && <span>Dept: {category.department.name || 'Unknown'}</span>}
                          {category.fields?.length > 0 && (
                            <span className="text-blue-500 font-semibold">
                              {category.fields.length} field{category.fields.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight border ${
                      category.isActive
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-gray-50 text-gray-400 border-gray-100"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="col-span-2 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1 font-sans">
                    <button
                      onClick={() => onEdit(category)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                      title="Edit Category"
                    >
                      <FiEdit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(category)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                      title="Remove Category"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] text-gray-500 font-medium">
              {searchTerm.trim()
                ? `No categories found matching "${searchTerm.trim()}"`
                : "No categories in this department"}
            </p>
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/20 flex justify-between items-center">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
          Total Categories: {categories.length}
        </p>
        {isFiltering && (
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
            Showing: {filteredCategories.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskCategorySection;
