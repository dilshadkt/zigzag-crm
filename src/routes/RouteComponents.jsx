import { lazy } from "react";

// Dashboard & Main Pages
export const Dashboard = lazy(() => import("../pages/dashboard"));
export const Projects = lazy(() => import("../pages/projects"));
export const ProjectDetails = lazy(() => import("../pages/projectDetail"));
export const TaskDetails = lazy(() => import("../pages/taskDetails"));
export const EditProject = lazy(() => import("../pages/editProject"));
export const Calendar = lazy(() => import("../features/calender"));
export const Vacations = lazy(() => import("../pages/vacations"));
export const Employees = lazy(() => import("../pages/employees"));
export const EmployeeDetails = lazy(() =>
  import("../pages/employeeDetails/EmployeeDetails")
);
export const EmployeeSubTasks = lazy(() =>
  import("../pages/employeeSubTasks/EmployeeSubTasks")
);
export const Messenger = lazy(() => import("../pages/messenger"));
export const InfoPortal = lazy(() => import("../pages/infoPortal"));
export const Events = lazy(() => import("../pages/events"));
export const WorkLoad = lazy(() => import("../pages/workLoad"));
export const Board = lazy(() => import("../pages/board"));
export const Leads = lazy(() => import("../pages/leads"));
export const LeadDetails = lazy(() => import("../pages/leads/LeadDetails"));
export const LeadSettings = lazy(() => import("../pages/leads/LeadSettings"));
export const TaskOnReview = lazy(() => import("../pages/taskOnReview"));
export const ProjectsAnalytics = lazy(() =>
  import("../pages/projectAnalytics")
);
export const ProjectAnalyticsDetails = lazy(() =>
  import("../pages/ProjectAnalyticsDetails")
);
export const StickyNotes = lazy(() => import("../pages/stickyNotes"));
export const Timer = lazy(() => import("../pages/timer"));
export const NotificationsPage = lazy(() => import("../pages/notifications"));
export const ActivityStreamPage = lazy(() => import("../pages/activityStream"));
export const TaskDetailPage = lazy(() => import("../pages/taskDetail"));

// Task Management Pages
export const CompanyTasks = lazy(() => import("../pages/companyTasks"));
export const MyTasks = lazy(() => import("../pages/myTasks"));
export const MySubTasks = lazy(() => import("../pages/mySubTasks"));
export const MyProjects = lazy(() => import("../pages/myProjects"));
export const TodayTasks = lazy(() => import("../pages/todayTasks"));

// Auth Components
export const SignIn = lazy(() => import("../pages/auth/signin"));
export const Register = lazy(() => import("../pages/auth/register"));
export const SingUpSuccess = lazy(() => import("../pages/auth/success"));
export const ForgetPassword = lazy(() =>
  import("../pages/auth/forgetPassword")
);

// Settings Components
export const Account = lazy(() => import("../pages/settings/accounts"));
export const Company = lazy(() => import("../pages/settings/company"));
export const Notification = lazy(() =>
  import("../pages/settings/notification")
);
export const Safety = lazy(() => import("../pages/settings/safety"));

// Welcome Components
export const WelcomeHome = lazy(() => import("../pages/welcome/home"));
export const GetStart = lazy(() => import("../pages/welcome/getStart"));
export const ProfileImageUpload = lazy(() =>
  import("../pages/welcome/profile")
);
export const MobileNumberInput = lazy(() => import("../pages/welcome/mobile"));

// Other Components
export const Unauthorized = lazy(() => import("../pages/Unauthorized"));

// Layout Components
export const DashboardLayout = lazy(() => import("../layouts/dashboard"));
export const AuthLayout = lazy(() => import("../layouts/auth"));
export const SettingsLayout = lazy(() => import("../layouts/settings"));
export const WelcomeLayout = lazy(() => import("../layouts/welcome"));
export const ProjectDetailLayout = lazy(() =>
  import("../layouts/projectDetail")
);
export const TaskDetailLayout = lazy(() => import("../layouts/taskDetail"));
