import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";

// Layout Imports (Still static as they wrap many routes)
import DashboardLayout from "../layouts/dashboard";
import AuthLayout from "../layouts/auth";
import WelcomeLayout from "../layouts/welcome";
import ProjectDetailLayout from "../layouts/projectDetail";
import TaskDetailLayout from "../layouts/taskDetail";
import SettingsLayout from "../layouts/settings";

// Shared Components
import { ProtectedRoute } from "../components/protectedRoute";
import RouteAccess from "../components/withRoleAccess/RouteAccess";
import WithRoleAcess from "../components/withRoleAccess";
import LoadingSpinner from "../components/LoadingSpinner";

// Lazy Loaded Pages
const Dashboard = lazy(() => import("../pages/dashboard"));
const Campaigns = lazy(() => import("../pages/campaigns"));
const CampaignDetails = lazy(() => import("../pages/campaigns/CampaignDetails"));
const Vacations = lazy(() => import("../pages/vacations"));
const Employees = lazy(() => import("../pages/employees"));
const Messenger = lazy(() => import("../pages/messenger"));
const InfoPortal = lazy(() => import("../pages/infoPortal"));
const Prjects = lazy(() => import("../pages/projects"));
const Events = lazy(() => import("../pages/events"));
const WorkLoad = lazy(() => import("../pages/workLoad"));
const ProjectDetails = lazy(() => import("../pages/projectDetail"));
const TaskDetails = lazy(() => import("../pages/taskDetails"));
const CompanyTasks = lazy(() => import("../pages/companyTasks"));
const MyTasks = lazy(() => import("../pages/myTasks"));
const MySubTasks = lazy(() => import("../pages/mySubTasks"));
const MyProjects = lazy(() => import("../pages/myProjects"));
const TodayTasks = lazy(() => import("../pages/todayTasks"));
const Board = lazy(() => import("../pages/board"));
const Account = lazy(() => import("../pages/settings/accounts"));
const SignIn = lazy(() => import("../pages/auth/signin"));
const Register = lazy(() => import("../pages/auth/register"));
const SingUpSuccess = lazy(() => import("../pages/auth/success"));
const ForgetPassword = lazy(() => import("../pages/auth/forgetPassword"));
const WelcomeHome = lazy(() => import("../pages/welcome/home"));
const GetStart = lazy(() => import("../pages/welcome/getStart"));
const ProfileImageUpload = lazy(() => import("../pages/welcome/profile"));
const MobileNumberInput = lazy(() => import("../pages/welcome/mobile"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));
const EditProject = lazy(() => import("../pages/editProject"));
const EmployeeDetails = lazy(() => import("../pages/employeeDetails/EmployeeDetails"));
const ProjectsAnalytics = lazy(() => import("../pages/projectAnalytics"));
const ProjectAnalyticsDetails = lazy(() => import("../pages/ProjectAnalyticsDetails"));
const Company = lazy(() => import("../pages/settings/company"));
const Notification = lazy(() => import("../pages/settings/notification"));
const Safety = lazy(() => import("../pages/settings/safety"));
const NotificationsPage = lazy(() => import("../pages/notifications"));
const StickyNotes = lazy(() => import("../pages/stickyNotes"));
const Timer = lazy(() => import("../pages/timer"));
const ActivityStreamPage = lazy(() => import("../pages/activityStream"));
const PendingWorks = lazy(() => import("../pages/pendingWorks"));
const EmployeeSubTasks = lazy(() => import("../pages/employeeSubTasks/EmployeeSubTasks"));
const TaskDetailPage = lazy(() => import("../pages/taskDetail"));
const TaskOnReview = lazy(() => import("../pages/taskOnReview"));
const TaskOnPublish = lazy(() => import("../pages/taskOnPublish"));
const ClientReview = lazy(() => import("../pages/clientReview"));
const Calendar = lazy(() => import("../features/calender"));
const Attendance = lazy(() => import("../features/attendance"));
const CompanyDashboard = lazy(() => import("../pages/companyDashboard"));
const LeadsPage = lazy(() => import("../pages/leads"));
const LeadDetailsPage = lazy(() => import("../pages/leads/LeadDetails"));
const LeadSettingsPage = lazy(() => import("../pages/leads/LeadSettings"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <RouteAccess>
                <Dashboard />
              </RouteAccess>
            }
          />
          <Route
            path="company-dashboard"
            element={
              <RouteAccess>
                <CompanyDashboard />
              </RouteAccess>
            }
          />
          <Route
            path="projects"
            element={
              <RouteAccess>
                <Prjects />
              </RouteAccess>
            }
          />
          <Route
            path="sticky-notes"
            element={
              <RouteAccess>
                <StickyNotes />
              </RouteAccess>
            }
          />
          <Route
            path="timer"
            element={
              <RouteAccess>
                <Timer />
              </RouteAccess>
            }
          />
          <Route
            path="notifications"
            element={
              <RouteAccess>
                <NotificationsPage />
              </RouteAccess>
            }
          />
          <Route
            path="activity-stream"
            element={
              <RouteAccess>
                <ActivityStreamPage />
              </RouteAccess>
            }
          />
          <Route
            path="pending-works"
            element={
              <RouteAccess>
                <PendingWorks />
              </RouteAccess>
            }
          />
          <Route path="projects-analytics" element={<ProjectsAnalytics />} />
          <Route
            path="projects-analytics/:projectId"
            element={<ProjectAnalyticsDetails />}
          />
          <Route path="projects/:projectId" element={<ProjectDetailLayout />}>
            <Route index element={<ProjectDetails />} />
            <Route path=":taskId" element={<TaskDetails />} />
          </Route>
          <Route path="projects/:projectId/edit" element={<EditProject />} />
          <Route path="tasks/:taskId" element={<TaskDetailLayout />}>
            <Route index element={<TaskDetailPage />} />
          </Route>

          {/* Campaign Routes */}
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/:id" element={<CampaignDetails />} />

          <Route path="calender" element={<Calendar />} />
          <Route path="vacations" element={<Vacations />} />
          <Route path="employees" element={<Employees />} />
          <Route
            path="leads"
            element={
              <RouteAccess>
                <LeadsPage />
              </RouteAccess>
            }
          />
          <Route
            path="leads/:leadId"
            element={
              <RouteAccess>
                <LeadDetailsPage />
              </RouteAccess>
            }
          />
          <Route
            path="leads/settings"
            element={
              <RouteAccess>
                <LeadSettingsPage />
              </RouteAccess>
            }
          />
          <Route path="attendance" element={<Attendance />} />
          <Route path="employees/:employeeId" element={<EmployeeDetails />} />
          <Route
            path="employees/:employeeId/subtasks"
            element={<EmployeeSubTasks />}
          />
          <Route path="messenger" element={<Messenger />} />
          <Route path="task-on-review" element={<TaskOnReview />} />
          <Route path="task-on-publish" element={<TaskOnPublish />} />
          <Route path="client-review" element={<ClientReview />} />
          <Route path="infoPortal" element={<InfoPortal />} />
          <Route path="events" element={<Events />} />
          <Route path="workload" element={<WorkLoad />} />
          <Route
            path="company-tasks"
            element={
              <WithRoleAcess allowedRoles={["company-admin"]}>
                <CompanyTasks />
              </WithRoleAcess>
            }
          />
          <Route
            path="company-today-tasks"
            element={
              <RouteAccess>
                <WithRoleAcess allowedRoles={["company-admin"]}>
                  <CompanyTasks filter="today" />
                </WithRoleAcess>
              </RouteAccess>
            }
          />
          <Route
            path="my-tasks"
            element={
              <WithRoleAcess allowedRoles={["employee"]}>
                <MyTasks />
              </WithRoleAcess>
            }
          />
          <Route
            path="my-subtasks"
            element={
              <WithRoleAcess allowedRoles={["employee"]}>
                <MySubTasks />
              </WithRoleAcess>
            }
          />
          <Route
            path="my-projects"
            element={
              <WithRoleAcess allowedRoles={["employee"]}>
                <MyProjects />
              </WithRoleAcess>
            }
          />
          <Route
            path="today-tasks"
            element={
              <WithRoleAcess allowedRoles={["employee"]}>
                <TodayTasks />
              </WithRoleAcess>
            }
          />
          <Route
            path="today-subtasks"
            element={
              <WithRoleAcess allowedRoles={["employee"]}>
                <MySubTasks filter="today" />
              </WithRoleAcess>
            }
          />
          <Route path="board" element={<Board />} />
          <Route
            path="settings"
            element={
              <RouteAccess>
                <SettingsLayout />
              </RouteAccess>
            }
          >
            <Route index element={<Navigate to={"/settings/company"} />} />
            <Route index element={<Navigate to="account" replace />} />
            <Route
              path="account"
              element={
                <RouteAccess>
                  <Account />
                </RouteAccess>
              }
            />
            <Route
              path="notifications"
              element={
                <RouteAccess>
                  <Notification />
                </RouteAccess>
              }
            />
            <Route
              path="company"
              element={
                <RouteAccess>
                  <Company />
                </RouteAccess>
              }
            />
            <Route
              path="safety"
              element={
                <RouteAccess>
                  <Safety />
                </RouteAccess>
              }
            />
          </Route>
        </Route>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="signin" element={<SignIn />} />
          <Route path="register" element={<Register />} />
          <Route path="sign-up-Success" element={<SingUpSuccess />} />
          <Route path="forget-password" element={<ForgetPassword />} />
        </Route>
        <Route path="unauthorized" element={<Unauthorized />} />

        <Route
          path="/welcome"
          element={
            <ProtectedRoute requireProfileComplete={false}>
              <WelcomeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WelcomeHome />} />
          <Route path="get-start" element={<GetStart />} />
          <Route path="user-profile" element={<ProfileImageUpload />} />
          <Route path="contact" element={<MobileNumberInput />} />
        </Route>
      </Routes>
    </Suspense>
  );
};


export default AppRoutes;
