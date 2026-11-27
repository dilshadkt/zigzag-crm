import { useMemo } from "react";
import { useAccountClients, useClientLookup, useVendors } from "./useAccounts";

// A party is a client or a vendor. A select holds it as "client:<id>" (a project),
// "account:<id>" (a client without a project) or "vendor:<id>". Staff are chosen
// in the Staff section, as "staff:<id>".

/** Clients and vendors as one alphabetical list of select options. */
export const usePartyOptions = (enabled = true) => {
  const { data: clients } = useClientLookup(enabled);
  const { data: vendors } = useVendors(undefined, enabled);
  const { data: others } = useAccountClients(undefined, enabled);
  return useMemo(
    () =>
      [
        ...(clients?.clients || []).map((c) => ({ value: `client:${c._id}`, label: c.name, hint: "Client" })),
        ...(others?.clients || []).map((c) => ({ value: `account:${c._id}`, label: c.name, hint: "Client" })),
        ...(vendors?.vendors || []).map((v) => ({ value: `vendor:${v._id}`, label: v.name, hint: "Vendor" })),
      ].sort((a, b) => a.label.localeCompare(b.label)),
    [clients, others, vendors]
  );
};

/** A select value -> the API field it belongs in: { project }, { accountClient }, { vendor } or { staff }. */
export const splitParty = (value) => {
  if (!value) return {};
  const [type, id] = value.split(":");
  if (type === "vendor") return { vendor: id };
  if (type === "staff") return { staff: id };
  return type === "account" ? { accountClient: id } : { project: id };
};
