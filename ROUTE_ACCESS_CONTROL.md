# Route-Based Access Control System

This document explains how to implement and use the route-based access control system based on user positions and their allowed routes.

## Overview

The system allows you to control access to different routes based on the user's position and the `allowedRoutes` configured for that position in the Position Management page.

## How It Works

1. **Position Configuration**: In the Position Management page (`/settings/company`), you can specify which routes each position can access.

2. **User Assignment**: Users are assigned positions when created or updated.

3. **Route Protection**: Routes are protected using the `RouteAccess` component or the enhanced `WithRoleAccess` component.

4. **Dynamic Navigation**: Navigation menus can be filtered based on user access.

## Components

### 1. RouteAccess Component

A dedicated component for route-based access control:

```jsx
import RouteAccess from "../components/withRoleAccess/RouteAccess";

<Route path="/projects" element={
  <RouteAccess>
    <Projects />
  </RouteAccess>
} />
```

### 2. Enhanced WithRoleAccess Component

Supports both role-based and route-based access:

```jsx
import WithRoleAccess from "../components/withRoleAccess";

// Role-based only
<WithRoleAccess allowedRoles={["company-admin"]}>
  <AdminComponent />
</WithRoleAccess>

// Route-based only
<WithRoleAccess allowedRoutes={true}>
  <ProtectedComponent />
</WithRoleAccess>

// Both role and route-based
<WithRoleAccess allowedRoles={["employee"]} allowedRoutes={true}>
  <EmployeeComponent />
</WithRoleAccess>
```

### 3. useRouteAccess Hook

A custom hook for checking route access programmatically:

```jsx
import { useRouteAccess } from "../hooks/useRouteAccess";

const MyComponent = () => {
  const { 
    hasAccessToRoute, 
    hasAccessToCurrentRoute, 
    getAllowedRoutes,
    canAccessAnyRoute,
    userPosition,
    isPositionActive 
  } = useRouteAccess();

  // Check access to specific route
  const canAccessProjects = hasAccessToRoute("/projects");

  // Check current route access
  const canAccessCurrent = hasAccessToCurrentRoute();

  // Get all allowed routes
  const allowedRoutes = getAllowedRoutes();

  // Check if user can access any of multiple routes
  const canAccessAny = canAccessAnyRoute(["/projects", "/tasks", "/calendar"]);

  return (
    <div>
      {canAccessProjects && <Link to="/projects">Projects</Link>}
      {canAccessCurrent && <p>You can access this page</p>}
    </div>
  );
};
```

## Route Patterns

The system supports various route patterns:

- **Exact match**: `/projects` - Only matches exactly `/projects`
- **Wildcard**: `/projects/*` - Matches `/projects`, `/projects/123`, `/projects/edit`, etc.
- **Global access**: `*` or `/` - Allows access to all routes

### Example Position Configurations

#### Admin Position (Full Access)
```javascript
{
  name: "Admin",
  allowedRoutes: ["*"] // Full access to everything
}
```

#### Project Manager Position
```javascript
{
  name: "Project Manager",
  allowedRoutes: [
    "/",                    // Dashboard
    "/projects",            // Projects list
    "/projects/*",          // All project-related pages
    "/employees",           // Employee management
    "/employees/*",         // Employee details
    "/calender",            // Calendar
    "/vacations",           // Vacation management
    "/messenger",           // Messaging
    "/activity-stream",     // Activity stream
    "/settings",            // Settings
    "/settings/*"           // All settings pages
  ]
}
```

#### Employee Position (Limited Access)
```javascript
{
  name: "Employee",
  allowedRoutes: [
    "/",                    // Dashboard
    "/my-tasks",            // Personal tasks
    "/my-subtasks",         // Personal subtasks
    "/my-projects",         // Assigned projects
    "/today-tasks",         // Today's tasks
    "/today-subtasks",      // Today's subtasks
    "/board",               // Task board
    "/calender",            // Calendar
    "/messenger",           // Messaging
    "/sticky-notes",        // Personal notes
    "/timer",               // Time tracking
    "/notifications",       // Notifications
    "/settings",            // Settings layout
    "/settings/account",    // Personal account settings
    "/settings/notifications" // Personal notification settings
  ]
}
```

#### Designer Position
```javascript
{
  name: "Designer",
  allowedRoutes: [
    "/",                    // Dashboard
    "/projects",            // View projects
    "/projects/*",          // Project details
    "/my-tasks",            // Personal tasks
    "/my-subtasks",         // Personal subtasks
    "/board",               // Task board
    "/calender",            // Calendar
    "/messenger",           // Messaging
    "/sticky-notes",        // Notes
    "/timer",               // Time tracking
    "/notifications",       // Notifications
    "/settings",            // Settings layout
    "/settings/account",    // Personal account settings
    "/settings/notifications" // Personal notification settings
  ]
}
```

## Backend Changes

### Authentication Controller Updates

The `validateSession` and `login` functions now include position details:

```javascript
// Get position details if user has a position
let positionDetails = null;
if (user.position) {
  const Position = require("../models/position");
  positionDetails = await Position.findOne({
    name: user.position,
    companyId: user.company,
    isActive: true
  });
}

// Add position details to user object
const userWithPosition = {
  ...user.toObject(),
  positionDetails: positionDetails ? {
    _id: positionDetails._id,
    name: positionDetails.name,
    allowedRoutes: positionDetails.allowedRoutes,
    isActive: positionDetails.isActive
  } : null
};
```

## Usage Examples

### 1. Protecting Routes in App.jsx

```jsx
// Replace role-based protection with route-based
<Route 
  path="projects" 
  element={
    <RouteAccess>
      <Projects />
    </RouteAccess>
  } 
/>

// Or use enhanced WithRoleAccess
<Route 
  path="admin-only" 
  element={
    <WithRoleAccess allowedRoles={["company-admin"]} allowedRoutes={true}>
      <AdminPanel />
    </WithRoleAccess>
  } 
/>
```

### 2. Conditional Navigation

```jsx
import { useRouteAccess } from "../hooks/useRouteAccess";

const Sidebar = () => {
  const { hasAccessToRoute } = useRouteAccess();

  return (
    <nav>
      {hasAccessToRoute("/projects") && (
        <Link to="/projects">Projects</Link>
      )}
      {hasAccessToRoute("/employees") && (
        <Link to="/employees">Employees</Link>
      )}
      {hasAccessToRoute("/settings/*") && (
        <Link to="/settings">Settings</Link>
      )}
    </nav>
  );
};
```

### 3. Dynamic Menu Generation

```jsx
import NavigationMenu from "../components/shared/NavigationMenu";

const Sidebar = () => {
  const menuItems = [
    { label: "Dashboard", route: "/", icon: <DashboardIcon /> },
    { label: "Projects", route: "/projects", icon: <ProjectIcon /> },
    { label: "Employees", route: "/employees", icon: <EmployeeIcon /> },
    { label: "Settings", route: "/settings", icon: <SettingsIcon /> },
  ];

  return (
    <NavigationMenu 
      menuItems={menuItems}
      onItemClick={(item) => navigate(item.route)}
    />
  );
};
```

### 4. Position Access Information

```jsx
import PositionAccessInfo from "../components/settings/PositionAccessInfo";

const SettingsPage = () => {
  return (
    <div>
      <PositionAccessInfo />
      {/* Other settings content */}
    </div>
  );
};
```

### 5. Sidebar Integration

The sidebar automatically filters menu items based on the user's position:

```jsx
// The sidebar component automatically uses route-based filtering
import Sidebar from "../components/sidebar";

// No additional configuration needed - it works automatically!
```

**Features:**
- ✅ Automatically hides inaccessible menu items
- ✅ Shows debug information in development mode
- ✅ Maintains backward compatibility with role-based access
- ✅ Provides fallback message when no items are accessible

### 6. Nested Routes Protection

For nested routes like settings pages, each route needs individual protection:

```jsx
<Route path="settings" element={<RouteAccess><SettingsLayout /></RouteAccess>}>
  <Route index element={<Navigate to="account" replace />} />
  <Route path="account" element={<RouteAccess><Account /></RouteAccess>} />
  <Route path="company" element={<RouteAccess><Company /></RouteAccess>} />
  <Route path="notifications" element={<RouteAccess><Notification /></RouteAccess>} />
  <Route path="safety" element={<RouteAccess><Safety /></RouteAccess>} />
</Route>
```

**Features:**
- ✅ Parent and child routes are individually protected
- ✅ Settings menu automatically filters based on access
- ✅ Redirects to unauthorized if no settings are accessible
- ✅ Default redirect to first accessible setting

## Best Practices

1. **Always check position status**: Ensure the position is active before granting access.

2. **Use wildcards carefully**: `*` grants full access, use specific routes when possible.

3. **Combine with role-based access**: Use both role and route-based access for maximum security.

4. **Provide fallback paths**: Always specify a fallback path for unauthorized access.

5. **Cache position details**: The system automatically includes position details in user sessions.

## Troubleshooting

### Common Issues

1. **User has no position**: Users without positions will be denied access to route-protected pages.

2. **Position is inactive**: Inactive positions will be denied access.

3. **Route not in allowedRoutes**: Users can only access routes explicitly listed in their position's allowedRoutes.

### Debugging

Use the `PositionAccessInfo` component to see the current user's access permissions:

```jsx
<PositionAccessInfo />
```

This will show:
- Current position
- Position status (active/inactive)
- All allowed routes
- Current page access status

## Migration Guide

To migrate from role-based to route-based access:

1. **Update route protection**: Replace `WithRoleAccess` with `RouteAccess` where appropriate.

2. **Configure positions**: Set up positions with appropriate `allowedRoutes` in the Position Management page.

3. **Assign positions**: Ensure all users have appropriate positions assigned.

4. **Test thoroughly**: Verify that users can only access their allowed routes. 