import { useMemo, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import LeadDetailTabs from "./components/LeadDetailTabs";
import LeadOverviewSection from "./components/LeadOverviewSection";
import LeadTimeline from "./components/LeadTimeline";
import LeadNotes from "./components/LeadNotes";
import LeadAttachments from "./components/LeadAttachments";
import LeadEmails from "./components/LeadEmails";
import LeadActivityPanel from "./components/LeadActivityPanel";
import LeadQuickActions from "./components/LeadQuickActions";
import { useUploadLeadAttachment } from "../leads/api";

const TABS = ["Overview", "Timeline", "Notes", "Attachments", "Emails"];

const LeadDetailsFeature = ({ lead, onBack }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const leadId = lead.id || lead._id;

  // Use notes from lead.details (will be updated when API refetches)
  const notes = lead.details?.notes || [];
  const attachments = lead.details?.attachments || [];

  // Upload attachment mutation
  const { mutateAsync: uploadAttachment, isLoading: isUploadingAttachment } =
    useUploadLeadAttachment();

  const handleAddNote = (newNote) => {
    // This is called for optimistic updates, but the real data comes from API refetch
    // The notes will be automatically updated when the query refetches
    console.log("Note added (optimistic):", newNote);
  };

  const handleUploadFile = async (file) => {
    if (!leadId) {
      console.error("Lead ID is required to upload attachment");
      throw new Error("Lead ID is required");
    }

    try {
      await uploadAttachment({ leadId, file });
      console.log("File uploaded successfully");
      // The query will automatically refetch and update attachments
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error; // Re-throw so LeadAttachments can handle it
    }
  };

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "Timeline":
        return <LeadTimeline timeline={lead.details.timeline} />;
      case "Notes":
        return (
          <LeadNotes
            notes={notes}
            onAddNote={handleAddNote}
            leadId={lead.id || lead._id}
          />
        );
      case "Attachments":
        return (
          <LeadAttachments
            attachments={attachments}
            onUpload={handleUploadFile}
          />
        );
      case "Emails":
        return <LeadEmails emails={lead.details.emails} />;
      case "Overview":
      default:
        return <LeadOverviewSection lead={lead} />;
    }
  }, [activeTab, lead, notes, attachments]);

  return (
    <div
      className="bg-white rounded-3xl border border-slate-100
      h-full flex flex-col  shadow-sm overflow-hidden"
    >
      <div className="h-full  overflow-hidden flex gap-6 p-6">
        <div
          className="lg:col-span-3 space-y-3 w-full
         h-full overflow-y-auto flex flex-col  "
        >
          <div className="flex items-center gap-x-2">
            {onBack && (
              <button
                title="back to list"
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-gray-50 border border-slate-200 flex
              cursor-pointer items-center  group justify-center hover:bg-[#3f8cff]"
              >
                <FiArrowLeft size={16} className="group-hover:text-white" />
              </button>
            )}
            <LeadDetailTabs
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          <div className="h-full overflow-y-auto">{tabContent}</div>
        </div>
        <div className="min-w-[350px] flex flex-col space-y-3 ">
          <LeadActivityPanel
            activity={lead.details?.activities || lead.details?.activity || []}
          />
          <LeadQuickActions />
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsFeature;
