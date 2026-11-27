import React from "react";
import { useAccountsContext } from "../context";
import { useItems } from "../hooks/useAccounts";
import { fmtMoney } from "../utils/format";
import SearchableSelect from "./SearchableSelect";

/**
 * "Pick from the item list" for one list (sale, expense or asset). Picking hands
 * the item to `onPick`, which copies what it needs. Renders nothing while that
 * list is empty.
 */
const ItemPicker = ({ type, onPick, placeholder = "Pick from the item list" }) => {
  const { symbol } = useAccountsContext();
  const { data } = useItems({ type });
  const items = data?.items || [];
  if (!items.length) return null;

  return (
    <SearchableSelect
      value=""
      onChange={(id) => {
        const item = items.find((i) => i._id === id);
        if (item) onPick(item);
      }}
      options={items.map((i) => ({
        value: i._id,
        label: i.name,
        hint: [i.category, i.rate ? fmtMoney(i.rate, symbol) : null].filter(Boolean).join(" · "),
      }))}
      placeholder={placeholder}
      searchPlaceholder="Search items…"
      emptyText="No item found"
    />
  );
};

export default ItemPicker;
