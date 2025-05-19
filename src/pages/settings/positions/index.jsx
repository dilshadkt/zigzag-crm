import React, { useState } from "react";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useGetPositions } from "../../../api/hooks";
import AddPosition from "../../../components/settings/positions/addPosition";

const Positions = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { data: positions, isLoading } = useGetPositions();

  const handleEdit = (position) => {
    setSelectedPosition(position);
    setShowAddModal(true);
  };

  const handleClose = () => {
    setShowAddModal(false);
    setSelectedPosition(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Position Management</h2>
        <PrimaryButton
          title="Add New Position"
          onClick={() => setShowAddModal(true)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <img src="/icons/loading.svg" alt="Loading" className="w-12" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-1 text-left text-xs
                   font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Position Name
                  </th>
                  <th
                    className="px-6 py-1 text-left text-xs
                   font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Allowed Routes
                  </th>
                  <th
                    className="px-6 py-1 text-left text-xs
                   font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions?.map((position) => (
                  <tr key={position._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {position.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {position.allowedRoutes.map((route) => (
                          <span
                            key={route}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {route}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(position)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
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
        />
      )}
    </div>
  );
};

export default Positions;
