import Header from "../../../components/shared/header";

const ProjectHeader = ({ project }) => {
  return (
    <div className="bg-white rounded-t-4xl">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={project?.thumbImg || "/api/placeholder/48/48"}
              alt={project?.name}
              className="h-10 w-10 rounded-lg mr-3"
            />
            <div>
              <Header className="text-lg font-bold text-gray-900">
                {project?.name}
              </Header>
              <p className="text-xs text-gray-500">{project?.description}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium 
              ${
                project?.status === "planning"
                  ? "bg-blue-100 text-blue-800"
                  : project?.status === "in-progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : project?.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : project?.status === "paused"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {project?.status?.charAt(0).toUpperCase() +
                project?.status?.slice(1)}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium 
              ${
                project?.priority === "high"
                  ? "bg-red-100 text-red-800"
                  : project?.priority === "medium"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {project?.priority?.charAt(0).toUpperCase() +
                project?.priority?.slice(1)}{" "}
              Priority
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
