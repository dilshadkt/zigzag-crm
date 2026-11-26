import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiCopy, FiEdit2, FiImage, FiMove, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { useWebsite } from "../context";
import { useDeleteEntry, useDuplicateEntry, useEntries, useReorder } from "../hooks/useWebsite";
import { fmtDate } from "../../accounts/utils/format";
import {
  ConfirmModal,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  SegmentedTabs,
  Spinner,
  StatusBadge,
  Table,
  btnPrimary,
  inputCls,
} from "../../accounts/components/ui";

const STATUS = {
  published: { label: "Published", cls: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Draft", cls: "bg-amber-50 text-amber-700" },
  archived: { label: "Archived", cls: "bg-slate-100 text-slate-600" },
  on: { label: "Active", cls: "bg-emerald-50 text-emerald-700" },
  off: { label: "Inactive", cls: "bg-slate-100 text-slate-600" },
  featured: { label: "On home page", cls: "bg-blue-50 text-blue-700" },
};

/** The small label on a card, from the section's badge field or status. */
const badgeOf = (typeDef, item) => {
  if (item.status) return item.status;
  const field = typeDef.fields.find((f) => f.key === typeDef.badgeKey);
  if (!field) return "";
  if (field.type === "boolean") return item.badge === "true" ? "on" : "off";
  return item.badge === "true" ? "featured" : "";
};

const titleOf = (typeDef, item) => item.title || `Untitled ${typeDef.singular}`;

const IconButton = ({ icon: Icon, label, onClick, danger }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    title={label}
    aria-label={label}
    className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 transition-colors ${
      danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-slate-100 hover:text-slate-700"
    }`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const Actions = ({ typeDef, item, onOpen, onCopy, onDelete }) => {
  const { permissions } = useWebsite();
  return (
    <div className="flex items-center justify-end gap-0.5">
      <IconButton icon={FiEdit2} label={`Open ${titleOf(typeDef, item)}`} onClick={() => onOpen(item)} />
      {permissions.manageContent && <IconButton icon={FiCopy} label="Make a copy" onClick={() => onCopy(item)} />}
      {permissions.delete && <IconButton icon={FiTrash2} label="Delete" danger onClick={() => onDelete(item)} />}
    </div>
  );
};

const CardItem = ({ typeDef, item, sortable, ...actions }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
    disabled: !sortable,
  });
  const badge = badgeOf(typeDef, item);
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col ${
        isDragging ? "relative z-10 shadow-lg" : "hover:border-[#3F8CFF]/40"
      }`}
    >
      <div className="relative aspect-[4/3] bg-slate-50">
        <button type="button" onClick={() => actions.onOpen(item)} className="absolute inset-0" aria-label={`Open ${titleOf(typeDef, item)}`}>
          {item.image ? (
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className={`w-full h-full ${typeDef.imageFit === "contain" ? "object-contain p-4" : "object-cover"}`}
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-slate-300">
              <FiImage className="w-8 h-8" />
            </span>
          )}
        </button>
        {sortable && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-white/90 shadow flex items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing touch-none"
            aria-label={`Drag to reorder ${titleOf(typeDef, item)}`}
          >
            <FiMove className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-800 line-clamp-2 break-words">{titleOf(typeDef, item)}</p>
        {item.subtitle && <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>}
        <div className="mt-auto pt-1 flex items-center justify-between gap-2">
          <span>{badge && <StatusBadge status={badge} map={STATUS} />}</span>
          <Actions typeDef={typeDef} item={item} {...actions} />
        </div>
      </div>
    </li>
  );
};

const ContentList = ({ site, typeDef }) => {
  const { permissions } = useWebsite();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = { siteId: site._id, type: typeDef.key, q, status, page };
  const { data, isLoading, isError, error, refetch } = useEntries(params);
  const remove = useDeleteEntry();
  const duplicate = useDuplicateEntry();
  const reorder = useReorder();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // A dragged order is shown until the server's list has caught up
  useEffect(() => setOrder(null), [data]);
  const items = order || data?.items || [];
  const sortable = typeDef.order === "manual" && permissions.manageContent && !q && items.length > 1;

  const base = `/website/${site._id}/${typeDef.key}`;
  const where = { siteId: site._id, type: typeDef.key };
  const actions = {
    onOpen: (item) => navigate(`${base}/${item._id}`),
    onCopy: (item) => !duplicate.isPending && duplicate.mutate({ ...where, id: item._id }),
    onDelete: setRemoving,
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i._id === active.id);
    const to = items.findIndex((i) => i._id === over.id);
    const next = arrayMove(items, from, to);
    setOrder(next);
    reorder.mutate({ ...where, ids: next.map((i) => i._id) }, { onError: () => setOrder(null) });
  };

  const addButton = permissions.manageContent && (
    <button className={btnPrimary} onClick={() => navigate(`${base}/new`)}>
      <FiPlus /> Add {typeDef.singular}
    </button>
  );
  const statusField = typeDef.fields.find((f) => f.key === typeDef.statusField);
  const filtering = Boolean(q || status);

  const empty = (
    <EmptyState
      icon={FiImage}
      title={filtering ? "Nothing matches" : `No ${typeDef.label.toLowerCase()} yet`}
      text={filtering ? "Try a different search or filter." : `Anything you add here appears on ${site.name}.`}
      action={!filtering && addButton}
    />
  );

  return (
    <>
      <PageHeader
        title={typeDef.label}
        subtitle={sortable ? "Drag the move handle to change the order on the website." : undefined}
        actions={
          <>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                aria-label={`Search ${typeDef.label}`}
                className={`${inputCls} !pl-9 !w-52`}
              />
            </div>
            {addButton}
          </>
        }
      />

      {statusField && (
        <div className="mb-4">
          <SegmentedTabs
            tabs={[{ value: "", label: "All" }, ...statusField.options]}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !items.length ? (
        empty
      ) : typeDef.view === "grid" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i._id)} strategy={rectSortingStrategy}>
            <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {items.map((item) => (
                <CardItem key={item._id} typeDef={typeDef} item={item} sortable={sortable} {...actions} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl">
          <Table
            rows={items}
            onRowClick={actions.onOpen}
            columns={[
              {
                key: "title",
                title: "Title",
                render: (item) => <span className="font-semibold text-slate-800 line-clamp-2">{titleOf(typeDef, item)}</span>,
              },
              {
                key: "subtitle",
                title: typeDef.fields.find((f) => f.key === typeDef.subtitleKey)?.label || "Details",
                render: (item) => <span className="text-slate-500 break-all">{item.subtitle || "—"}</span>,
              },
              { key: "updatedAt", title: "Updated", render: (item) => <span className="whitespace-nowrap text-slate-500">{fmtDate(item.updatedAt)}</span> },
              { key: "actions", title: "", align: "right", render: (item) => <Actions typeDef={typeDef} item={item} {...actions} /> },
            ]}
          />
        </div>
      )}

      {data && <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />}

      <ConfirmModal
        isOpen={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={`Delete this ${typeDef.singular}?`}
        message={removing && `"${titleOf(typeDef, removing)}" will be removed from ${site.name}. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutate({ ...where, id: removing._id }, { onSuccess: () => setRemoving(null) })}
      />
    </>
  );
};

export default ContentList;
