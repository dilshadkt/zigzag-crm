import React from "react";
import { Link } from "react-router-dom";
import { fmtMoney } from "../utils/format";

/** Salaries come from payroll, so a salary also typed in as an expense counts twice. */
const SalaryWarning = ({ warning, symbol }) => {
  if (!warning?.count) return null;
  const one = warning.count === 1;
  return (
    <p className="mb-4 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2" role="alert">
      {warning.count} expense {one ? "entry" : "entries"} ({fmtMoney(warning.total, symbol)}) {one ? "looks" : "look"} like salary in a month that has a payroll, such as “{warning.examples[0]}”.
      Payroll already counts salaries, so {one ? "it is" : "they are"} counted twice.{" "}
      <Link to="/accounts/expenses" className="font-semibold underline">Check Expenses</Link>
    </p>
  );
};

export default SalaryWarning;
