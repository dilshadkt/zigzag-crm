# Performance Optimization: Code Splitting in CRM

This document explains how **Code Splitting** improves the performance of the Zigzag CRM application.

## What is Code Splitting?

By default, build tools like Vite or Webpack bundle all JavaScript files into a single, large file (the "main bundle"). This bundle must be fully downloaded and parsed by the browser before the user can see or interact with the application.

**Code Splitting** allows us to split this large bundle into smaller, manageable chunks. Instead of downloading the entire application at once, the browser only downloads the code necessary for the current page.

## How it improves performance

### 1. Faster Initial Load Time (FCP & LCP)
- **Problem**: A 5MB bundle takes a long time to download on slow connections.
- **Solution**: With code splitting, the initial bundle might drop to 500KB. The browser reaches **First Contentful Paint (FCP)** and **Largest Contentful Paint (LCP)** much faster.

### 2. Reduced JavaScript Execution Time
- Browsers need time to parse and compile JavaScript.
- Loading only the code for the "Dashboard" means the browser doesn't waste resources parsing the "Settings" or "Messenger" code until those pages are actually visited.

### 3. Better Caching
- When we update a single page (e.g., `Messenger.jsx`), only the chunk for that page changes.
- Users who have already visited the site can keep using their cached versions of other chunks (like `Dashboard` or `Account`), leading to faster subsequent visits.

### 4. Optimized Resource Prioritization
- By using `React.lazy` and `Suspense`, we can provide a smooth transition with a loading indicator while the next piece of code is being fetched in the background.

## Implementation Details

We use **React.lazy** for dynamic imports and **Suspense** to handle the loading state:

```javascript
// Dynamic Import
const Dashboard = React.lazy(() => import("../pages/dashboard"));

// Usage in Routes
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

## Advanced Optimization Strategies (Implemented)

### 1. Network Caching (TanStack Query)
We have optimized how data is fetched from the server. By default, React Query marks data as "stale" immediately, causing a refetch every time a component mounts.
- **Implemented**: We set a global `staleTime` of 2 minutes. This means if you switch between the Dashboard and Projects within 2 minutes, the application will use the cached data instead of making a new API call.
- **Benefit**: Reduced server load and instant page transitions for the user.

### 2. Component Memoization
In large lists (like the Task Board or Employee List), React can sometimes re-render items unnecessarily.
- **Implemented**: Wrapped key components like `Task`, `TaskCard`, `LeadRow`, and `EmployeeCard` in `React.memo()`.
- **Benefit**: Prevents redundant re-renders when parent components update but item data remains the same.

### 3. Image Optimization
The CRM handles many user avatars and project attachments.
- **Implemented**: Added native `loading="lazy"` attribute to all key images (avatars, thumbnails, attachments).
- **Benefit**: Faster page loads as images are only downloaded when they enter the viewport.

### 4. List Virtualization
When displaying hundreds of leads or tasks, rendering them all in the DOM can slow down the browser.
- **Implemented**: Used `@tanstack/react-virtual` in:
  - `LeadsTable` (Main Leads list)
  - `ProjectList` (Project Details tasks)
  - `Droppable` (Task Board columns)
  - `TaskList` (General task lists)
- **Benefit**: Handles thousands of items with zero lag by only rendering what's visible.

### 5. Dependency Management
- **Lodash**: Modular imports used (e.g., `import debounce from 'lodash/debounce'`).
- **Icons**: Tree-shaking friendly imports from `react-icons`.
