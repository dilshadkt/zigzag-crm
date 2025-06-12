// Location utility functions for attendance tracking

/**
 * Get user's current location
 * @returns {Promise<Object>} Location object with latitude, longitude, and address
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      resolve({
        latitude: null,
        longitude: null,
        address: "Geolocation not supported",
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000, // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: "Current Location", // You can enhance this with reverse geocoding
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn("Location access denied or failed:", error.message);

        // Provide fallback based on error type
        let fallbackMessage = "Location not available";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            fallbackMessage = "Location access denied";
            break;
          case error.POSITION_UNAVAILABLE:
            fallbackMessage = "Location unavailable";
            break;
          case error.TIMEOUT:
            fallbackMessage = "Location request timeout";
            break;
          default:
            fallbackMessage = "Unknown location error";
        }

        resolve({
          latitude: null,
          longitude: null,
          address: fallbackMessage,
          accuracy: null,
        });
      },
      options
    );
  });
};

/**
 * Get device information for attendance tracking
 * @returns {Object} Device information object
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let browser = "Unknown";
  let os = navigator.platform || "Unknown";

  // Detect browser
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  else if (userAgent.includes("Opera")) browser = "Opera";

  // Detect OS more accurately
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
    os = "iOS";

  return {
    browser,
    os,
    device: "Web",
    userAgent,
    screen: {
      width: screen.width,
      height: screen.height,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Format location for display
 * @param {Object} location - Location object
 * @returns {string} Formatted location string
 */
export const formatLocation = (location) => {
  if (!location) return "No location data";

  if (location.latitude && location.longitude) {
    return `${
      location.address || "Unknown Address"
    } (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`;
  }

  return location.address || "Location not available";
};

/**
 * Check if location permissions are granted
 * @returns {Promise<string>} Permission state
 */
export const checkLocationPermission = async () => {
  if (!navigator.permissions) {
    return "unknown";
  }

  try {
    const permission = await navigator.permissions.query({
      name: "geolocation",
    });
    return permission.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    console.warn("Could not check location permission:", error);
    return "unknown";
  }
};

/**
 * Request location permission
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestLocationPermission = async () => {
  try {
    const location = await getUserLocation();
    return location.latitude !== null && location.longitude !== null;
  } catch (error) {
    console.error("Failed to request location permission:", error);
    return false;
  }
};
