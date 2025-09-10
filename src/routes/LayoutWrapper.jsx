import { Suspense } from "react";
import DashboardLayout from "../layouts/dashboard";
import AuthLayout from "../layouts/auth";
import SettingsLayout from "../layouts/settings";
import WelcomeLayout from "../layouts/welcome";
import ProjectDetailLayout from "../layouts/projectDetail";
import TaskDetailLayout from "../layouts/taskDetail";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="h-screen w-full flexCenter">
    <img src="/icons/loading.svg" alt="Loading..." />
  </div>
);

// Layout mapping
const layoutComponents = {
  dashboard: DashboardLayout,
  auth: AuthLayout,
  settings: SettingsLayout,
  welcome: WelcomeLayout,
  projectDetail: ProjectDetailLayout,
  taskDetail: TaskDetailLayout,
};

const LayoutWrapper = ({
  children,
  layout = "dashboard",
  fallback = <LoadingSpinner />,
}) => {
  const LayoutComponent = layoutComponents[layout];

  if (!LayoutComponent) {
    console.warn(
      `Layout '${layout}' not found. Using default dashboard layout.`
    );
    return (
      <Suspense fallback={fallback}>
        <DashboardLayout>{children}</DashboardLayout>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={fallback}>
      <LayoutComponent>{children}</LayoutComponent>
    </Suspense>
  );
};

export default LayoutWrapper;
