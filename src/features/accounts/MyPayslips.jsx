import React, { useRef, useState } from "react";
import { FiDollarSign } from "react-icons/fi";
import { useMyPayslip, useMyPayslips } from "./hooks/useAccounts";
import { PAYSLIP_STATUS, fmtDate, fmtMoney, monthLabel } from "./utils/format";
import { pdfName } from "./utils/pdf";
import { PdfButtons } from "./components/DocumentActions";
import PayslipView from "./components/PayslipView";
import { Drawer, EmptyState, ErrorState, Spinner, StatusBadge } from "./components/ui";

const PayslipModalBody = ({ id, onClose }) => {
  const { data, isLoading } = useMyPayslip(id);
  const ref = useRef(null);
  const slip = data?.payslip;
  return (
    <Drawer
      isOpen={!!id}
      onClose={onClose}
      width="max-w-3xl"
      title={slip ? `Payslip · ${monthLabel(slip.month, true)}` : "Payslip"}
      footer={slip && <PdfButtons getElement={() => ref.current} filename={pdfName("Payslip", slip.month)} title={`Payslip ${slip.month}`} />}
    >
      {isLoading || !slip ? (
        <Spinner />
      ) : (
        <div className="bg-slate-100/70 rounded-2xl p-2 sm:p-3 overflow-x-auto">
          <div className="shadow-sm rounded-lg overflow-hidden">
            <PayslipView ref={ref} payslip={slip} business={data.business} footer={data.footer} symbol={data.currencySymbol || "₹"} />
          </div>
        </div>
      )}
    </Drawer>
  );
};

/** Every signed-in employee can open this page: it only ever shows their own approved payslips. */
const MyPayslips = () => {
  const { data, isLoading, isError, error, refetch } = useMyPayslips();
  const [open, setOpen] = useState(null);

  return (
    <section className="rounded-2xl bg-white h-full overflow-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-lg font-bold text-slate-800">My payslips</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">Your salary slips appear here once payroll for the month is approved.</p>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : data.payslips.length === 0 ? (
          <EmptyState icon={FiDollarSign} title="No payslips yet" text="When payroll is approved, your payslip for the month will show up here." />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.payslips.map((p) => (
              <li key={p._id}>
                <button onClick={() => setOpen(p._id)} className="w-full text-left border border-slate-100 rounded-2xl p-4 hover:border-[#3F8CFF]/40 hover:bg-[#F8FBFF] transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">{monthLabel(p.month, true)}</p>
                    <StatusBadge status={p.status} map={PAYSLIP_STATUS} />
                  </div>
                  <p className="mt-2 text-xl font-bold text-slate-900 tabular-nums">{fmtMoney(p.netPay)}</p>
                  <p className="text-xs text-slate-500">Net pay{p.paidOn ? ` · paid ${fmtDate(p.paidOn)}` : ""}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <PayslipModalBody id={open} onClose={() => setOpen(null)} />
    </section>
  );
};

export default MyPayslips;
