import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PublicSiteLayout, {
  APP_NAME,
  COMPANY_NAME,
  CONTACT_EMAIL,
  SITE_URL,
} from "./PublicSiteLayout";

const TermsOfService = () => {
  useEffect(() => {
    document.title = `Terms of Service - ${APP_NAME}`;
  }, []);

  return (
    <PublicSiteLayout title={`${APP_NAME} Terms of Service`}>
      <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-[#415770]">
        <p>
          Last updated: 2 September 2026. These Terms of Service (“Terms”) govern use of{" "}
          {APP_NAME} at {SITE_URL}, operated by {COMPANY_NAME}.
        </p>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">1. The service</h2>
          <p>
            {APP_NAME} is software for companies to manage customers, projects, employees,
            campaigns, and meetings. By creating an account or using the Service, you
            agree to these Terms and our{" "}
            <Link to="/privacy" className="font-semibold text-[#3F8CFF]">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">2. Accounts</h2>
          <p>
            You must provide accurate account information and keep credentials confidential.
            Company administrators are responsible for who they invite and for the data
            their workspace stores. You must be old enough to form a contract in your
            country, and the Service is for business use.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">3. Acceptable use</h2>
          <p>You may not:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Break the law or store unlawful content in the Service.</li>
            <li>Attempt to access other companies’ data or disrupt the Service.</li>
            <li>Use connected Google accounts for any purpose other than creating meeting events and Meet links as offered in the product.</li>
            <li>Reverse engineer, resell, or misrepresent {APP_NAME} as your own product.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">4. Google integrations</h2>
          <p>
            Connecting Google Calendar is optional. If you connect it, Google’s terms also
            apply. We only use Google access to create, update, or cancel Calendar events
            that include Google Meet links for meetings scheduled in {APP_NAME}. You can
            disconnect Google at any time. Google may revoke access independently.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">5. Your content</h2>
          <p>
            You retain rights to the content you put in {APP_NAME}. You grant us a limited
            licence to host, process, and display that content solely to operate the
            Service for your company.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">6. Availability</h2>
          <p>
            We aim to keep the Service available, but we do not guarantee uninterrupted
            operation. Features, including Google Meet link creation, depend on third-party
            services that we do not control.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">7. Limitation of liability</h2>
          <p>
            To the extent allowed by law, {COMPANY_NAME} is not liable for lost profits,
            lost data, or indirect damages arising from use of the Service. Our total
            liability for a claim relating to the Service is limited to the amount you paid
            us for the Service in the 12 months before the claim, or zero if the Service
            was provided without charge.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">8. Termination</h2>
          <p>
            You may stop using the Service at any time. We may suspend or end access if
            these Terms are violated, if required by law, or if the Service is discontinued.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#0A1629]">9. Contact</h2>
          <p>
            {COMPANY_NAME} — {APP_NAME}
            <br />
            {SITE_URL}
            <br />
            {CONTACT_EMAIL}
          </p>
        </section>
      </div>
    </PublicSiteLayout>
  );
};

export default TermsOfService;
