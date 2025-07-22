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

/**
 * Clean up task data by removing empty string values for ObjectId fields
 * @param {Object} taskData - The task data to clean
 * @returns {Object} - Cleaned task data
 */
export const cleanTaskData = (taskData) => {
  const cleanedData = { ...taskData };

  // Remove empty string values for ObjectId fields
  const objectIdFields = [
    "taskFlow",
    "extraTaskWorkType",
    "maxRecurrences",
    "recurringEndDate",
  ];

  objectIdFields.forEach((field) => {
    if (cleanedData[field] === "") {
      delete cleanedData[field];
    }
  });

  // Handle project field - convert empty string to null
  if (cleanedData.project === "") {
    cleanedData.project = null;
  }

  return cleanedData;
};
