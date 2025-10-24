import React from "react";
import { usePermissions } from "../hooks/usePermissions";
import { FiLock } from "react-icons/fi";

/**
 * Component that shows/hides content based on permissions
 * @param {Object} props
 * @param {string} props.category - Permission category (e.g., 'tasks')
 * @param {string} props.action - Permission action (e.g., 'create')
 * @param {ReactNode} props.children - Content to show if permission granted
 * @param {ReactNode} props.fallback - Optional content to show if no permission
 * @returns {ReactElement}
 */
export const PermissionGuard = ({
  category,
  action,
  children,
  fallback = null,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(category, action)) {
    return fallback;
  }

  return <>{children}</>;
};

/**
 * Component that shows/hides content if user has ANY of the permissions
 */
export const AnyPermissionGuard = ({
  category,
  actions,
  children,
  fallback = null,
}) => {
  const { hasAnyPermission } = usePermissions();

  if (!hasAnyPermission(category, actions)) {
    return fallback;
  }

  return <>{children}</>;
};

/**
 * Component that shows/hides content if user has ALL of the permissions
 */
export const AllPermissionsGuard = ({
  category,
  actions,
  children,
  fallback = null,
}) => {
  const { hasAllPermissions } = usePermissions();

  if (!hasAllPermissions(category, actions)) {
    return fallback;
  }

  return <>{children}</>;
};

/**
 * Component that disables button based on permissions
 */
export const PermissionButton = ({
  category,
  action,
  children,
  onClick,
  className = "",
  showLockedMessage = true,
  ...props
}) => {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(category, action);

  return (
    <button
      onClick={allowed ? onClick : undefined}
      disabled={!allowed}
      className={`${className} ${
        !allowed ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title={
        !allowed && showLockedMessage
          ? `Requires ${action} permission for ${category}`
          : ""
      }
      {...props}
    >
      {!allowed && showLockedMessage && <FiLock className="inline mr-2" />}
      {children}
    </button>
  );
};

/**
 * Admin-only guard
 */
export const AdminGuard = ({ children, fallback = null }) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin()) {
    return fallback;
  }

  return <>{children}</>;
};
