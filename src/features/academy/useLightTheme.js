import { useLayoutEffect } from "react";

/**
 * The student portal and the public certificate page are designed light only.
 * A staff member's dark-mode choice (same browser) must not restyle them, so
 * force light while mounted and put the staff theme back on the way out.
 */
const useLightTheme = () => {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
    return () => {
      if (previous) root.setAttribute("data-theme", previous);
      root.style.colorScheme = previous || "";
    };
  }, []);
};

export default useLightTheme;
