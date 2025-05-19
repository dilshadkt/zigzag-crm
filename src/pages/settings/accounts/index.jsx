import React, { useState } from "react";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import {
  useGetPositions,
  useDeletePosition,
  useRestorePosition,
} from "../../../api/hooks";
import AddPosition from "../../../components/settings/positions/addPosition";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";

const Account = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { user } = useAuth();
  const companyId = user?.company;

  const { data: positions, isLoading } = useGetPositions(companyId);
  const { mutate: deletePosition } = useDeletePosition(companyId);
  const { mutate: restorePosition } = useRestorePosition(companyId);

  const handleEdit = (position) => {
    setSelectedPosition(position);
    setShowAddModal(true);
  };

  const handleDelete = (position) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      deletePosition(position._id, {
        onSuccess: () => {
          toast.success("Position deleted successfully");
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Error deleting position"
          );
        },
      });
    }
  };

  const handleRestore = (position) => {
    restorePosition(position._id, {
      onSuccess: () => {
        toast.success("Position restored successfully");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Error restoring position"
        );
      },
    });
  };

  const handleClose = () => {
    setShowAddModal(false);
    setSelectedPosition(null);
  };

  const isDefaultPosition = (name) => {
    const defaultPositions = [
      "Admin",
      "Project Manager",
      "Team Lead",
      "Employee",
      "Designer",
      "Developer",
    ];
    return defaultPositions.includes(name);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex  justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Position Management
        </h2>
        <PrimaryButton
          title="Add New Position"
          onclick={() => setShowAddModal(true)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <img src="/icons/loading.svg" alt="Loading" className="w-12" />
        </div>
      ) : (
        <div className="bg-white h-full overflow-y-auto rounded-lg border border-gray-200">
          <div className="overflow-x-auto relative">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allowed Routes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white h-full divide-y divide-gray-200">
                {positions?.positions?.map((position) => (
                  <tr key={position._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {position.name}
                          {isDefaultPosition(position.name) && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {position.allowedRoutes.map((route) => (
                          <span
                            key={route}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            {route}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          position.isActive
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                      >
                        {position.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEdit(position)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Edit
                        </button>
                        {position.isActive ? (
                          <button
                            onClick={() => handleDelete(position)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(position)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddPosition
          isOpen={showAddModal}
          setShowModal={handleClose}
          initialValues={selectedPosition}
          companyId={companyId}
        />
      )}
    </div>
  );
};

export default Account;
