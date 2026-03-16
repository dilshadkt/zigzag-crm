import { useMemo, useState } from "react";
import { FiArrowLeft, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import LeadDetailTabs from "./components/LeadDetailTabs";
import LeadOverviewSection from "./components/LeadOverviewSection";
import LeadTimeline from "./components/LeadTimeline";
import LeadNotes from "./components/LeadNotes";
import LeadAttachments from "./components/LeadAttachments";
import LeadEmails from "./components/LeadEmails";
import LeadActivityPanel from "./components/LeadActivityPanel";
import LeadQuickActions from "./components/LeadQuickActions";
import { useUploadLeadAttachment, useLogLeadActivity, useAddLeadNote, useUpdateLead, useGetLeadStatuses } from "../leads/api";
import LeadInteractionModal from "./components/LeadInteractionModal";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const TABS = ["Overview", "Timeline", "Notes", "Attachments", "Emails"];

const LeadDetailsFeature = ({ lead, onBack }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const leadId = lead.id || lead._id;

  // Use notes from lead.details (will be updated when API refetches)
  const notes = lead.details?.notes || [];
  const attachments = lead.details?.attachments || [];
  const phoneNumber = lead.contact?.phone || lead.details?.contact?.phone;

  // Mutations
  const { mutateAsync: uploadAttachment, isLoading: isUploadingAttachment } =
    useUploadLeadAttachment();
  const { mutate: logActivity } = useLogLeadActivity();
  const { mutate: addNote } = useAddLeadNote();
  const { mutate: updateLead } = useUpdateLead();

  // Get statuses for the modal
  const { data: statusesData } = useGetLeadStatuses();
  const statuses = statusesData?.data || [];

  // Interaction tracking state
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [interactionType, setInteractionType] = useState(null); // 'call' or 'whatsapp'
  const [hasPendingInteraction, setHasPendingInteraction] = useState(false);

  // Detect when user returns to app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasPendingInteraction) {
        // Short delay to let the UI settle
        setTimeout(() => {
          setIsInteractionModalOpen(true);
          setHasPendingInteraction(false);
        }, 800);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [hasPendingInteraction]);

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

  const handleCallClick = () => {
    if (!leadId) return;

    setInteractionType("call");
    setHasPendingInteraction(true);

    logActivity(
      {
        leadId,
        type: "call_made",
        title: "Call Initiated",
        description: `Call initiated to ${phoneNumber}`,
        metadata: { phoneNumber },
      },
      {
        onSuccess: () => {
          console.log("Call activity logged");
        },
        onError: (err) => {
          console.error("Failed to log call activity", err);
        },
      }
    );
  };

  const handleWhatsappClick = () => {
    if (!leadId) return;

    setInteractionType("whatsapp");
    setHasPendingInteraction(true);

    logActivity(
      {
        leadId,
        type: "whatsapp_conversation",
        title: "WhatsApp Conversation",
        description: `WhatsApp conversation initiated with ${phoneNumber}`,
        metadata: { phoneNumber },
      },
      {
        onSuccess: () => {
          console.log("WhatsApp activity logged");
        },
        onError: (err) => {
          console.error("Failed to log WhatsApp activity", err);
        },
      }
    );
  };

  const handleSaveInteraction = ({ note, statusId }) => {
    if (!leadId) return;

    // 1. Add note if provided
    if (note.trim()) {
      addNote({
        leadId,
        noteData: { text: note.trim() }
      }, {
        onSuccess: () => {
          toast.success("Note added successfully");
        }
      });
    }

    // 2. Update status if changed
    const currentStatusId = lead.status?._id || lead.status?.id || lead.status;
    if (statusId && statusId !== currentStatusId) {
      updateLead({
        leadId,
        leadData: { status: statusId }
      }, {
        onSuccess: () => {
          toast.success("Lead status updated");
        }
      });
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
      className="lg:bg-white rounded-3xl lg:border border-slate-100
      h-full flex flex-col  lg:shadow-sm lg:overflow-hidden"
    >
      <div className="h-full  lg:overflow-hidden flex flex-col lg:flex-row gap-6  p-0 lg:p-6">
        <div
          className="lg:col-span-3 space-y-1 lg:space-y-3 w-full
         h-full lg:overflow-y-auto flex flex-col  "
        >
          <div className="flex items-center gap-x-2">
            {onBack && (
              <button
                title="back to list"
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-gray-50 border
                 border-slate-200 hidden lg:flex
              cursor-pointer items-center  group justify-center 
              hover:bg-[#3f8cff]"
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
        <div className="min-w-[350px] hidden lg:flex flex-col space-y-3 ">
          <LeadActivityPanel
            activity={lead.details?.activities || lead.details?.activity || []}
          />
          <LeadQuickActions 
            onCall={handleCallClick}
            onWhatsapp={handleWhatsappClick}
            phoneNumber={phoneNumber}
          />
        </div>
      </div>

      {/* Mobile Sticky Action Buttons */}
      {phoneNumber && (
        <div className="lg:hidden fixed bottom-4 right-6 flex flex-col gap-2 z-50">
          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsappClick}
            className="w-14 h-14 bg-[#25D366] text-white rounded-full 
            shadow-lg flex items-center justify-center hover:bg-[#1ebe57] transition-colors"
            aria-label="WhatsApp Lead"
          >
            <FaWhatsapp size={28} />
          </a>

          {/* Call Button */}
          <a
            href={`tel:${phoneNumber}`}
            onClick={handleCallClick}
            className="w-14 h-14 bg-[#3f8cff] text-white rounded-full 
            shadow-lg flex items-center justify-center hover:bg-[#2f6bff] transition-colors"
            aria-label="Call Lead"
          >
            <FiPhone size={24} />
          </a>
        </div>
      )}
      {/* Interaction Follow-up Modal */}
      <LeadInteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        onSave={handleSaveInteraction}
        lead={lead}
        statuses={statuses}
        interactionType={interactionType}
      />
    </div>
  );
};

export default LeadDetailsFeature;
