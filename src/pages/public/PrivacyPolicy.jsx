import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PublicSiteLayout, {
  APP_NAME,
  COMPANY_NAME,
  CONTACT_EMAIL,
  SITE_URL,
} from "./PublicSiteLayout";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = `Privacy Policy - ${APP_NAME}`;
  }, []);

  return (
    <PublicSiteLayout title={`${APP_NAME} Privacy Policy`}>
      <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-[#415770]">
        <p>
          Last updated: 2 September 2026. This Privacy Policy describes how {COMPANY_NAME}{" "}
          (“we”, “us”) collects, uses, stores, and shares information when you use{" "}
          {APP_NAME} at {SITE_URL} and related apps (the “Service”).
        </p>
        <p>
          {APP_NAME} is a customer relationship and workplace management product. It is
          intended for businesses and their invited employees and clients. This page
          is the privacy policy for {APP_NAME}. It is not the homepage.
        </p>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">1. Who we are</h2>
          <p>
            The Service is operated by {COMPANY_NAME}. For privacy questions, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#3F8CFF]">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">2. Information we collect</h2>
          <p>We collect information that you and your company provide, and information created while using the Service:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Account details: name, email address, phone number, password (stored hashed),
              profile photo, job position, and company membership.
            </li>
            <li>
              Company and workplace data: projects, tasks, leads, campaigns, attendance,
              chat messages, files you upload, and meeting records.
            </li>
            <li>
              Usage data: login times, device/browser type, IP address, and product activity
              needed to operate and secure the Service.
            </li>
            <li>
              Google account data, only if a company admin connects Google Calendar. See
              section 4.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">3. How we use information</h2>
          <p>We use this information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Create and manage user accounts and company workspaces.</li>
            <li>Provide CRM, project, lead, campaign, attendance, and meeting features.</li>
            <li>Send product notifications, such as meeting invites and task updates.</li>
            <li>Create Google Meet links when Google Calendar is connected.</li>
            <li>Secure the Service, prevent abuse, and diagnose technical issues.</li>
            <li>Comply with law and enforce our Terms of Service.</li>
          </ul>
          <p className="mt-2">
            We do not sell personal information. We do not use Google user data for
            advertising. We do not use Google user data for independent research or for
            training unrelated AI models.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">
            4. Google Calendar and Google Meet
          </h2>
          <p>
            If a company administrator chooses to connect Google, {APP_NAME} requests
            permission to access Google Calendar events and the Google account email.
            We use this access only to:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Create a Google Calendar event for a meeting scheduled in {APP_NAME}.</li>
            <li>Attach a Google Meet video conference to that event.</li>
            <li>Update or cancel that same event if the meeting is edited or cancelled.</li>
            <li>Show that Google is connected, including the connected account email.</li>
          </ul>
          <p className="mt-2">
            We store OAuth tokens needed to keep that connection working. We do not read
            your full calendar to market to you. We do not share Google Calendar data with
            other users except as needed to show the generated Meet link inside the
            meeting in {APP_NAME}. You can disconnect Google at any time in Settings →
            Integration. After disconnect, we stop creating new Calendar events and delete
            the stored Google tokens.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">5. How we share information</h2>
          <p>We share information only:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>With members of your company workspace, according to roles and permissions.</li>
            <li>With Google, when you ask us to create a Calendar event or Meet link.</li>
            <li>
              With infrastructure providers that host the Service, such as database, file
              storage, and email delivery vendors, under contracts that limit their use of
              the data.
            </li>
            <li>If required by law, or to protect the rights and safety of users.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">6. Retention and security</h2>
          <p>
            We keep account and workspace data while the company account is active. Google
            tokens are kept only while Google remains connected. We use reasonable
            technical and organisational measures to protect data, including encrypted
            transport and access controls. No method of storage is completely secure.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">7. Your choices</h2>
          <p>
            You can update profile information in the Service. A company administrator can
            disconnect Google Calendar. You may request access, correction, or deletion of
            personal data by emailing {CONTACT_EMAIL}. Some records may be retained where
            we must keep them for security, legal, or backup reasons.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">8. Children</h2>
          <p>
            {APP_NAME} is a business product. It is not directed at children under 16, and
            we do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">9. Changes</h2>
          <p>
            We may update this Privacy Policy. The “Last updated” date at the top will
            change when we do. Continued use of the Service after an update means you
            accept the revised policy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">10. Contact</h2>
          <p>
            {COMPANY_NAME}
            <br />
            Product: {APP_NAME}
            <br />
            Website: {SITE_URL}
            <br />
            Email: {CONTACT_EMAIL}
          </p>
          <p className="mt-3">
            Also see our{" "}
            <Link to="/terms" className="font-semibold text-[#3F8CFF]">
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </div>
    </PublicSiteLayout>
  );
};

export default PrivacyPolicy;
