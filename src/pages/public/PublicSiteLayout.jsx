import React from "react";
import { Link } from "react-router-dom";
import {
  APP_NAME,
  COMPANY_NAME,
  PUBLIC_LANDING_PATH,
} from "./publicSite";

export { APP_NAME, COMPANY_NAME, CONTACT_EMAIL, SITE_URL } from "./publicSite";

const PublicSiteLayout = ({ children, title, wide = false }) => {
  return (
    <div className="min-h-screen bg-[#F4F9FD] text-[#0A1629]">
      <header className="sticky top-0 z-20 border-b border-[#E4EBF5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <Link to={PUBLIC_LANDING_PATH} className="flex min-w-0 items-center gap-2 sm:gap-3">
            <img src="/image/logo.svg" alt="" className="h-8 w-8 shrink-0" />
            <span className="truncate text-base font-bold text-[#3F8CFF] sm:text-lg">{APP_NAME}</span>
          </Link>
          <nav className="flex shrink-0 items-center gap-3 text-sm font-semibold text-[#7D8592] sm:gap-4">
            <a href={`${PUBLIC_LANDING_PATH}#features`} className="hidden hover:text-[#3F8CFF] sm:inline">
              Features
            </a>
            <Link to="/privacy" className="hidden hover:text-[#3F8CFF] md:inline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hidden hover:text-[#3F8CFF] md:inline">
              Terms of Service
            </Link>
            <Link
              to="/auth/signin"
              className="whitespace-nowrap rounded-xl bg-[#3F8CFF] px-3 py-2 text-white hover:bg-blue-600"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className={`mx-auto px-4 py-6 sm:px-5 sm:py-10 ${wide ? "max-w-6xl" : "max-w-5xl"}`}>
        {title ? <h1 className="mb-6 text-3xl font-bold">{title}</h1> : null}
        {children}
      </main>
      <footer className="border-t border-[#E4EBF5] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-[#7D8592] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <p>
            © {new Date().getFullYear()} {COMPANY_NAME}. {APP_NAME} is a product of {COMPANY_NAME}.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to={PUBLIC_LANDING_PATH} className="hover:text-[#3F8CFF]">
              Home
            </Link>
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
