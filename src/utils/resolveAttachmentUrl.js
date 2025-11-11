import apiClient from "../api/client";

let cachedAssetBase = null;

const sanitizePath = (pathname) => {
  if (!pathname) return "/";

  const trimmed = pathname.replace(/\/+/g, "/");
  const withoutApi = trimmed.replace(/\/?api\/?$/i, "/");
  return withoutApi.endsWith("/") ? withoutApi : `${withoutApi}/`;
};

const computeAssetBase = () => {
  const candidates = [
    apiClient?.defaults?.baseURL,
    typeof window !== "undefined" ? window.location.origin : "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      url.pathname = sanitizePath(url.pathname);
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      // Ignore and try next candidate
    }
  }

  return typeof window !== "undefined" ? `${window.location.origin}/` : "";
};

export const resolveAttachmentUrl = (rawUrl) => {
  if (!rawUrl) return "";

  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  if (/^(?:blob:|data:|https?:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    const protocol =
      typeof window !== "undefined" && window.location?.protocol
        ? window.location.protocol
        : "https:";
    return `${protocol}${trimmed}`;
  }

  if (!cachedAssetBase) {
    cachedAssetBase = computeAssetBase();
  }

  const base =
    cachedAssetBase ||
    (typeof window !== "undefined" ? `${window.location.origin}/` : "");

  try {
    return new URL(trimmed, base).href;
  } catch (error) {
    console.warn(
      "[resolveAttachmentUrl] Failed to resolve attachment URL:",
      trimmed,
      error
    );
    return trimmed;
  }
};

export const resetAttachmentUrlCache = () => {
  cachedAssetBase = null;
};

export default resolveAttachmentUrl;
