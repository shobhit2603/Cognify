import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "../services/resume.service";
import { toast } from "sonner";

export const useResumes = (filters = {}) => {
  return useQuery({
    queryKey: ["resumes", filters],
    queryFn: () => resumeService.getResumes(filters),
    select: (res) => res.data?.resumes || [],
    placeholderData: (previousData) => previousData,
  });
};

export const useResume = (id) => {
  return useQuery({
    queryKey: ["resume", id],
    queryFn: () => resumeService.getResumeById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
};

export const useResumeMutations = () => {
  const queryClient = useQueryClient();

  const uploadResumeMutation = useMutation({
    mutationFn: resumeService.uploadResume,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      if (res?.data?._id) {
        queryClient.setQueryData(["resume", res.data._id], res);
      }
      toast.success("Resume uploaded and parsed successfully");
      return res.data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to upload resume");
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({ id, title }) => resumeService.updateResumeTitle(id, title),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(["resume", variables.id], (old) => {
        if (!old) return res;
        if (old.data) {
          return { ...old, data: { ...old.data, title: variables.title } };
        }
        return { ...old, title: variables.title };
      });
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume renamed");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to rename resume");
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: resumeService.deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete resume");
    },
  });

  const runAuditMutation = useMutation({
    mutationFn: ({ id, jobDescription, targetRole }) =>
      resumeService.auditResume(id, { jobDescription, targetRole }),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(["resume", variables.id], (old) => {
        if (!old) return res;
        const currentData = old.data || old;
        const audit = res.data?.latestAudit;
        const newMsg = res.data?.message;
        const updatedMessages = newMsg
          ? [...(currentData.messages || []), newMsg]
          : currentData.messages;

        const updated = {
          ...currentData,
          latestAudit: audit || currentData.latestAudit,
          messages: updatedMessages,
        };
        return old.data ? { ...old, data: updated } : updated;
      });
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("ATS Audit completed");
      return res.data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to complete ATS audit");
    },
  });

  return {
    uploadResume: uploadResumeMutation.mutateAsync,
    isUploading: uploadResumeMutation.isPending,
    updateTitle: updateTitleMutation.mutateAsync,
    isUpdatingTitle: updateTitleMutation.isPending,
    deleteResume: deleteResumeMutation.mutateAsync,
    isDeleting: deleteResumeMutation.isPending,
    runAudit: runAuditMutation.mutateAsync,
    isAuditing: runAuditMutation.isPending,
  };
};
