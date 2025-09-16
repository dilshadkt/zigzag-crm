import React, { useState, useEffect } from "react";
import { getDetailedLocation } from "../utils/locationUtils";

/**
 * LocationModal Component
 * Displays detailed location information in a modal overlay
 */
const LocationModal = ({ isOpen, onClose, latitude, longitude }) => {
  const [locationDetails, setLocationDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!isOpen || !latitude || !longitude) return;

      setIsLoading(true);
      setError(null);

      try {
        const details = await getDetailedLocation(latitude, longitude);
        setLocationDetails(details);
      } catch (err) {
        setError("Failed to fetch location details");
        console.error("Location details error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationDetails();
  }, [isOpen, latitude, longitude]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Location Details
                </h2>
                <p className="text-xs text-gray-500">Location information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading location details...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">
                  Failed to load location details
                </p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : locationDetails ? (
              <div className="space-y-4">
                {/* Main Address */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    Address
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900 font-medium">
                      {locationDetails.formattedAddresses?.long ||
                        locationDetails.displayName}
                    </p>
                  </div>
                </div>

                {/* Address Components Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Street Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Street Details
                    </h4>
                    <div className="space-y-2">
                      {locationDetails.address?.houseNumber && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">House Number:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.houseNumber}
                          </span>
                        </div>
                      )}
                      {locationDetails.address?.road && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Road:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.road}
                          </span>
                        </div>
                      )}
                      {locationDetails.address?.building && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Building:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.building}
                          </span>
                        </div>
                      )}
                      {locationDetails.address?.houseName && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">House Name:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.houseName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Area Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Area Details
                    </h4>
                    <div className="space-y-2">
                      {locationDetails.address?.suburb && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Suburb:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.suburb}
                          </span>
                        </div>
                      )}
                      {locationDetails.address?.neighbourhood && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Neighbourhood:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.neighbourhood}
                          </span>
                        </div>
                      )}
                      {locationDetails.address?.city && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">City:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.city}
                          </span>
                        </div>
                      )}
                      {locationDetails.address?.district && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">District:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.district}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Administrative Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Administrative
                    </h4>
                    <div className="space-y-2">
                      {locationDetails.address?.state && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">State:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.state}
                          </span>
                        </div>
                      )}
                      {locationDetails.address?.county && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">County:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.county}
                          </span>
                        </div>
                      )}
                      {locationDetails.address?.country && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Country:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.country}
                          </span>
                        </div>
                      )}
                      {locationDetails.address?.postcode && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Postcode:</span>
                          <span className="text-gray-900 font-medium">
                            {locationDetails.address.postcode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Coordinates
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Latitude:</span>
                        <span className="text-gray-900 font-mono text-sm">
                          {locationDetails.latitude?.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Longitude:</span>
                        <span className="text-gray-900 font-mono text-sm">
                          {locationDetails.longitude?.toFixed(6)}
                        </span>
                      </div>
                      {locationDetails.placeId && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Place ID:</span>
                          <span className="text-gray-900 font-mono text-sm">
                            {locationDetails.placeId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Landmarks and Amenities */}
                {(locationDetails.address?.amenity ||
                  locationDetails.address?.shop ||
                  locationDetails.address?.tourism ||
                  locationDetails.address?.leisure) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Nearby Landmarks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {locationDetails.address?.amenity && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          {locationDetails.address.amenity}
                        </span>
                      )}
                      {locationDetails.address?.shop && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          {locationDetails.address.shop}
                        </span>
                      )}
                      {locationDetails.address?.tourism && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          {locationDetails.address.tourism}
                        </span>
                      )}
                      {locationDetails.address?.leisure && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2z"
                            />
                          </svg>
                          {locationDetails.address.leisure}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {locationDetails.osmType && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">OSM Type:</span>
                        <span className="ml-2 text-gray-900 font-mono">
                          {locationDetails.osmType}
                        </span>
                      </div>
                      {locationDetails.osmId && (
                        <div>
                          <span className="text-gray-600">OSM ID:</span>
                          <span className="ml-2 text-gray-900 font-mono">
                            {locationDetails.osmId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No location details available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
