import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "../layouts/dashboard";
import Dashboard from "../pages/dashboard";
import Vacations from "../pages/vacations";
import Employees from "../pages/employees";
import Messenger from "../pages/messenger";
import InfoPortal from "../pages/infoPortal";
import Prjects from "../pages/projects";
import Events from "../pages/events";
import WorkLoad from "../pages/workLoad";
import ProjectDetails from "../pages/projectDetail";
import TaskDetails from "../pages/taskDetails";
import CompanyTasks from "../pages/companyTasks";
import MyTasks from "../pages/myTasks";
import MySubTasks from "../pages/mySubTasks";
import MyProjects from "../pages/myProjects";
import TodayTasks from "../pages/todayTasks";
import Board from "../pages/board";
import SettingsLayout from "../layouts/settings";
import Account from "../pages/settings/accounts";
import AuthLayout from "../layouts/auth";
import SignIn from "../pages/auth/signin";
import Register from "../pages/auth/register";
import SingUpSuccess from "../pages/auth/success";
import ForgetPassword from "../pages/auth/forgetPassword";
import { ProtectedRoute } from "../components/protectedRoute";
import WelcomeHome from "../pages/welcome/home";
import WelcomeLayout from "../layouts/welcome";
import GetStart from "../pages/welcome/getStart";
import ProfileImageUpload from "../pages/welcome/profile";
import MobileNumberInput from "../pages/welcome/mobile";
import ProjectDetailLayout from "../layouts/projectDetail";
import TaskDetailLayout from "../layouts/taskDetail";
import Unauthorized from "../pages/Unauthorized";
import WithRoleAcess from "../components/withRoleAccess";
import RouteAccess from "../components/withRoleAccess/RouteAccess";
import EditProject from "../pages/editProject";
import EmployeeDetails from "../pages/employeeDetails/EmployeeDetails";
import ProjectsAnalytics from "../pages/projectAnalytics";
import ProjectAnalyticsDetails from "../pages/ProjectAnalyticsDetails";
import Company from "../pages/settings/company";
import Notification from "../pages/settings/notification";
import Safety from "../pages/settings/safety";
import NotificationsPage from "../pages/notifications";
import StickyNotes from "../pages/stickyNotes";
import Timer from "../pages/timer";
import ActivityStreamPage from "../pages/activityStream";
import PendingWorks from "../pages/pendingWorks";
import EmployeeSubTasks from "../pages/employeeSubTasks/EmployeeSubTasks";
import TaskDetailPage from "../pages/taskDetail";
import TaskOnReview from "../pages/taskOnReview";
import TaskOnPublish from "../pages/taskOnPublish";
import ClientReview from "../pages/clientReview";
import Calendar from "../features/calender";
import Attendance from "../features/attendance";
import CompanyDashboard from "../pages/companyDashboard";
import LeadsPage from "../pages/leads";
import LeadDetailsPage from "../pages/leads/LeadDetails";
import LeadSettingsPage from "../pages/leads/LeadSettings";

const AppRoutes = () => {
  return (
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
  );
};

export default AppRoutes;
