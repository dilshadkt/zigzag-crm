import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PublicSiteLayout, { APP_NAME, COMPANY_NAME } from "./PublicSiteLayout";

const features = [
  {
    title: "Leads and sales pipeline",
    text: "Capture enquiries, assign owners, score leads, and see follow-ups in one place so sales work does not live in spreadsheets and chat.",
  },
  {
    title: "Campaigns and ads",
    text: "Run and review marketing campaigns next to the leads they create, including Facebook ads performance when that account is connected.",
  },
  {
    title: "Projects, tasks, and reviews",
    text: "Plan delivery with projects, tasks, subtasks, and review steps so coordinators and clients know what is in progress and what is blocked.",
  },
  {
    title: "Attendance and HR",
    text: "Track attendance, leave, and working hours without a separate HR tool for everyday team operations.",
  },
  {
    title: "Meetings with Google Meet",
    text: "Schedule internal meetings, auto-create a Google Meet link when Google Calendar is connected, then report who attended.",
  },
  {
    title: "Performance and accountability",
    text: "Points, leaderboards, and scoring rules make completed work and attendance visible, so managers are not chasing status updates.",
  },
  {
    title: "Client portal",
    text: "Give clients a controlled view of their work and leads instead of sending endless file and status messages.",
  },
  {
    title: "Roles and permissions",
    text: "Company admins decide who can schedule meetings, manage leads, or change settings, so the same CRM fits a whole agency team.",
  },
];

const reasons = [
  {
    title: "Stop switching between tools",
    text: "Sales, delivery, attendance, and meetings sit in one workspace. That cuts dropped handovers between marketing, operations, and accounts.",
  },
  {
    title: "Managers see the real picture",
    text: "Workload, deadlines, lead status, and meeting attendance are visible without asking each person for a daily update.",
  },
  {
    title: "Clients stay informed",
    text: "A portal and structured reviews reduce “what is the status?” messages and keep approvals on the record.",
  },
  {
    title: "Meetings actually happen in Google Meet",
    text: "Zigzag CRM does not replace Google Meet. It creates the meeting, the link, and the attendance record, then people join on Google.",
  },
];

const PublicLanding = () => {
  useEffect(() => {
    document.title = `${APP_NAME} - Customer Relationship Management`;
  }, []);

  return (
    <PublicSiteLayout wide>
      <section className="overflow-hidden rounded-[32px] bg-[#3F8CFF] px-6 py-12 text-white sm:px-12 sm:py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
          {COMPANY_NAME}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          {APP_NAME}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/90">
          Zigzag CRM is the workplace CRM for agencies and growing teams. Run
          leads, projects, campaigns, attendance, and Google Meet meetings from
          one product your whole company can actually use.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/auth/signin"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#3F8CFF] hover:bg-blue-50"
          >
            Sign in to Zigzag CRM
          </Link>
          <Link
            to="/auth/register"
            className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Create a company account
          </Link>
        </div>
      </section>

      <section id="why" className="mt-14">
        <h2 className="text-2xl font-bold">Why companies use Zigzag CRM</h2>
        <p className="mt-2 max-w-3xl text-[#7D8592]">
          Most teams already have a chat app, a calendar, and a task list. Work
          still slips because none of those tools own the full customer and
          delivery process. Zigzag CRM is built for that gap.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {reasons.map((item) => (
            <article key={item.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#7D8592]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="mt-14">
        <h2 className="text-2xl font-bold">Features</h2>
        <p className="mt-2 max-w-3xl text-[#7D8592]">
          Everything below is part of Zigzag CRM. Teams use what they need;
          company admins control access.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <article key={item.title} className="rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#7D8592]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold">Google Calendar and Google Meet</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#7D8592]">
          Zigzag CRM can connect a Google account so that scheduling a meeting
          creates a Google Calendar event with a Google Meet link. We only do
          this after a company admin chooses Connect Google. You can disconnect
          at any time in Settings → Integration. This app does not embed Google
          Meet video inside the CRM. People join the call on Google Meet.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
          <Link to="/privacy" className="text-[#3F8CFF] hover:underline">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-[#3F8CFF] hover:underline">
            Terms of Service
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default PublicLanding;
