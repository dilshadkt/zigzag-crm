import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PublicSiteLayout, { APP_NAME, COMPANY_NAME } from "./PublicSiteLayout";

const PublicHome = () => {
  useEffect(() => {
    document.title = `${APP_NAME} - Customer Relationship Management`;
  }, []);

  return (
    <PublicSiteLayout>
      <div className="max-w-3xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#3F8CFF]">
          {COMPANY_NAME}
        </p>
        <h1 className="text-4xl font-bold leading-tight text-[#0A1629]">{APP_NAME}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#7D8592]">
          Zigzag CRM is a workplace CRM for teams. Plan work, manage leads and
          campaigns, track attendance and performance, and schedule meetings with
          Google Meet links from one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/auth/signin"
            className="rounded-xl bg-[#3F8CFF] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
          >
            Sign in to Zigzag CRM
          </Link>
          <Link
            to="/auth/register"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0A1629] shadow-sm hover:bg-blue-50"
          >
            Create an account
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Work and projects",
            text: "Create projects, tasks, and reviews so the team can plan, create, and control delivery.",
          },
          {
            title: "Leads and campaigns",
            text: "Track leads, assignments, and marketing campaign performance inside the same CRM.",
          },
          {
            title: "Meetings with Google Meet",
            text: "Schedule internal meetings and, if you connect Google Calendar, create a Google Meet link automatically.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#0A1629]">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#7D8592]">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Google Calendar access</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#7D8592]">
          Zigzag CRM can connect a Google account so that scheduling a meeting
          creates a Google Calendar event with a Google Meet link. We only do this
          after a company admin chooses Connect Google. You can disconnect at any
          time in Settings → Integration. Read how we handle this data in our{" "}
          <Link to="/privacy" className="font-semibold text-[#3F8CFF] hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/terms" className="font-semibold text-[#3F8CFF] hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </PublicSiteLayout>
  );
};

export default PublicHome;
