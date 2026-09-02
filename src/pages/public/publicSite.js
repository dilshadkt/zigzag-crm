export const APP_NAME = "Zigzag CRM";
export const COMPANY_NAME = "Zigzag Digital Solutions";
export const CONTACT_EMAIL = "workroomcrm@gmail.com";
export const SITE_URL = "https://zigzag-crm.vercel.app";
export const PUBLIC_LANDING_PATH = "/home";

const normalizedPath = (pathname = "") => pathname.replace(/\/$/, "") || "/";

export const isPublicAppPath = (pathname = "") => {
  const path = normalizedPath(pathname);
  return path === "/home" || path === "/privacy" || path === "/terms";
};
