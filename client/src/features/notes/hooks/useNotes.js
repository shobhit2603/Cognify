import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import { toast } from "sonner";

export const useNotes = (filters = {}) => {
  return useQuery({
    queryKey: ["notes", filters],
    queryFn: () => noteService.getNotes(filters),
    select: (res) => res.data || [],
    placeholderData: (previousData) => previousData,
  });
};

export const useNoteFolders = () => {
  return useQuery({
    queryKey: ["note-folders"],
    queryFn: noteService.getFolders,
    select: (res) => res.data || [],
  });
};

export const useNote = (id) => {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => noteService.getNoteById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
};

export const useNoteMutations = () => {
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: noteService.createNote,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note-folders"] });
      return res.data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create note");
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => noteService.updateNote(id, data),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(["note", variables.id], (old) => ({
        ...old,
        ...res.data,
      }));
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note-folders"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save note");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: noteService.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note-folders"] });
      toast.success("Note deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete note");
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: noteService.togglePin,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success(res.message || "Pin updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update pin");
    },
  });

  const moveNoteMutation = useMutation({
    mutationFn: ({ id, folderId }) => noteService.moveNote(id, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note-folders"] });
      toast.success("Note moved");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to move note");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: noteService.restorePreviousEnhancement,
    onSuccess: (res, id) => {
      queryClient.setQueryData(["note", id], res.data);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Previous enhancement restored!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to restore enhancement");
    },
  });

  // Folder mutations
  const createFolderMutation = useMutation({
    mutationFn: noteService.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note-folders"] });
      toast.success("Folder created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create folder");
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, data }) => noteService.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note-folders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Folder updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update folder");
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: noteService.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note-folders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Folder deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete folder");
    },
  });

  return {
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    togglePin: togglePinMutation.mutateAsync,
    moveNote: moveNoteMutation.mutateAsync,
    restorePreviousEnhancement: restoreMutation.mutateAsync,
    createFolder: createFolderMutation.mutateAsync,
    updateFolder: updateFolderMutation.mutateAsync,
    deleteFolder: deleteFolderMutation.mutateAsync,
    isCreatingNote: createNoteMutation.isPending,
    isUpdatingNote: updateNoteMutation.isPending,
  };
};
