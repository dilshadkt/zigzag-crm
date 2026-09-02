import React from "react";
import { Link } from "react-router-dom";

export const APP_NAME = "Zigzag CRM";
export const COMPANY_NAME = "Zigzag Digital Solutions";
export const CONTACT_EMAIL = "workroomcrm@gmail.com";
export const SITE_URL = "https://zigzag-crm.vercel.app";

const PublicSiteLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-[#F4F9FD] text-[#0A1629]">
      <header className="border-b border-[#E4EBF5] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/image/logo.svg" alt="" className="h-8 w-8" />
            <span className="text-lg font-bold text-[#3F8CFF]">{APP_NAME}</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-[#7D8592]">
            <Link to="/privacy" className="hover:text-[#3F8CFF]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#3F8CFF]">
              Terms of Service
            </Link>
            <Link
              to="/auth/signin"
              className="rounded-xl bg-[#3F8CFF] px-3 py-2 text-white hover:bg-blue-600"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">
        {title ? <h1 className="mb-6 text-3xl font-bold">{title}</h1> : null}
        {children}
      </main>
      <footer className="border-t border-[#E4EBF5] bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-sm text-[#7D8592]">
          <p>
            © {new Date().getFullYear()} {COMPANY_NAME}. {APP_NAME} is a product of {COMPANY_NAME}.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-[#3F8CFF]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#3F8CFF]">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicSiteLayout;
