import { useNavigate } from "react-router-dom";
import LeadsFeature from "../../features/leads";

const LeadsPage = () => {
  const navigate = useNavigate();

  return (
    <LeadsFeature
      onSelectLead={(lead) => {
        const leadId = lead._id || lead.id;
        if (leadId) {
          navigate(`/leads/${leadId}`, { state: lead });
        }
      }}
      onOpenSettings={() => navigate("/leads/settings")}
    />
  );
};

export default LeadsPage;
