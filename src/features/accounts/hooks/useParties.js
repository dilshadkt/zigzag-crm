import { useMemo } from "react";
import { useClientLookup, useVendors } from "./useAccounts";

// A party is a client or a vendor. A select holds it as "client:<id>" / "vendor:<id>".

/** Clients and vendors as one alphabetical list of select options. */
export const usePartyOptions = (enabled = true) => {
  const { data: clients } = useClientLookup(enabled);
  const { data: vendors } = useVendors(undefined, enabled);
  return useMemo(
    () =>
      [
        ...(clients?.clients || []).map((c) => ({ value: `client:${c._id}`, label: c.name, hint: "Client" })),
        ...(vendors?.vendors || []).map((v) => ({ value: `vendor:${v._id}`, label: v.name, hint: "Vendor" })),
      ].sort((a, b) => a.label.localeCompare(b.label)),
    [clients, vendors]
  );
};

/** A select value -> the API field it belongs in: { project } or { vendor }. */
export const splitParty = (value) => {
  if (!value) return {};
  const [type, id] = value.split(":");
  return type === "vendor" ? { vendor: id } : { project: id };
};
