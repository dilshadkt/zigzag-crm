import React, { useState } from "react";
import { FiDownload, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useAssetSchedule, useAssets, useDeleteExpense } from "../hooks/useAccounts";
import { ASSET_STATE, depreciationLabel, downloadCsv, fmtDate, fmtMoney, monthLabel, toInputDate } from "../utils/format";
import { ConfirmModal, Drawer, EmptyState, ErrorState, PageHeader, Spinner, StatCard, StatusBadge, Table, btnGhost, btnPrimary, inputCls } from "../components/ui";
import { ExpenseDrawer } from "./Expenses";

const thisMonthKey = () => toInputDate(new Date()).slice(0, 7);

/** One asset's depreciation, month by month. */
const ScheduleDrawer = ({ asset, onClose }) => {
  const { symbol } = useAccountsContext();
  const q = useAssetSchedule(asset?._id);
  const rows = q.data?.schedule || [];
  const position = q.data?.asset?.position;

  const exportCsv = () =>
    downloadCsv(`depreciation-${asset.description.replace(/[^\w-]+/g, "-")}.csv`, [
      ["Month", "Value at start", "Depreciation", "Value at end"],
      ...rows.map((r) => [r.month, r.opening, r.depreciation, r.closing]),
    ]);

  return (
    <Drawer
      isOpen={!!asset}
      onClose={onClose}
      title={asset?.description || ""}
      subtitle={asset ? `${depreciationLabel(asset.asset)} · cost ${fmtMoney(asset.amount, symbol)}` : undefined}
      footer={<button className={btnGhost} onClick={exportCsv} disabled={!rows.length}><FiDownload /> Export CSV</button>}
    >
      {q.isLoading ? (
        <Spinner />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={q.refetch} />
      ) : (
        <div className="space-y-3">
          {position && (
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Depreciated so far" value={fmtMoney(position.accumulated, symbol)} />
              <StatCard label="Value now" value={fmtMoney(position.bookValue, symbol)} />
            </div>
          )}
          <div className="border border-slate-100 rounded-2xl">
            <Table
              rows={[...rows].reverse()}
              rowKey={(r) => r.month}
              dense
              empty={<p className="p-6 text-center text-sm text-slate-400">{position?.state === "pending" ? "Depreciation starts once the asset is approved." : "Nothing has been depreciated yet."}</p>}
              columns={[
                { key: "month", title: "Month", render: (r) => <span className="whitespace-nowrap">{monthLabel(r.month, true)}</span> },
                { key: "open", title: "At start", align: "right", render: (r) => fmtMoney(r.opening, symbol) },
                { key: "dep", title: "Depreciation", align: "right", render: (r) => <span className="font-semibold text-amber-600">{fmtMoney(r.depreciation, symbol)}</span> },
                { key: "close", title: "At end", align: "right", render: (r) => fmtMoney(r.closing, symbol) },
              ]}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
};

const Assets = () => {
  const { permissions, symbol } = useAccountsContext();
  const [month, setMonth] = useState(thisMonthKey);
  const { data, isLoading, isError, error, refetch } = useAssets({ month });
  const remove = useDeleteExpense();
  const [drawer, setDrawer] = useState({ open: false, expense: null });
  const [viewing, setViewing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const canManage = permissions.manageExpenses;

  const assets = data?.assets || [];
  const label = monthLabel(month, true);
  const addButton = <button className={btnPrimary} onClick={() => setDrawer({ open: true, expense: null })}><FiPlus /> Add asset</button>;

  const exportCsv = () =>
    downloadCsv(`asset-list-${month}.csv`, [
      ["Asset", "Category", "Vendor", "Bought", "Method", "Cost", `Depreciation ${month}`, "Depreciated so far", "Value", "State"],
      ...assets.map((a) => [a.description, a.category, a.vendor, toInputDate(a.date), depreciationLabel(a.asset), a.amount, a.position.thisMonth, a.position.accumulated, a.position.bookValue, ASSET_STATE[a.position.state]?.label]),
    ]);

  return (
    <div>
      <PageHeader
        title="Asset list"
        subtitle="What the company owns. Depreciation is calculated monthly."
        actions={
          <>
            <button className={btnGhost} onClick={exportCsv} disabled={!assets.length}><FiDownload /> Export CSV</button>
            {canManage && addButton}
          </>
        }
      />

      <label className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-600">
        Values at the end of
        <input type="month" className={`${inputCls} !w-auto !py-1.5 !text-xs`} value={month} max={thisMonthKey()} onChange={(e) => setMonth(e.target.value || thisMonthKey())} />
      </label>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <StatCard label="Cost of assets held" value={fmtMoney(data.totals.cost, symbol)} sub={`${data.totals.count} asset${data.totals.count === 1 ? "" : "s"}`} />
            <StatCard label="Depreciation for the month" value={fmtMoney(data.totals.thisMonth, symbol)} tone="warn" sub={label} />
            <StatCard label="Depreciated so far" value={fmtMoney(data.totals.accumulated, symbol)} />
            <StatCard label="Value now" value={fmtMoney(data.totals.bookValue, symbol)} sub="cost less depreciation" />
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl">
            <Table
              rows={assets}
              onRowClick={setViewing}
              empty={<EmptyState title="No assets yet" text={canManage ? "Add what the company owns. Mark it as already owned if there is nothing to pay." : undefined} action={canManage && addButton} />}
              columns={[
                { key: "name", title: "Asset", render: (a) => (
                  <div>
                    <p className="font-semibold text-slate-800">{a.description}</p>
                    <p className="text-xs text-slate-400">{[a.category, a.vendor, `bought ${fmtDate(a.date)}`].filter(Boolean).join(" · ")}</p>
                  </div>
                ) },
                { key: "method", title: "Depreciation", render: (a) => <span className="text-xs text-slate-500 whitespace-nowrap">{depreciationLabel(a.asset)}</span> },
                { key: "cost", title: "Cost", align: "right", render: (a) => fmtMoney(a.amount, symbol) },
                { key: "month", title: "For the month", align: "right", render: (a) => fmtMoney(a.position.thisMonth, symbol) },
                { key: "acc", title: "So far", align: "right", render: (a) => fmtMoney(a.position.accumulated, symbol) },
                { key: "book", title: "Value", align: "right", render: (a) => <span className="font-semibold">{fmtMoney(a.position.bookValue, symbol)}</span> },
                { key: "state", title: "State", render: (a) => <StatusBadge status={a.position.state} map={ASSET_STATE} /> },
                ...(canManage || permissions.delete ? [{ key: "act", title: "", align: "right", render: (a) => (
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {canManage && <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#3F8CFF] hover:bg-blue-50 flex items-center justify-center" aria-label={`Edit ${a.description}`} onClick={() => setDrawer({ open: true, expense: a })}><FiEdit2 className="w-3.5 h-3.5" /></button>}
                    {permissions.delete && <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label={`Delete ${a.description}`} onClick={() => setToDelete(a)}><FiTrash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                ) }] : []),
              ]}
            />
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p><b>How depreciation is worked out (every month):</b> Straight line is (cost − salvage value) ÷ months of useful life. Written down value is the value at the start of the financial year × yearly rate ÷ 12.</p>
            <p>Click an asset to see it month by month. A year&apos;s depreciation is its months added up. It counts against profit in Overview and Reports. Pending assets are approved under Purchases.</p>
          </div>
        </>
      )}

      <ExpenseDrawer isOpen={drawer.open} expense={drawer.expense} kind="asset" onClose={() => setDrawer({ open: false, expense: null })} />
      <ScheduleDrawer asset={viewing} onClose={() => setViewing(null)} />
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this asset?"
        message={toDelete ? `${toDelete.description} will be removed, along with its depreciation in past months. If it was sold or scrapped, edit it and set the disposal date instead.` : ""}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(toDelete._id).then(() => setToDelete(null)).catch(() => setToDelete(null))}
      />
    </div>
  );
};

export default Assets;
