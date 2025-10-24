import { useMemo } from "react";
import { useAuth } from "./useAuth";

/**
 * Custom hook for checking user permissions
 * @returns {Object} Permission checking utilities
 */
export const usePermissions = () => {
  const { user } = useAuth();

  // Memoize the permission object
  const userPermissions = useMemo(() => {
    return user?.positionDetails?.permissions || {};
  }, [user?.positionDetails?.permissions]);

  /**
   * Check if user has a specific permission
   * @param {string} category - Permission category (e.g., 'tasks', 'projects')
   * @param {string} action - Permission action (e.g., 'create', 'edit', 'delete')
   * @returns {boolean} True if user has the permission
   */
  const hasPermission = (category, action) => {
    // Company admins have all permissions
    if (user?.role === "company-admin") {
      return true;
    }

    return userPermissions[category]?.[action] || false;
  };

  /**
   * Check if user has ANY of the specified permissions
   * @param {string} category - Permission category
   * @param {Array<string>} actions - Array of actions to check
   * @returns {boolean} True if user has at least one permission
   */
  const hasAnyPermission = (category, actions) => {
    if (user?.role === "company-admin") {
      return true;
    }

    return actions.some((action) => hasPermission(category, action));
  };

  /**
   * Check if user has ALL of the specified permissions
   * @param {string} category - Permission category
   * @param {Array<string>} actions - Array of actions to check
   * @returns {boolean} True if user has all permissions
   */
  const hasAllPermissions = (category, actions) => {
    if (user?.role === "company-admin") {
      return true;
    }

    return actions.every((action) => hasPermission(category, action));
  };

  /**
   * Get all permissions for a specific category
   * @param {string} category - Permission category
   * @returns {Object} All permissions for the category
   */
  const getCategoryPermissions = (category) => {
    if (user?.role === "company-admin") {
      // Return all permissions as true for admin
      return Object.fromEntries(
        Object.keys(userPermissions[category] || {}).map((key) => [key, true])
      );
    }

    return userPermissions[category] || {};
  };

  /**
   * Check if user is admin
   * @returns {boolean} True if user is company admin
   */
  const isAdmin = () => {
    return user?.role === "company-admin";
  };

  /**
   * Get position name
   * @returns {string} Position name or empty string
   */
  const getPositionName = () => {
    return user?.position?.name || "";
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getCategoryPermissions,
    isAdmin,
    getPositionName,
    userPermissions,
  };
};
