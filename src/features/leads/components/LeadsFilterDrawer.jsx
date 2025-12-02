import { useState, useEffect } from "react";
import { FiX, FiPlus, FiTrash2, FiCalendar, FiFilter } from "react-icons/fi";

const LeadsFilterDrawer = ({
    isOpen,
    onClose,
    onApplyFilters,
    formFields = [],
    statuses = [],
    currentFilters = {},
}) => {
    const [filters, setFilters] = useState([]);
    const [filterCount, setFilterCount] = useState(0);

    // Initialize filters from currentFilters
    useEffect(() => {
        if (Object.keys(currentFilters).length > 0) {
            const initialFilters = Object.entries(currentFilters).map(
                ([key, value], index) => ({
                    id: index,
                    field: key,
                    operator: "equals",
                    value: value,
                })
            );
            setFilters(initialFilters);
            setFilterCount(initialFilters.length);
        }
    }, [currentFilters]);

    // Available filter fields
    const filterFields = [
        { key: "status", label: "Status", type: "status" },
        { key: "owner", label: "Owner", type: "user" },
        { key: "source", label: "Source", type: "text" },
        { key: "createdAt", label: "Created Date", type: "date" },
        { key: "updatedAt", label: "Last Updated", type: "date" },
        { key: "budget", label: "Budget", type: "number" },
        ...formFields
            .filter((field) =>
                ["select", "text", "number", "date"].includes(field.type)
            )
            .map((field) => ({
                key: field.key || field.id,
                label: field.label,
                type: field.type,
                options: field.options || [],
            })),
    ];

    // Operators based on field type
    const getOperatorsForType = (type) => {
        switch (type) {
            case "text":
                return [
                    { value: "contains", label: "Contains" },
                    { value: "equals", label: "Equals" },
                    { value: "startsWith", label: "Starts with" },
                    { value: "endsWith", label: "Ends with" },
                    { value: "notContains", label: "Does not contain" },
                ];
            case "number":
                return [
                    { value: "equals", label: "Equals" },
                    { value: "greaterThan", label: "Greater than" },
                    { value: "lessThan", label: "Less than" },
                    { value: "between", label: "Between" },
                ];
            case "date":
                return [
                    { value: "equals", label: "On" },
                    { value: "before", label: "Before" },
                    { value: "after", label: "After" },
                    { value: "between", label: "Between" },
                    { value: "last7days", label: "Last 7 days" },
                    { value: "last30days", label: "Last 30 days" },
                    { value: "thisMonth", label: "This month" },
                    { value: "lastMonth", label: "Last month" },
                ];
            case "select":
            case "status":
                return [
                    { value: "equals", label: "Is" },
                    { value: "notEquals", label: "Is not" },
                ];
            default:
                return [{ value: "equals", label: "Equals" }];
        }
    };

    const addFilter = () => {
        setFilters([
            ...filters,
            {
                id: filterCount,
                field: filterFields[0]?.key || "",
                operator: "equals",
                value: "",
            },
        ]);
        setFilterCount(filterCount + 1);
    };

    const removeFilter = (id) => {
        setFilters(filters.filter((f) => f.id !== id));
    };

    const updateFilter = (id, key, value) => {
        setFilters(
            filters.map((f) => {
                if (f.id === id) {
                    const updated = { ...f, [key]: value };
                    // Reset operator if field type changes
                    if (key === "field") {
                        const fieldData = filterFields.find((field) => field.key === value);
                        const operators = getOperatorsForType(fieldData?.type);
                        updated.operator = operators[0]?.value || "equals";
                        updated.value = "";
                    }
                    return updated;
                }
                return f;
            })
        );
    };

    const handleApply = () => {
        const filterObject = {};
        filters.forEach((filter) => {
            if (filter.field && filter.value) {
                filterObject[filter.field] = {
                    operator: filter.operator,
                    value: filter.value,
                };
            }
        });
        onApplyFilters(filterObject);
        onClose();
    };

    const handleClear = () => {
        setFilters([]);
        onApplyFilters({});
    };

    const renderValueInput = (filter) => {
        const fieldData = filterFields.find((f) => f.key === filter.field);
        const inputClasses =
            "w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff] focus:ring-1 focus:ring-[#3f8cff]/20 transition-all placeholder:text-slate-400";

        if (!fieldData) {
            return (
                <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                    className={inputClasses}
                    placeholder="Value"
                />
            );
        }

        // Select/Dropdown fields
        if (fieldData.type === "select" && fieldData.options?.length > 0) {
            return (
                <select
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                    className={inputClasses}
                >
                    <option value="">Select option</option>
                    {fieldData.options.map((option, idx) => (
                        <option key={idx} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            );
        }

        // Status field
        if (fieldData.type === "status") {
            return (
                <select
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                    className={inputClasses}
                >
                    <option value="">Select status</option>
                    {statuses.map((status) => (
                        <option
                            key={status._id || status.id}
                            value={status._id || status.id}
                        >
                            {status.name}
                        </option>
                    ))}
                </select>
            );
        }

        // Date fields
        if (fieldData.type === "date") {
            // For preset date ranges, no input needed
            if (
                ["last7days", "last30days", "thisMonth", "lastMonth"].includes(
                    filter.operator
                )
            ) {
                return (
                    <div className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm flex items-center text-slate-500">
                        <FiCalendar size={14} className="mr-2" />
                        Auto-calculated
                    </div>
                );
            }

            // For between operator, show two date inputs
            if (filter.operator === "between") {
                const [startDate, endDate] = (filter.value || ",").split(",");
                return (
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                const newValue = `${e.target.value},${endDate}`;
                                updateFilter(filter.id, "value", newValue);
                            }}
                            className={inputClasses}
                        />
                        <span className="flex items-center text-slate-400 text-xs">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                const newValue = `${startDate},${e.target.value}`;
                                updateFilter(filter.id, "value", newValue);
                            }}
                            className={inputClasses}
                        />
                    </div>
                );
            }

            // Single date input
            return (
                <input
                    type="date"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                    className={inputClasses}
                />
            );
        }

        // Number fields
        if (fieldData.type === "number") {
            if (filter.operator === "between") {
                const [min, max] = (filter.value || ",").split(",");
                return (
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={min}
                            onChange={(e) => {
                                const newValue = `${e.target.value},${max}`;
                                updateFilter(filter.id, "value", newValue);
                            }}
                            className={inputClasses}
                            placeholder="Min"
                        />
                        <span className="flex items-center text-slate-400 text-xs">to</span>
                        <input
                            type="number"
                            value={max}
                            onChange={(e) => {
                                const newValue = `${min},${e.target.value}`;
                                updateFilter(filter.id, "value", newValue);
                            }}
                            className={inputClasses}
                            placeholder="Max"
                        />
                    </div>
                );
            }

            return (
                <input
                    type="number"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                    className={inputClasses}
                    placeholder="Enter number"
                />
            );
        }

        // Default text input
        return (
            <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                className={inputClasses}
                placeholder="Enter value"
            />
        );
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right border-l border-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#3f8cff]">
                            <FiFilter size={16} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Filter Leads
                            </h2>
                            <p className="text-xs text-slate-500">
                                Narrow down your list
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-5 bg-slate-50/30">
                    {filters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <FiFilter size={20} className="text-slate-400" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 mb-1">
                                No filters applied
                            </h3>
                            <p className="text-xs text-slate-500 mb-4 max-w-[200px]">
                                Add filters to find exactly what you're looking for.
                            </p>
                            <button
                                onClick={addFilter}
                                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium px-4 h-9 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                                <FiPlus size={14} />
                                Add Filter
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filters.map((filter, index) => {
                                const fieldData = filterFields.find(
                                    (f) => f.key === filter.field
                                );
                                const operators = getOperatorsForType(fieldData?.type);

                                return (
                                    <div
                                        key={filter.id}
                                        className="p-3.5 border border-slate-200 rounded-xl bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] group transition-all hover:border-blue-200"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                Condition {index + 1}
                                            </span>
                                            <button
                                                onClick={() => removeFilter(filter.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove filter"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            {/* Field Selection */}
                                            <div className="col-span-1">
                                                <select
                                                    value={filter.field}
                                                    onChange={(e) =>
                                                        updateFilter(filter.id, "field", e.target.value)
                                                    }
                                                    className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm focus:outline-none focus:border-[#3f8cff] bg-slate-50/50"
                                                >
                                                    {filterFields.map((field) => (
                                                        <option key={field.key} value={field.key}>
                                                            {field.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Operator Selection */}
                                            <div className="col-span-1">
                                                <select
                                                    value={filter.operator}
                                                    onChange={(e) =>
                                                        updateFilter(filter.id, "operator", e.target.value)
                                                    }
                                                    className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm focus:outline-none focus:border-[#3f8cff] bg-slate-50/50"
                                                >
                                                    {operators.map((op) => (
                                                        <option key={op.value} value={op.value}>
                                                            {op.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Value Input */}
                                        <div>
                                            {renderValueInput(filter)}
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={addFilter}
                                className="w-full h-10 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-[#3f8cff] hover:text-[#3f8cff] hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-xs font-medium mt-2"
                            >
                                <FiPlus size={14} />
                                Add Another Condition
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
                    <button
                        onClick={handleClear}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-2"
                    >
                        Clear All
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 h-9 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-5 h-9 rounded-lg bg-[#3f8cff] text-white text-xs font-medium hover:bg-[#2f6bff] transition-colors shadow-sm shadow-blue-200"
                        >
                            Apply Filters {filters.length > 0 && `(${filters.length})`}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
        </>
    );
};

export default LeadsFilterDrawer;
