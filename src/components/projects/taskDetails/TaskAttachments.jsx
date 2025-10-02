import React from "react";
import FileAndLinkUpload from "../../shared/fileUpload";

const TaskAttachments = ({ taskDetails }) => {
  if (!taskDetails) return null;

  return (
    <FileAndLinkUpload
      disable={true}
      fileClassName={"grid grid-cols-3 gap-3"}
      initialFiles={
        taskDetails?.attachments?.filter((file) => file.type !== "link") || []
      }
      initialLinks={
        taskDetails?.attachments?.filter((file) => file.type === "link") || []
      }
    />
  );
};

export default TaskAttachments;
