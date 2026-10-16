import { createContext, useContext } from "react";

export const AccountsContext = createContext({
  settings: null,
  permissions: {},
  symbol: "₹",
});

export const useAccountsContext = () => useContext(AccountsContext);
