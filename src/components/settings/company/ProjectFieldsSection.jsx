import React from "react";
import { 
  FiEdit3, 
  FiTrash2, 
  FiSettings, 
  FiAlertCircle, 
  FiDatabase,
  FiType,
  FiCalendar,
  FiList,
  FiCheckSquare,
  FiUpload,
  FiLink,
  FiHash,
  FiMail,
  FiChevronRight
} from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableFieldItem = ({ field, getFieldIcon, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field._id || field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`px-4 py-3 hover:bg-gray-50/50 transition-all duration-200 group bg-white border-b border-gray-50 last:border-b-0 ${isDragging ? "shadow-lg scale-[1.01]" : ""}`}
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Field Label */}
        <div className="col-span-5">
          <div className="flex items-center gap-3">
            <div 
              {...attributes} 
              {...listeners}
              className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
            >
              <MdDragIndicator className="w-5 h-5" />
            </div>
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-gray-500 shadow-sm group-hover:border-blue-100 group-hover:text-blue-500 transition-colors">
              {getFieldIcon(field.type)}
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="text-[13px] font-bold text-gray-800 truncate leading-tight">
                {field.label}
              </div>
              <div className="text-[10px] text-gray-400 font-mono tracking-tighter truncate opacity-70">
                key: {field.key || field.label.toLowerCase().replace(/\s+/g, '_')}
              </div>
            </div>
          </div>
        </div>

        {/* Required Status */}
        <div className="col-span-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight border ${field.isRequired
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : "bg-gray-50 text-gray-400 border-gray-100"
                }`}
            >
              {field.isRequired ? "Required" : "Optional"}
            </span>
          </div>
        </div>

        {/* Field Type */}
        <div className="col-span-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
            {field.type?.replace('_', ' ')}
          </span>
        </div>

        {/* Actions */}
        <div className="col-span-2 text-right">
          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1 font-sans">
            <button
              onClick={() => onEdit(field)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all cursor-pointer"
              title="Configure field"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(field)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
              title="Remove field"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectFieldsSection = ({
  fields = [],
  isLoading,
  error,
  onEdit,
  onDelete,
  onReorder
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => (f._id || f.id) === active.id);
      const newIndex = fields.findIndex((f) => (f._id || f.id) === over.id);
      const newItems = arrayMove(fields, oldIndex, newIndex);
      if (onReorder) onReorder(newItems);
    }
  };

  const getFieldIcon = (type) => {
    switch (type) {
      case 'text': return <FiType className="w-4.5 h-4.5" />;
      case 'number': return <FiHash className="w-4.5 h-4.5" />;
      case 'date': return <FiCalendar className="w-4.5 h-4.5" />;
      case 'select': return <FiList className="w-4.5 h-4.5" />;
      case 'checkbox': return <FiCheckSquare className="w-4.5 h-4.5" />;
      case 'file': return <FiUpload className="w-4.5 h-4.5" />;
      case 'image': return <FiUpload className="w-4.5 h-4.5" />;
      case 'email': return <FiMail className="w-4.5 h-4.5" />;
      case 'url': return <FiLink className="w-4.5 h-4.5" />;
      case 'dynamic_list': return <FiSettings className="w-4.5 h-4.5" />;
      default: return <FiDatabase className="w-4.5 h-4.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-[13px] font-medium text-gray-500">Retrieving system fields...</p>
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
            <h3 className="text-[14px] font-bold text-gray-800">Connection Error</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Could not fetch custom fields. {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <FiDatabase className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-800 mb-1">
          No Custom Fields
        </h3>
        <p className="text-[12px] text-gray-500 text-center max-w-sm px-6">
          Add custom fields to capture specific project data like tracking numbers, budgets, or special requirements.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col font-sans">
      {/* Table Header Section */}
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-1 pl-1">
            {/* Grip placeholder */}
          </div>
          <div className="col-span-4 pl-3">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
              Field Label & System Key
            </h3>
          </div>
          <div className="col-span-3">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
              Input Property
            </h3>
          </div>
          <div className="col-span-2">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
              Type
            </h3>
          </div>
          <div className="col-span-2 text-right">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight pr-2">
              Action
            </h3>
          </div>
        </div>
      </div>

      {/* Field List with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f._id || f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-gray-50">
            {fields.map((field) => (
              <SortableFieldItem
                key={field._id || field.id}
                field={field}
                getFieldIcon={getFieldIcon}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Table Footer */}
      <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/20">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
          Managed custom data points: {fields.length}
        </p>
      </div>
    </div>
  );
};

export default ProjectFieldsSection;
