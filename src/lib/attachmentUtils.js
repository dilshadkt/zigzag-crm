export const processAttachments = async (attachments, uploadSingleFile) => {
  if (!attachments || attachments.length === 0) return [];

  const processedAttachments = [];

  for (const attachment of attachments) {
    if (attachment.preview.startsWith("blob:") && attachment.type !== "link") {
      const attachFormData = new FormData();
      attachFormData.append("file", attachment.file);

      const attachResponse = await uploadSingleFile(attachFormData);
      if (!attachResponse.success) {
        throw new Error(`Failed to upload attachment: ${attachment.title}`);
      }

      processedAttachments.push({
        preview: attachResponse.fileUrl,
        title: attachment.title,
        type: attachment.type,
        dateTime: attachment.dateTime || new Date().toISOString(),
      });
    } else {
      // Keep existing attachment
      processedAttachments.push(attachment);
    }
  }

  return processedAttachments;
};
