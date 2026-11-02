import React, { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useDeleteVendor, useVendors } from "../hooks/useAccounts";
import { fmtMoney } from "../utils/format";
import { ConfirmModal, EmptyState, ErrorState, PageHeader, Spinner, Table, btnPrimary, inputCls } from "../components/ui";
import VendorDrawer from "../components/VendorDrawer";

const Vendors = () => {
  const { permissions, symbol } = useAccountsContext();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [drawer, setDrawer] = useState({ open: false, vendor: null });
  const [toDelete, setToDelete] = useState(null);
  const canManage = permissions.manageExpenses;

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useVendors({ search: debounced });
  const remove = useDeleteVendor();
  const vendors = data?.vendors || [];

  const openAdd = () => setDrawer({ open: true, vendor: null });

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="People and companies you pay. Pick them when adding an expense."
        actions={canManage && <button className={btnPrimary} onClick={openAdd}><FiPlus /> Add vendor</button>}
      />

      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder="Search name, phone or GSTIN" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <Table
            rows={vendors}
            empty={
              <EmptyState
                title={debounced ? "No vendors match your search" : "No vendors yet"}
                text={!debounced && canManage ? "Add the suppliers and people you pay, then pick them on expenses." : undefined}
                action={!debounced && canManage && <button className={btnPrimary} onClick={openAdd}><FiPlus /> Add vendor</button>}
              />
            }
            columns={[
              { key: "name", title: "Vendor", render: (v) => (
                <div>
                  <p className="font-semibold text-slate-800">{v.name}</p>
                  {v.gstin && <p className="text-xs text-slate-400">GSTIN {v.gstin}</p>}
                </div>
              ) },
              { key: "contact", title: "Contact", render: (v) => (
                v.phone || v.email
                  ? <div className="text-sm text-slate-600"><p>{v.phone}</p><p className="text-xs text-slate-400">{v.email}</p></div>
                  : <span className="text-slate-300">—</span>
              ) },
              { key: "count", title: "Expenses", align: "right", render: (v) => v.expenseCount },
              { key: "total", title: "Total spent", align: "right", render: (v) => <span className="font-semibold">{fmtMoney(v.totalSpent, symbol)}</span> },
              ...(canManage ? [{ key: "act", title: "", align: "right", render: (v) => (
                <div className="flex items-center justify-end gap-1">
                  <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#3F8CFF] hover:bg-blue-50 flex items-center justify-center" aria-label="Edit" onClick={() => setDrawer({ open: true, vendor: v })}><FiEdit2 className="w-3.5 h-3.5" /></button>
                  {permissions.delete && (
                    <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label="Delete" onClick={() => setToDelete(v)}><FiTrash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              ) }] : []),
            ]}
          />
        )}
      </div>

      <VendorDrawer isOpen={drawer.open} vendor={drawer.vendor} onClose={() => setDrawer({ open: false, vendor: null })} />
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this vendor?"
        message={toDelete ? `${toDelete.name} will be removed.` : ""}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(toDelete._id).then(() => setToDelete(null)).catch(() => setToDelete(null))}
      />
    </div>
  );
};

export default Vendors;
