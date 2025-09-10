import { lazy } from "react";

// Lazy load components
const Dashboard = lazy(() => import("../pages/dashboard"));
const Projects = lazy(() => import("../pages/projects"));
const ProjectDetails = lazy(() => import("../pages/projectDetail"));
const TaskDetails = lazy(() => import("../pages/taskDetails"));
const EditProject = lazy(() => import("../pages/editProject"));
const Calendar = lazy(() => import("../features/calender"));
const Vacations = lazy(() => import("../pages/vacations"));
const Employees = lazy(() => import("../pages/employees"));
const EmployeeDetails = lazy(() =>
  import("../pages/employeeDetails/EmployeeDetails")
);
const EmployeeSubTasks = lazy(() =>
  import("../pages/employeeSubTasks/EmployeeSubTasks")
);
const Messenger = lazy(() => import("../pages/messenger"));
const InfoPortal = lazy(() => import("../pages/infoPortal"));
const Events = lazy(() => import("../pages/events"));
const WorkLoad = lazy(() => import("../pages/workLoad"));
const CompanyTasks = lazy(() => import("../pages/companyTasks"));
const MyTasks = lazy(() => import("../pages/myTasks"));
const MySubTasks = lazy(() => import("../pages/mySubTasks"));
const MyProjects = lazy(() => import("../pages/myProjects"));
const TodayTasks = lazy(() => import("../pages/todayTasks"));
const Board = lazy(() => import("../pages/board"));
const TaskOnReview = lazy(() => import("../pages/taskOnReview"));
const ProjectsAnalytics = lazy(() => import("../pages/projectAnalytics"));
const ProjectAnalyticsDetails = lazy(() =>
  import("../pages/ProjectAnalyticsDetails")
);
const StickyNotes = lazy(() => import("../pages/stickyNotes"));
const Timer = lazy(() => import("../pages/timer"));
const NotificationsPage = lazy(() => import("../pages/notifications"));
const ActivityStreamPage = lazy(() => import("../pages/activityStream"));
const TaskDetailPage = lazy(() => import("../pages/taskDetail"));

// Auth components
const SignIn = lazy(() => import("../pages/auth/signin"));
const Register = lazy(() => import("../pages/auth/register"));
const SingUpSuccess = lazy(() => import("../pages/auth/success"));
const ForgetPassword = lazy(() => import("../pages/auth/forgetPassword"));

// Settings components
const Account = lazy(() => import("../pages/settings/accounts"));
const Company = lazy(() => import("../pages/settings/company"));
const Notification = lazy(() => import("../pages/settings/notification"));
const Safety = lazy(() => import("../pages/settings/safety"));

// Welcome components
const WelcomeHome = lazy(() => import("../pages/welcome/home"));
const GetStart = lazy(() => import("../pages/welcome/getStart"));
const ProfileImageUpload = lazy(() => import("../pages/welcome/profile"));
const MobileNumberInput = lazy(() => import("../pages/welcome/mobile"));

// Other components
const Unauthorized = lazy(() => import("../pages/Unauthorized"));

// Route permissions
export const ROLES = {
  ADMIN: "company-admin",
  EMPLOYEE: "employee",
};

export const routeConfig = [
  {
    path: "/",
    layout: "dashboard",
    children: [
      {
        index: true,
        component: Dashboard,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "projects",
        component: Projects,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
        children: [
          {
            path: ":projectId",
            component: ProjectDetails,
            layout: "projectDetail",
            children: [
              {
                path: ":taskId",
                component: TaskDetails,
              },
            ],
          },
          {
            path: ":projectId/edit",
            component: EditProject,
          },
        ],
      },
      {
        path: "projects-analytics",
        component: ProjectsAnalytics,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "projects-analytics/:projectId",
        component: ProjectAnalyticsDetails,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "tasks/:taskId",
        component: TaskDetailPage,
        layout: "taskDetail",
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "calender",
        component: Calendar,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "vacations",
        component: Vacations,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "employees",
        component: Employees,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
        children: [
          {
            path: ":employeeId",
            component: EmployeeDetails,
          },
          {
            path: ":employeeId/subtasks",
            component: EmployeeSubTasks,
          },
        ],
      },
      {
        path: "messenger",
        component: Messenger,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "task-on-review",
        component: TaskOnReview,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "infoPortal",
        component: InfoPortal,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "events",
        component: Events,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "workload",
        component: WorkLoad,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "company-tasks",
        component: CompanyTasks,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        path: "company-today-tasks",
        component: CompanyTasks,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN],
        props: { filter: "today" },
      },
      {
        path: "my-tasks",
        component: MyTasks,
        requiresAuth: true,
        allowedRoles: [ROLES.EMPLOYEE],
      },
      {
        path: "my-subtasks",
        component: MySubTasks,
        requiresAuth: true,
        allowedRoles: [ROLES.EMPLOYEE],
      },
      {
        path: "today-subtasks",
        component: MySubTasks,
        requiresAuth: true,
        allowedRoles: [ROLES.EMPLOYEE],
        props: { filter: "today" },
      },
      {
        path: "my-projects",
        component: MyProjects,
        requiresAuth: true,
        allowedRoles: [ROLES.EMPLOYEE],
      },
      {
        path: "today-tasks",
        component: TodayTasks,
        requiresAuth: true,
        allowedRoles: [ROLES.EMPLOYEE],
      },
      {
        path: "board",
        component: Board,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "sticky-notes",
        component: StickyNotes,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "timer",
        component: Timer,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "notifications",
        component: NotificationsPage,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "activity-stream",
        component: ActivityStreamPage,
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
      },
      {
        path: "settings",
        layout: "settings",
        requiresAuth: true,
        allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
        children: [
          {
            index: true,
            redirect: "/settings/company",
          },
          {
            path: "account",
            component: Account,
          },
          {
            path: "notifications",
            component: Notification,
          },
          {
            path: "company",
            component: Company,
          },
          {
            path: "safety",
            component: Safety,
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    layout: "auth",
    children: [
      {
        path: "signin",
        component: SignIn,
      },
      {
        path: "register",
        component: Register,
      },
      {
        path: "sign-up-Success",
        component: SingUpSuccess,
      },
      {
        path: "forget-password",
        component: ForgetPassword,
      },
    ],
  },
  {
    path: "/welcome",
    layout: "welcome",
    requiresAuth: true,
    requireProfileComplete: false,
    children: [
      {
        index: true,
        component: WelcomeHome,
      },
      {
        path: "get-start",
        component: GetStart,
      },
      {
        path: "user-profile",
        component: ProfileImageUpload,
      },
      {
        path: "contact",
        component: MobileNumberInput,
      },
    ],
  },
  {
    path: "/unauthorized",
    component: Unauthorized,
  },
];
