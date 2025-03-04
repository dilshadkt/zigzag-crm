import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 p-6">
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v2m0 0v2m0-2h2m-2 0H9m9 4a5 5 0 11-10 0 5 5 0 0110 0zm-3-4a5 5 0 11-10 0 5 5 0 0110 0z"
              />
            </svg>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 text-center mb-6">
            You don't have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>

          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-1">
                Why am I seeing this?
              </h3>
              <p className="text-sm text-gray-600">
                This area requires higher permission levels than your current
                role provides.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={goBack}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Go Back
              </button>
              <button
                onClick={goHome}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            If you need assistance, please contact the support team at{" "}
            <span className="font-medium">support@example.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
