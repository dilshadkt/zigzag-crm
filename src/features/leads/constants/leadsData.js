export const LEAD_STATUS = {
  LEAD: "Lead",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const baseDetail = {
  contact: {
    name: "Dilshad",
    email: "dilshad@example.com",
    phone: "+1 (555) 123-4567",
    company: "Tech Solutions Inc.",
  },
  leadDetails: {
    status: LEAD_STATUS.ACTIVE,
    source: "Website",
    created: "Jan 15, 2024",
    owner: "John Doe",
  },
  aiSuggestions: {
    conversationCoach: {
      sentiment: "Customer shows budget concerns",
      recommendations: [
        "Suggest flexible payment options",
        "Share ROI calculator",
        "Avoid pushing premium features",
      ],
    },
    dealStage: {
      stage: "Proposal Review",
      steps: [
        "Send comparison vs. competitors",
        "Schedule executive demo",
        "Prepare for complexity objections",
      ],
    },
  },
  timeline: [
    {
      label: "Lead Created",
      date: "Jan 15, 2024 at 10:30 AM",
      color: "bg-blue-500",
    },
    {
      label: "First Contact Made",
      date: "Jan 16, 2024 at 2:15 PM",
      color: "bg-emerald-500",
    },
    {
      label: "Proposal Sent",
      date: "Jan 18, 2024 at 9:45 AM",
      color: "bg-amber-400",
    },
  ],
  notes: [
    {
      text: "Initial contact made. Customer showed interest in our premium package.",
      author: "John Doe",
      date: "Jan 16, 2024",
    },
    {
      text: "Follow-up call scheduled for next week. Customer requested pricing details.",
      author: "John Doe",
      date: "Jan 18, 2024",
    },
  ],
  attachments: [
    {
      name: "Proposal_Document.pdf",
      size: "2.5 MB",
      date: "Jan 18, 2024",
      type: "PDF",
    },
    {
      name: "Contract_Template.docx",
      size: "1.2 MB",
      date: "Jan 15, 2024",
      type: "DOC",
    },
  ],
  emails: [
    {
      title: "Welcome Email",
      subject: "Welcome to our platform!",
      status: "Sent",
      date: "Jan 15, 2024",
    },
    {
      title: "Follow-up Email",
      subject: "Your proposal is ready",
      status: "Sent",
      date: "Jan 18, 2024",
    },
  ],
  activity: [
    {
      title: "Email sent to dilshad@example.com",
      date: "Jan 18, 2024 at 9:45 AM",
      type: "email",
    },
    {
      title: "Phone call - 15 minutes",
      date: "Jan 16, 2024 at 2:15 PM",
      type: "call",
    },
    {
      title: "Note added",
      date: "Jan 15, 2024 at 10:30 AM",
      type: "note",
    },
    {
      title: "Attachment uploaded",
      date: "Jan 14, 2024 at 3:20 PM",
      type: "attachment",
    },
    {
      title: "Lead assigned to John Doe",
      date: "Jan 13, 2024 at 11:30 AM",
      type: "assignment",
    },
  ],
};

const withDetail = (lead) => {
  const contact = {
    ...baseDetail.contact,
    name: lead.payer,
    email: lead.email || baseDetail.contact.email,
    phone: lead.phone || baseDetail.contact.phone,
  };

  return {
    ...lead,
    details: {
      ...baseDetail,
      contact,
      leadDetails: {
        ...baseDetail.leadDetails,
        status: lead.status,
        created: lead.createdOn.split(", ").slice(0, 2).join(", "),
      },
    },
  };
};

export const LEADS_DATA = [
  withDetail({
    id: 1,
    createdOn: "Sun, 07 Jan 2024 2:42 PM",
    payer: "Dilshad",
    status: LEAD_STATUS.ACTIVE,
    phone: "+1 (555) 123-4567",
    email: "dilshad@example.com",
    services: "Consulting",
    scheduled: "Sun, 07 Jan 2024 2:42 PM",
  }),
  withDetail({
    id: 2,
    createdOn: "Mon, 08 Jan 2024 3:15 PM",
    payer: "Higgins Q. Malthus",
    status: LEAD_STATUS.ACTIVE,
    phone: "+91 +966559186877",
    email: "higgins@example.com",
    services: "Implementation",
    scheduled: "Mon, 08 Jan 2024 4:15 PM",
  }),
  withDetail({
    id: 3,
    createdOn: "Tue, 09 Jan 2024 4:00 PM",
    payer: "Thomas Magnum",
    status: LEAD_STATUS.INACTIVE,
    phone: "+91 +966559186878",
    email: "thomas@example.com",
    services: "Support",
    scheduled: "Tue, 09 Jan 2024 5:00 PM",
  }),
  withDetail({
    id: 4,
    createdOn: "Wed, 10 Jan 2024 9:00 AM",
    payer: "Rick Wright",
    status: LEAD_STATUS.LEAD,
    phone: "+91 +966559186879",
    email: "rick@example.com",
    services: "Consulting",
    scheduled: "Wed, 10 Jan 2024 10:00 AM",
  }),
  withDetail({
    id: 5,
    createdOn: "Thu, 11 Jan 2024 10:30 AM",
    payer: "Orville Wilbur Wright",
    status: LEAD_STATUS.ACTIVE,
    phone: "+91 +966559186880",
    email: "orville@example.com",
    services: "Integration",
    scheduled: "Thu, 11 Jan 2024 11:30 AM",
  }),
  withDetail({
    id: 6,
    createdOn: "Fri, 12 Jan 2024 11:00 AM",
    payer: "Abe Froman",
    status: LEAD_STATUS.INACTIVE,
    phone: "+91 +966559186881",
    email: "abe@example.com",
    services: "Pilot",
    scheduled: "Fri, 12 Jan 2024 12:00 PM",
  }),
  withDetail({
    id: 7,
    createdOn: "Sat, 13 Jan 2024 1:30 PM",
    payer: "Ferris Bueller",
    status: LEAD_STATUS.LEAD,
    phone: "+91 +966559186882",
    email: "ferris@example.com",
    services: "Consulting",
    scheduled: "Sat, 13 Jan 2024 2:30 PM",
  }),
  withDetail({
    id: 8,
    createdOn: "Sun, 14 Jan 2024 2:00 PM",
    payer: "Cameron Frye",
    status: LEAD_STATUS.ACTIVE,
    phone: "+91 +966559186883",
    email: "cameron@example.com",
    services: "Success Plan",
    scheduled: "Sun, 14 Jan 2024 3:00 PM",
  }),
];
