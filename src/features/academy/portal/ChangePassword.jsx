import React, { useState } from "react";
import { setStudentToken, studentApi } from "./studentClient";

const input =
  "w-full h-11 px-3 rounded-xl border border-slate-200 text-[15px] outline-none focus:border-[#3F8CFF] focus:ring-2 focus:ring-blue-100";

/**
 * Change the portal password. On first login (firstTime) it is shown full
 * screen and must be done before the portal opens.
 */
const ChangePassword = ({ firstTime = false, student, onDone, onLogout }) => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mismatch = form.confirm && form.newPassword !== form.confirm;
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword.length < 6) return setError("Use at least 6 characters");
    if (mismatch) return setError("The new passwords do not match");
    setBusy(true);
    try {
      const res = await studentApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setStudentToken(res.token);
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      setOk(true);
      onDone?.();
    } catch (err) {
      setError(err?.message || "Could not change the password");
    } finally {
      setBusy(false);
    }
  };

  const formEl = (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="block text-xs font-semibold text-slate-600 mb-1">{firstTime ? "Password you were given" : "Current password"}</span>
        <input type="password" className={input} value={form.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" required />
      </label>
      <label className="block">
        <span className="block text-xs font-semibold text-slate-600 mb-1">New password</span>
        <input type="password" className={input} value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" minLength={6} required />
      </label>
      <label className="block">
        <span className="block text-xs font-semibold text-slate-600 mb-1">Type it again</span>
        <input type="password" className={input} value={form.confirm} onChange={set("confirm")} autoComplete="new-password" required />
      </label>
      {(error || mismatch) && (
        <p className="text-sm text-red-600" role="alert">
          {error || "The new passwords do not match"}
        </p>
      )}
      {ok && !firstTime && <p className="text-sm text-emerald-600">Password changed.</p>}
      <button type="submit" disabled={busy} className="w-full h-11 rounded-xl bg-[#3F8CFF] text-white font-semibold hover:bg-blue-600 disabled:opacity-50">
        {busy ? "Saving…" : "Change password"}
      </button>
    </form>
  );

  if (!firstTime) return formEl;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EEF4FF] via-white to-[#F5F0FF] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6">
        <h1 className="text-xl font-bold text-slate-900">Welcome, {student?.name?.split(" ")[0]}!</h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">Set your own password to continue. Only you will know it.</p>
        {formEl}
        <button onClick={onLogout} className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600">
          Sign out
        </button>
      </div>
    </main>
  );
};

export default ChangePassword;
