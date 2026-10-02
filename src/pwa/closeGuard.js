export const signOutOfApp = (redirect = "/auth/signin") => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("authState");
    localStorage.removeItem("crm_block_app_close");
    localStorage.removeItem("crm_open_shift");
    localStorage.removeItem("crm_on_break");
    sessionStorage.removeItem("crm_block_app_close");
    sessionStorage.removeItem("crm_open_shift");
    sessionStorage.removeItem("crm_on_break");
    sessionStorage.removeItem("crm_skip_checkout");
  } catch {
    // Ignore storage failures.
  }
  window.location.replace(redirect);
};
