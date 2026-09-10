import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketApi } from "../api/ticketApi";

const invalidateTickets = (queryClient) =>
  queryClient.invalidateQueries({ queryKey: ["tickets"] });

export const useTickets = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () => ticketApi.getTickets(params),
    enabled,
  });
};

export const useTicketCounts = (enabled = true) => {
  return useQuery({
    queryKey: ["tickets", "counts"],
    queryFn: () => ticketApi.getTicketCounts(),
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useTicket = (ticketId, enabled = true) => {
  return useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: () => ticketApi.getTicket(ticketId),
    enabled: enabled && !!ticketId,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ticketApi.createTicket(data),
    onSuccess: () => invalidateTickets(queryClient),
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, data }) => ticketApi.updateTicket(ticketId, data),
    onSuccess: () => invalidateTickets(queryClient),
  });
};

export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, assignedTo }) =>
      ticketApi.assignTicket(ticketId, assignedTo),
    onSuccess: () => invalidateTickets(queryClient),
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }) =>
      ticketApi.updateTicketStatus(ticketId, status),
    onSuccess: () => invalidateTickets(queryClient),
  });
};

export const useAddTicketComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }) =>
      ticketApi.addComment(ticketId, message),
    onSuccess: () => invalidateTickets(queryClient),
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId) => ticketApi.deleteTicket(ticketId),
    onSuccess: () => invalidateTickets(queryClient),
  });
};
