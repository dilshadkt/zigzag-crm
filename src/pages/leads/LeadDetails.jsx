import { useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  useGetLeadById,
  useGetLeadNotes,
  useGetLeadAttachments,
  useGetLeadActivities,
} from "../../features/leads/api";
import LeadDetailsFeature from "../../features/leadDetails";
import LeadDetailsShimmer from "../../features/leadDetails/components/LeadDetailsShimmer";

const LeadDetailsPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to use lead from navigation state first (for faster loading)
  const leadFromState = location.state?.lead;
  
  // Fetch lead and related data from API
  const {
    data: leadData,
    isLoading: isLoadingLead,
    error: leadError,
  } = useGetLeadById(leadId);

  const {
    data: notesData,
    isLoading: isLoadingNotes,
  } = useGetLeadNotes(leadId);

  const {
    data: attachmentsData,
    isLoading: isLoadingAttachments,
  } = useGetLeadAttachments(leadId);

  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
  } = useGetLeadActivities(leadId);

  // Extract lead from response
  // Backend returns: { success: true, data: { lead: {...}, notes: [], attachments: [], activities: [] } }
  // Axios response: { data: { success: true, data: {...} } }
  // Hook returns: response.data = { success: true, data: {...} }
  // React Query: leadData = { success: true, data: {...} } (queryFn return value)
  // So: leadData.data = { lead: {...}, notes: [], ... }
  const apiResponse = leadData?.data;
  const lead = leadFromState || apiResponse?.lead;
  
  // Debug logging (remove in production)
  if (leadData && !lead) {
    console.log("LeadData structure:", {
      leadData,
      "leadData.data": leadData.data,
      "leadData.data?.lead": leadData.data?.lead,
      "apiResponse": apiResponse,
      "lead": lead,
      "hasLead": !!lead,
    });
  }
  
  // Use data from getLeadById if available, otherwise use separate API calls
  // Notes/attachments/activities hooks also return { success: true, data: [...] }
  const notes = apiResponse?.notes || notesData?.data || [];
  const attachments = apiResponse?.attachments || attachmentsData?.data || [];
  const activities = apiResponse?.activities || activitiesData?.data || [];

  // Only show loading if we're actually loading and don't have the data yet
  const isLoading = isLoadingLead || 
    (isLoadingNotes && !apiResponse?.notes && notes.length === 0) || 
    (isLoadingAttachments && !apiResponse?.attachments && attachments.length === 0) || 
    (isLoadingActivities && !apiResponse?.activities && activities.length === 0);
  
  // Check if we have lead data (either from state or API)
  const hasLead = !!lead;

  // Transform backend data structure to match frontend expectations
  const transformedLead = useMemo(() => {
    if (!lead) return null;

    // Transform activities to timeline format
    const timeline = activities.map((activity) => {
      const user = activity.performedBy || activity.user || {};
      const userName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email || "Unknown User";
      
      return {
        label: activity.title || activity.description || activity.type,
        date: new Date(activity.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        color: "bg-blue-500",
        user: userName,
      };
    });

    // Transform notes
    const transformedNotes = notes.map((note) => {
      const author = note.author || {};
      const authorName = author.firstName && author.lastName
        ? `${author.firstName} ${author.lastName}`
        : author.email || "Unknown User";
      
      return {
        text: note.text,
        author: authorName,
        date: new Date(note.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    });

    // Transform attachments
    const transformedAttachments = attachments.map((attachment) => {
      const sizeInMB = (attachment.size / (1024 * 1024)).toFixed(2);
      return {
        name: attachment.originalName,
        size: `${sizeInMB} MB`,
        date: new Date(attachment.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        type: attachment.mimetype?.split("/")[0]?.toUpperCase() || "FILE",
        url: attachment.url,
      };
    });

    return {
      ...lead,
      id: lead._id || lead.id,
      // Ensure details structure exists
      details: {
        contact: lead.contact || {},
        leadDetails: {
          status: lead.status?.name || lead.status,
          source: lead.source || "Manual Entry",
          created: lead.createdAt
            ? new Date(lead.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "",
          owner: lead.owner?.firstName || lead.owner?.name || "Unknown",
        },
        notes: transformedNotes,
        attachments: transformedAttachments,
        activities: activities,
        timeline,
        emails: [],
        // Use AI suggestions from lead data (backend generated), or default if not available
        aiSuggestions: lead.aiSuggestions || lead.details?.aiSuggestions || {
          conversationCoach: {
            sentiment: "Neutral",
            recommendations: ["No recommendations available at this time."],
          },
          dealStage: {
            stage: "Initial Contact",
            steps: ["No guidance available at this time."],
          },
        },
      },
    };
  }, [lead, notes, attachments, activities]);

  if (isLoading) {
    return <LeadDetailsShimmer />;
  }

  // Show error only if we're done loading and there's an actual error
  if (!isLoading && leadError) {
    console.error("Lead error:", leadError);
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <p className="text-lg font-semibold text-slate-800">
          Lead not found or has been removed.
        </p>
        <button
          onClick={() => navigate("/leads")}
          className="px-4 py-2 rounded-full bg-[#3f8cff] text-white font-medium"
        >
          Back to Leads
        </button>
      </div>
    );
  }
  
  // If we've finished loading lead but still no lead data, show error
  // But only if we're sure the request completed (not loading and no error means it completed successfully but no data)
  if (!isLoadingLead && !leadError && !hasLead && leadData) {
    // Data was returned but no lead found in it
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <p className="text-lg font-semibold text-slate-800">
          Lead not found or has been removed.
        </p>
        <button
          onClick={() => navigate("/leads")}
          className="px-4 py-2 rounded-full bg-[#3f8cff] text-white font-medium"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  // If we don't have a transformed lead yet, show loading
  if (!transformedLead) {
    return <LeadDetailsShimmer />;
  }

  return (
    <LeadDetailsFeature
      lead={transformedLead}
      onBack={() => navigate("/leads")}
    />
  );
};

export default LeadDetailsPage;

