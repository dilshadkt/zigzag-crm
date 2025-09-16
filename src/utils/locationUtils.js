// Location utility functions for attendance tracking

/**
 * Reverse geocoding using OpenStreetMap Nominatim API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {boolean} detailed - Whether to return detailed location object or just address string
 * @returns {Promise<string|Object>} Formatted address string or detailed location object
 */
export const reverseGeocode = async (latitude, longitude, detailed = false) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&extratags=1&namedetails=1`,
      {
        headers: {
          "User-Agent": "Dooura-CRM/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      if (detailed) {
        // Return detailed location object
        return {
          // Basic info
          displayName: data.display_name,
          placeId: data.place_id,
          osmType: data.osm_type,
          osmId: data.osm_id,

          // Coordinates
          latitude: parseFloat(data.lat),
          longitude: parseFloat(data.lon),

          // Detailed address components
          address: {
            // Building/Property details
            houseNumber: data.address?.house_number || null,
            houseName: data.address?.house_name || null,
            building: data.address?.building || null,
            shop: data.address?.shop || null,
            amenity: data.address?.amenity || null,

            // Street details
            road: data.address?.road || null,
            footway: data.address?.footway || null,
            pedestrian: data.address?.pedestrian || null,
            cycleway: data.address?.cycleway || null,

            // Area details
            neighbourhood: data.address?.neighbourhood || null,
            suburb: data.address?.suburb || null,
            cityDistrict: data.address?.city_district || null,
            district: data.address?.district || null,
            borough: data.address?.borough || null,

            // Administrative areas
            city:
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              null,
            county: data.address?.county || null,
            state: data.address?.state || data.address?.province || null,
            region: data.address?.region || null,
            postcode: data.address?.postcode || null,
            country: data.address?.country || null,
            countryCode: data.address?.country_code?.toUpperCase() || null,

            // Additional details
            continent: data.address?.continent || null,
            ocean: data.address?.ocean || null,
            sea: data.address?.sea || null,
            island: data.address?.island || null,

            // Landmark details
            railway: data.address?.railway || null,
            aeroway: data.address?.aeroway || null,
            military: data.address?.military || null,
            tourism: data.address?.tourism || null,
            leisure: data.address?.leisure || null,
            historic: data.address?.historic || null,
            natural: data.address?.natural || null,
            waterway: data.address?.waterway || null,
          },

          // Additional metadata
          boundingBox: data.boundingbox
            ? {
                north: parseFloat(data.boundingbox[1]),
                south: parseFloat(data.boundingbox[0]),
                east: parseFloat(data.boundingbox[3]),
                west: parseFloat(data.boundingbox[2]),
              }
            : null,

          // Extra tags for more context
          extraTags: data.extratags || {},

          // Named details
          namedDetails: data.namedetails || {},

          // Formatted addresses
          formattedAddresses: {
            short: formatShortAddress(data.address),
            medium: formatMediumAddress(data.address),
            long: data.display_name,
            components: formatAddressComponents(data.address),
          },
        };
      } else {
        // Return just the formatted address string (backward compatibility)
        return formatShortAddress(data.address) || data.display_name;
      }
    }

    return detailed ? null : "Address not found";
  } catch (error) {
    console.warn("Reverse geocoding failed:", error.message);
    return detailed ? null : "Address lookup failed";
  }
};

/**
 * Format a short, readable address
 * @param {Object} address - Address object from Nominatim
 * @returns {string} Short formatted address
 */
const formatShortAddress = (address) => {
  if (!address) return null;

  const { house_number, road, suburb, city, state, country } = address;
  const parts = [house_number, road, suburb, city, state].filter(Boolean);

  if (parts.length > 0) {
    return `${parts.join(", ")}, ${country || ""}`.trim().replace(/,$/, "");
  }

  return null;
};

/**
 * Format a medium-length address
 * @param {Object} address - Address object from Nominatim
 * @returns {string} Medium formatted address
 */
const formatMediumAddress = (address) => {
  if (!address) return null;

  const {
    house_number,
    road,
    neighbourhood,
    suburb,
    city,
    state,
    postcode,
    country,
  } = address;

  const parts = [
    house_number,
    road,
    neighbourhood,
    suburb,
    city,
    state,
    postcode,
  ].filter(Boolean);

  return `${parts.join(", ")}, ${country || ""}`.trim().replace(/,$/, "");
};

/**
 * Format address components for easy access
 * @param {Object} address - Address object from Nominatim
 * @returns {Object} Formatted address components
 */
const formatAddressComponents = (address) => {
  if (!address) return {};

  return {
    street: [address.house_number, address.road].filter(Boolean).join(" "),
    area: address.suburb || address.neighbourhood || address.city_district,
    city: address.city || address.town || address.village,
    state: address.state || address.province,
    country: address.country,
    postcode: address.postcode,
    landmark:
      address.amenity || address.shop || address.building || address.tourism,
  };
};

/**
 * Get user's current location with reverse geocoding
 * @returns {Promise<Object>} Location object with latitude, longitude, and address
 */
export const getUserLocation = async () => {
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
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Get the actual address using reverse geocoding
        const address = await reverseGeocode(latitude, longitude);

        resolve({
          latitude,
          longitude,
          address,
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
 * Get detailed location information from coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object|null>} Detailed location object or null if failed
 */
export const getDetailedLocation = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    return null;
  }

  try {
    const detailedLocation = await reverseGeocode(latitude, longitude, true);
    return detailedLocation;
  } catch (error) {
    console.warn("Failed to get detailed location:", error);
    return null;
  }
};

/**
 * Get address from coordinates for existing attendance records
 * This is useful for records that have coordinates but "Current Location" as address
 * @param {Object} location - Location object with latitude and longitude
 * @param {boolean} detailed - Whether to return detailed location object
 * @returns {Promise<string|Object>} Formatted address string or detailed location object
 */
export const getAddressFromCoordinates = async (location, detailed = false) => {
  if (!location || !location.latitude || !location.longitude) {
    return detailed ? null : "No location data";
  }

  // If we already have a proper address (not "Current Location"), return it
  if (location.address && location.address !== "Current Location") {
    if (detailed) {
      // If detailed is requested but we only have a string address,
      // we can still return a basic structure
      return {
        displayName: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        address: { formatted: location.address },
        formattedAddresses: {
          short: location.address,
          medium: location.address,
          long: location.address,
        },
      };
    }
    return location.address;
  }

  // Otherwise, perform reverse geocoding
  try {
    const result = await reverseGeocode(
      location.latitude,
      location.longitude,
      detailed
    );
    return result;
  } catch (error) {
    console.warn("Failed to get address from coordinates:", error);
    return detailed ? null : "Address lookup failed";
  }
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
