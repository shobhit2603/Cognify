import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { writingService } from "../services/writing.service";
import { toast } from "sonner";

export const useWritings = (filters = {}) => {
  return useQuery({
    queryKey: ["writings", filters],
    queryFn: () => writingService.getWritings(filters),
    select: (res) => res?.data?.items || [],
    placeholderData: (previousData) => previousData,
  });
};

export const useWritingDraft = (id) => {
  return useQuery({
    queryKey: ["writing", id],
    queryFn: () => writingService.getWritingById(id),
    enabled: !!id,
    select: (res) => res?.data || null,
  });
};

export const useWritingMutations = () => {
  const queryClient = useQueryClient();

  const updateWritingMutation = useMutation({
    mutationFn: ({ id, data }) => writingService.updateWriting(id, data),
    onSuccess: (res, variables) => {
      const updated = res?.data;
      if (updated) {
        queryClient.setQueryData(["writing", variables.id], (old) => {
          if (!old) return res;
          if (old.data) return { ...old, data: { ...old.data, ...updated } };
          return { ...old, ...updated };
        });
      }
      queryClient.invalidateQueries({ queryKey: ["writings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save draft changes");
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: writingService.togglePin,
    onSuccess: (res, id) => {
      const updated = res?.data;
      if (updated) {
        queryClient.setQueryData(["writing", id], (old) => {
          if (!old) return res;
          if (old.data) return { ...old, data: { ...old.data, ...updated } };
          return { ...old, ...updated };
        });
      }
      queryClient.invalidateQueries({ queryKey: ["writings"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update pin");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: writingService.restorePreviousVersion,
    onSuccess: (res, id) => {
      queryClient.setQueryData(["writing", id], res);
      queryClient.invalidateQueries({ queryKey: ["writings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
      toast.success("Previous version restored");
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to restore previous version"
      );
    },
  });

  const deleteWritingMutation = useMutation({
    mutationFn: writingService.deleteWriting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete draft");
    },
  });

  return {
    updateWriting: updateWritingMutation.mutateAsync,
    isSaving: updateWritingMutation.isPending,
    togglePin: togglePinMutation.mutate,
    togglePinAsync: togglePinMutation.mutateAsync,
    restorePreviousVersion: restoreMutation.mutate,
    restorePreviousVersionAsync: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    deleteWriting: deleteWritingMutation.mutateAsync,
  };
};
