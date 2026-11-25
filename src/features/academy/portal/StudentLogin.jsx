import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiAward, FiBookOpen, FiCalendar, FiCheckCircle, FiClipboard, FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import logo from "../../../assets/icons/logo.svg";
import useLightTheme from "../useLightTheme";
import { getStudentToken, setStudentToken, studentApi } from "./studentClient";

const ACADEMY = "Zigzag Academy";

const FEATURES = [
  { icon: FiBookOpen, title: "Course & syllabus", text: "Your batch, timings, trainer and every module" },
  { icon: FiClipboard, title: "Tasks & feedback", text: "Submit assignments and see your scores" },
  { icon: FiCalendar, title: "Attendance", text: "Every class you attended, day by day" },
  { icon: FiAward, title: "Fees & certificate", text: "Instalments, receipts and your certificate" },
];

/** Decorative preview of the portal home, shown on the brand panel. */
const PreviewCard = () => (
  <div className="relative w-full max-w-sm" aria-hidden="true">
    <div className="absolute -inset-4 bg-white/10 rounded-[28px] blur-2xl" />
    <div className="relative rounded-3xl bg-white/95 shadow-2xl shadow-black/20 p-5 text-slate-800 rotate-[-2deg]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current course</p>
          <p className="text-sm font-bold">Digital Marketing</p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Ongoing</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          ["92%", "Attendance", "text-emerald-600"],
          ["7/8", "Tasks", "text-[#3F8CFF]"],
          ["A", "Grade", "text-violet-600"],
        ].map(([v, l, c]) => (
          <div key={l} className="rounded-xl bg-slate-50 py-2.5 text-center">
            <p className={`text-base font-extrabold ${c}`}>{v}</p>
            <p className="text-[10px] text-slate-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
          <span>Fees paid</span>
          <span>75%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#3F8CFF] to-[#6A5CFF]" />
        </div>
      </div>
    </div>
    <div className="absolute -right-6 -bottom-8 rounded-2xl bg-white shadow-xl shadow-black/20 px-4 py-3 flex items-center gap-3 rotate-[3deg]">
      <span className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
        <FiAward />
      </span>
      <span>
        <span className="block text-xs font-bold text-slate-800">Certificate ready</span>
        <span className="block text-[10px] text-slate-500">Download as PDF</span>
      </span>
    </div>
  </div>
);

const StudentLogin = () => {
  useLightTheme();
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = `Student portal · ${ACADEMY}`;
    if (getStudentToken()) navigate("/student", { replace: true });
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await studentApi.login({ login: login.trim(), password });
      setStudentToken(res.token);
      navigate("/student", { replace: true });
    } catch (err) {
      setError(err?.message || "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-[#3F8CFF] focus:ring-4 focus:ring-blue-100";

  return (
    <main className="min-h-dvh bg-white lg:h-dvh lg:grid lg:grid-cols-[1.05fr_1fr] lg:overflow-hidden">
      {/* Brand panel */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E2A66] via-[#1D4FB8] to-[#3F8CFF] text-white">
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" aria-hidden="true">
          <defs>
            <pattern id="zz" width="48" height="24" patternUnits="userSpaceOnUse">
              <path d="M0 18 L12 6 L24 18 L36 6 L48 18" fill="none" stroke="white" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#zz)" />
        </svg>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#6A5CFF]/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />

        <div className="relative px-6 pt-5 pb-9 lg:h-full lg:px-14 lg:py-8 flex flex-col lg:justify-between lg:gap-5">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="w-10 h-10 rounded-xl ring-2 ring-white/30" />
            <div className="leading-tight">
              <p className="font-extrabold tracking-tight">{ACADEMY}</p>
              <p className="text-xs text-white/70">Digital Marketing Institute</p>
            </div>
          </div>

          <div className="mt-5 lg:mt-0">
            <p className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Student portal
            </p>
            <h1 className="sm:mt-4 text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold leading-[1.15] tracking-tight">
              Your learning,
              <br className="hidden lg:block" /> all in one place.
            </h1>
            <p className="hidden sm:block mt-3 text-white/75 max-w-md text-sm lg:text-base">
              Follow your course, submit tasks, check attendance and fees, and download your certificate.
            </p>
          </div>

          <ul className="hidden lg:[@media(min-height:560px)]:grid grid-cols-2 gap-4 max-w-xl">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="block text-xs text-white/70 mt-0.5">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="hidden xl:[@media(min-height:860px)]:flex justify-center pb-6">
            <PreviewCard />
          </div>

          <p className="hidden lg:block text-xs text-white/50">© {new Date().getFullYear()} {ACADEMY}</p>
        </div>
      </section>

      {/* Sign-in panel */}
      <section className="relative -mt-5 lg:mt-0 rounded-t-3xl lg:rounded-none bg-white flex justify-center px-6 pt-6 pb-6 lg:h-dvh lg:overflow-y-auto lg:px-12 lg:py-6">
        <div className="w-full max-w-[400px] lg:my-auto">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back 👋</h2>
          <p className="mt-1.5 text-sm text-slate-500">Sign in with the phone number or email you gave the academy.</p>

          <form onSubmit={submit} className="mt-5 lg:mt-6 space-y-4">
            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 mb-2">Phone number or email</span>
              <span className="relative block">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${field} pl-11 pr-4`}
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="98765 43210"
                  autoComplete="username"
                  autoFocus
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 mb-2">Password</span>
              <span className="relative block">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? "text" : "password"}
                  className={`${field} pl-11 pr-12`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </span>
            </label>

            {error && (
              <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !login.trim() || !password}
              className="group w-full h-12 rounded-xl bg-[#3F8CFF] text-white font-bold shadow-lg shadow-blue-500/25 hover:bg-[#2F7AF0] disabled:opacity-50 disabled:shadow-none transition inline-flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-3.5 text-[13px] text-slate-600 space-y-1.5">
            <p className="flex gap-2">
              <FiCheckCircle className="mt-0.5 shrink-0 text-[#3F8CFF]" />
              <span>Your login details were shared by the academy when you joined.</span>
            </p>
            <p className="flex gap-2">
              <FiLock className="mt-0.5 shrink-0 text-[#3F8CFF]" />
              <span>Forgot your password? Ask the academy office to reset it.</span>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Have a certificate to check?{" "}
            <Link to="/verify/certificate" className="font-semibold text-[#3F8CFF] hover:underline">
              Verify a certificate
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default StudentLogin;
