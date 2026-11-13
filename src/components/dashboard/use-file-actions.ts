"use client";

import { trpc } from "@/app/_trpc/client";
import { useToast } from "@/components/ui/use-toast";

/**
 * Rename and delete, both optimistic: the list changes at once and is put back
 * if the server rejects the change.
 */
export function useFileActions() {
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const rename = trpc.renameFile.useMutation({
    onMutate: async ({ id, name }) => {
      await utils.getUserFiles.cancel();
      const previous = utils.getUserFiles.getData();

      utils.getUserFiles.setData(undefined, (files) =>
        files?.map((file) => (file.id === id ? { ...file, name } : file))
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      utils.getUserFiles.setData(undefined, context?.previous);
      toast({
        title: "Couldn't rename the file",
        description: "Nothing was changed. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => utils.getUserFiles.invalidate(),
  });

  const remove = trpc.deleteFile.useMutation({
    onMutate: async ({ id }) => {
      await utils.getUserFiles.cancel();
      const previous = utils.getUserFiles.getData();

      utils.getUserFiles.setData(undefined, (files) =>
        files?.filter((file) => file.id !== id)
      );

      return { previous };
    },
    onSuccess: (file) => {
      toast({ title: "File deleted", description: file.name });
    },
    onError: (_error, _input, context) => {
      utils.getUserFiles.setData(undefined, context?.previous);
      toast({
        title: "Couldn't delete the file",
        description: "It is still in your list. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      utils.getUserFiles.invalidate();
      utils.getUploadUsage.invalidate();
    },
  });

  return { rename, remove };
}
