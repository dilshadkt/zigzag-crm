// src/api/hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";

// Customers
export const useCustomers = () =>
  useQuery({
    queryKey: ["customers"],
    queryFn: () => apiClient.get("/customers").then((res) => res.data),
  });

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customer) => apiClient.post("/customers", customer),
    onSuccess: () => queryClient.invalidateQueries(["customers"]),
  });
};

// Items
export const useItems = () =>
  useQuery({
    queryKey: ["items"],
    queryFn: () => apiClient.get("/items").then((res) => res.data),
  });

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock }) =>
      apiClient.put(`/items/${id}/stock`, { stock }),
    onSuccess: () => queryClient.invalidateQueries(["items"]),
  });
};

// Transactions
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transaction) => apiClient.post("/transactions", transaction),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["customers"]);
      queryClient.invalidateQueries(["items"]);
    },
  });
};

export const useSettleCredit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, amount }) =>
      apiClient.post("/transactions/settle", { transactionId, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["customers"]);
    },
  });
};
export const useDashboardData = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiClient.get("/dashboard").then((res) => res.data),
  });
// Routes
export const useRootes = () =>
  useQuery({
    queryKey: ["routes"],
    queryFn: () => apiClient.get("/routes").then((res) => res.data),
  });
