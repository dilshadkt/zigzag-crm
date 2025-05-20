import { useNavigate } from "react-router-dom";

const TeamTab = ({ project }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-4 sm:px-6">
        <h3 className="text-base font-medium leading-6 text-gray-900">
          Team Members
        </h3>
        <p className="mt-1 max-w-2xl text-xs text-gray-500">
          People working on this project.
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {project?.teams?.map((member) => (
            <li
              onClick={() => navigate(`/employees/${member._id}`)}
              key={member._id}
              className="px-4 py-3 sm:px-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={member.profileImage || "/api/placeholder/48/48"}
                    alt={member.firstName}
                  />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {member.firstName}
                  </div>
                  <div className="text-xs text-gray-500">{member.position}</div>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {member.position}
                  </span>
                </div>
              </div>
            </li>
          ))}
          {(!project?.teams || project.teams.length === 0) && (
            <li className="px-4 py-3 sm:px-6 text-center text-xs text-gray-500">
              No team members assigned to this project.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TeamTab;
