import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes: keep data fresh but reduce redundant refetches
      refetchOnWindowFocus: false, // Don't refetch on tab switch by default
      retry: 1, // Limit retries to 1 for faster failure feedback
    },
  },
});

if (typeof window !== "undefined" && window.desktop) {
  const basePath = import.meta.env.BASE_URL.replace(/\/?$/, "/");

  window.addEventListener(
    "error",
    (event) => {
      const target = event.target;

      if (
        target instanceof HTMLImageElement &&
        target.dataset.assetFallbackApplied !== "true"
      ) {
        const originalSrc = target.getAttribute("src");

        if (originalSrc && originalSrc.startsWith("/")) {
          event.preventDefault();
          event.stopPropagation();

          target.dataset.assetFallbackApplied = "true";
          target.src = `${basePath}${originalSrc.slice(1)}`;
        }
      }
    },
    true
  );
}

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <App />
    </Provider>
  </QueryClientProvider>
  // </StrictMode>
);
