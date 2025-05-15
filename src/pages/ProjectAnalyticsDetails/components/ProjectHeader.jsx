import Header from "../../../components/shared/header";
import { useDeleteProject } from "../../../api/hooks";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ProjectHeader = ({ project }) => {
  const navigate = useNavigate();
  const deleteProjectMutation = useDeleteProject(() => {
    toast.success("Project deleted successfully");
    navigate("/projects-analytics");
  });

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      try {
        await deleteProjectMutation.mutateAsync(project._id);
      } catch (error) {
        toast.error(error.message || "Failed to delete project");
      }
    }
  };

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
          <div className="flex items-center space-x-2">
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
            <button
              onClick={handleDelete}
              disabled={deleteProjectMutation.isLoading}
              className="ml-4 px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteProjectMutation.isLoading
                ? "Deleting..."
                : "Delete Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
