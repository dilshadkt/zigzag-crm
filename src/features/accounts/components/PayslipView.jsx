import React, { forwardRef } from "react";
import { DOC_CSS } from "./documentStyles";
import { amountInWords, fmtDate, fmtMoney, methodLabel, monthLabel } from "../utils/format";

const PayslipView = forwardRef(function PayslipView({ payslip, business = {}, footer, symbol = "₹", showEmployerCost = false }, ref) {
  if (!payslip) return null;
  const e = payslip.employeeSnapshot || {};
  const a = payslip.attendance || {};
  const rows = Math.max(payslip.earnings?.length || 0, payslip.deductions?.length || 0);
  const addr = business.address || {};

  return (
    <div ref={ref} className="acc-doc">
      <style>{DOC_CSS}</style>

      <div className="head row">
        <div className="brand">
          {business.logoUrl && <img className="logo" src={business.logoUrl} alt="" />}
          <div>
            <div className="biz-name">{business.legalName || business.tradeName}</div>
            <div className="small muted">
              {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
            </div>
          </div>
        </div>
        <div className="doc-title">
          <h1 style={{ fontSize: 20 }}>Payslip</h1>
          <div className="doc-no">{monthLabel(payslip.month, true)}</div>
        </div>
      </div>

      <div className="kv">
        <div><b>Employee</b>{e.name}</div>
        <div><b>Designation</b>{e.position || "—"}</div>
        <div><b>Department</b>{e.department || "—"}</div>
        <div><b>Date of joining</b>{fmtDate(e.joiningDate)}</div>
        <div><b>PAN</b>{e.pan || "—"}</div>
        <div><b>UAN</b>{e.uan || "—"}</div>
        <div><b>Bank account</b>{e.accountNumberMasked || e.upiId || "—"}</div>
        <div><b>Pay mode</b>{methodLabel(e.paymentMode)}</div>
      </div>

      <div className="kv" style={{ marginTop: 10 }}>
        {a.payType === "hourly" ? (
          <>
            <div><b>Hourly rate</b>{fmtMoney(a.hourlyRate, symbol)}</div>
            <div><b>Hours worked</b>{a.hoursWorked}</div>
            <div><b>Days worked</b>{a.daysWorked}</div>
            <div><b>Paid leave</b>{a.paidLeaveDays}</div>
          </>
        ) : a.payType === "monthly_hours" ? (
          <>
            <div><b>Days present</b>{a.presentDays}</div>
            <div><b>Paid leaves</b>{a.paidLeaveDays}</div>
            <div><b>Total hrs required</b>{a.requiredHours}</div>
            <div><b>Total checked hrs</b>{a.ckdHours}</div>
            <div><b>Productive hours (breaks excluded)</b>{a.productiveHours}</div>
            <div><b>Hourly rate</b>{fmtMoney(a.hourlyRate, symbol)}</div>
            <div><b>No. of loss of pay</b>{a.lopDays} days</div>
            <div><b>CL / SL / PH</b>{a.casualLeaveDays} / {a.sickLeaveDays} / {a.publicHolidayDays}</div>
          </>
        ) : (
          <>
            <div><b>Days in month</b>{a.daysInMonth}</div>
            <div><b>Paid days</b>{a.payableDays}</div>
            <div><b>Loss of pay</b>{a.lopDays}</div>
            <div><b>Paid leave</b>{a.paidLeaveDays}</div>
          </>
        )}
      </div>

      <div className="pay-cols">
        <div>
          <h3>Earnings</h3>
          <table>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => {
                const line = payslip.earnings?.[i];
                return (
                  <tr key={i}>
                    <td>{line?.name || " "}</td>
                    <td className="r">{line ? fmtMoney(line.amount, symbol) : ""}</td>
                  </tr>
                );
              })}
              <tr><td><b>Gross earnings</b></td><td className="r"><b>{fmtMoney(payslip.grossEarnings, symbol)}</b></td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3>Deductions</h3>
          <table>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => {
                const line = payslip.deductions?.[i];
                return (
                  <tr key={i}>
                    <td>{line?.name || " "}</td>
                    <td className="r">{line ? fmtMoney(line.amount, symbol) : ""}</td>
                  </tr>
                );
              })}
              <tr><td><b>Total deductions</b></td><td className="r"><b>{fmtMoney(payslip.totalDeductions, symbol)}</b></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="net">
        <span>Net pay</span>
        <span>{fmtMoney(payslip.netPay, symbol)}</span>
      </div>
      <p className="small muted" style={{ marginTop: 6 }}>{amountInWords(payslip.netPay)}</p>

      {a.payType === "monthly_hours" && (a.lopHours > 0 || a.breakHours > 0) && (
        <p className="small muted" style={{ marginTop: 6 }}>
          Remarks:{" "}
          {a.lopHours > 0 && `Leave LOP includes ${a.leaveLopDays} days. `}
          {a.breakHours > 0 && `Break deduction includes ${a.breakHours} hours.`}
        </p>
      )}

      {(payslip.previousBalance || payslip.advancesTaken > 0) && payslip.totalPayable != null ? (
        <>
          <table style={{ marginTop: 10 }}>
            <tbody>
              {payslip.advancesTaken > 0 && <tr><td>Advance recovered (included in deductions)</td><td className="r">{fmtMoney(payslip.advancesTaken, symbol)}</td></tr>}
              {payslip.previousBalance ? <tr><td>{payslip.previousBalance > 0 ? "Previous month balance (payable)" : "Previous month balance (recoverable)"}</td><td className="r">{fmtMoney(payslip.previousBalance, symbol)}</td></tr> : null}
              <tr><td><b>Total payable</b></td><td className="r"><b>{fmtMoney(Math.max(payslip.totalPayable, 0), symbol)}</b></td></tr>
              {payslip.totalPayable < 0 && <tr><td>Carried forward to next month</td><td className="r">{fmtMoney(payslip.totalPayable, symbol)}</td></tr>}
            </tbody>
          </table>
        </>
      ) : null}

      {showEmployerCost && payslip.employerContributions?.length > 0 && (
        <p className="small muted" style={{ marginTop: 10 }}>
          Employer contributions: {payslip.employerContributions.map((c) => `${c.name} ${fmtMoney(c.amount, symbol)}`).join(", ")}
        </p>
      )}

      {payslip.status === "paid" && payslip.paidOn && (
        <p className="small muted" style={{ marginTop: 6 }}>
          Paid on {fmtDate(payslip.paidOn)} by {methodLabel(payslip.paymentMode)}
          {payslip.paymentReference ? ` (ref ${payslip.paymentReference})` : ""}.
        </p>
      )}
      {payslip.notes && <p className="small" style={{ marginTop: 6 }}>Note: {payslip.notes}</p>}

      <div className="footer">{footer || "This is a computer generated payslip and does not require a signature."}</div>
    </div>
  );
});

export default PayslipView;
