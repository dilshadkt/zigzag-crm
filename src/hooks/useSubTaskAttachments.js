import { useState } from "react";
import { processAttachments } from "../lib/attachmentUtils";
import { uploadSingleFile } from "../api/service";
import {
  useAddSubTaskAttachments,
  useRemoveSubTaskAttachment,
} from "../api/hooks";

export const useSubTaskAttachments = (subTaskId, parentTaskId) => {
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const addAttachmentsMutation = useAddSubTaskAttachments(
    subTaskId,
    parentTaskId
  );
  const removeAttachmentMutation = useRemoveSubTaskAttachment(
    subTaskId,
    parentTaskId
  );

  const getFileType = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "doc";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "other";
  };

  const handleFileUpload = async (files) => {
    if (!files || !files.length) return;

    setIsUploading(true);

    try {
      const newAttachments = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        type: getFileType(file),
        title: file.name,
        dateTime: new Date().toISOString(),
        description: "", // Users can add description later if needed
      }));

      // Process attachments (upload to server)
      const processedAttachments = await processAttachments(
        newAttachments,
        uploadSingleFile
      );

      // Add attachments to subtask
      await addAttachmentsMutation.mutateAsync(processedAttachments);

      // Clean up preview URLs
      newAttachments.forEach((attachment) => {
        if (attachment.preview.startsWith("blob:")) {
          URL.revokeObjectURL(attachment.preview);
        }
      });

      return { success: true };
    } catch (error) {
      console.error("Error uploading attachments:", error);
      // Clean up preview URLs on error
      Array.from(files).forEach((file) => {
        const preview = URL.createObjectURL(file);
        URL.revokeObjectURL(preview);
      });
      return { success: false, error: error.message };
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      await removeAttachmentMutation.mutateAsync(attachmentId);
      return { success: true };
    } catch (error) {
      console.error("Error removing attachment:", error);
      return { success: false, error: error.message };
    }
  };

  const handleAttachmentChange = (newAttachments) => {
    setAttachments(newAttachments);
  };

  return {
    attachments,
    isUploading,
    handleFileUpload,
    handleRemoveAttachment,
    handleAttachmentChange,
    isAddingAttachment: addAttachmentsMutation.isLoading,
    isRemovingAttachment: removeAttachmentMutation.isLoading,
  };
};
