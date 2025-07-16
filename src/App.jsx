import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/dashboard";
import Dashboard from "./pages/dashboard";
import Calender from "./pages/calender";
import Vacations from "./pages/vacations";
import Employees from "./pages/employees";
import Messenger from "./pages/messenger";
import InfoPortal from "./pages/infoPortal";
import Prjects from "./pages/projects";
import Events from "./pages/events";
import WorkLoad from "./pages/workLoad";
import ProjectDetails from "./pages/projectDetail";
import TaskDetails from "./pages/taskDetails";
import CompanyTasks from "./pages/companyTasks";
import MyTasks from "./pages/myTasks";
import MySubTasks from "./pages/mySubTasks";
import MyProjects from "./pages/myProjects";
import TodayTasks from "./pages/todayTasks";
import Board from "./pages/board";
import SettingsLayout from "./layouts/settings";
import Account from "./pages/settings/accounts";
import AuthLayout from "./layouts/auth";
import SignIn from "./pages/auth/signin";
import Register from "./pages/auth/register";
import SingUpSuccess from "./pages/auth/success";
import ForgetPassword from "./pages/auth/forgetPassword";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { validateSession } from "./api/service";
import { ProtectedRoute } from "./components/protectedRoute";
import { loginSuccess, logout, setLoading } from "./store/slice/authSlice";
import WelcomeHome from "./pages/welcome/home";
import WelcomeLayout from "./layouts/welcome";
import GetStart from "./pages/welcome/getStart";
import ProfileImageUpload from "./pages/welcome/profile";
import MobileNumberInput from "./pages/welcome/mobile";
import ProjectDetailLayout from "./layouts/projectDetail";
import Unauthorized from "./pages/Unauthorized";
import WithRoleAcess from "./components/withRoleAccess";
import RouteAccess from "./components/withRoleAccess/RouteAccess";
import EditProject from "./pages/editProject";
import EmployeeDetails from "./pages/employeeDetails/EmployeeDetails";
import ProjectsAnalytics from "./pages/projectAnalytics";
import ProjectAnalyticsDetails from "./pages/ProjectAnalyticsDetails";
import Company from "./pages/settings/company";
import Notification from "./pages/settings/notification";
import Safety from "./pages/settings/safety";
import NotificationsPage from "./pages/notifications";
import StickyNotes from "./pages/stickyNotes";
import Timer from "./pages/timer";
import ActivityStreamPage from "./pages/activityStream";

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth); // Get loading and isAuthenticated state from Redux
  const [isAuthChecked, setIsAuthChecked] = useState(false); // Track if auth check is complete

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true)); // Set loading to true
      try {
        const { user } = await validateSession();

        dispatch(
          loginSuccess({
            user: user,
            isProfileComplete: user?.isProfileComplete || false,
            companyId: user?.company,
          })
        );
      } catch (error) {
        dispatch(logout());
      } finally {
        dispatch(setLoading(false)); // Set loading to false

        setIsAuthChecked(true); // Mark auth check as complete
      }
    };
    checkAuth();
  }, [dispatch]);

  // Show loading spinner while verifying the user
  if (loading || !isAuthChecked) {
    return (
      <div className="h-screen w-full flexCenter">
        <img src="/icons/loading.svg" alt="" />
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
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
            <Route path="calender" element={<Calender />} />
            <Route path="vacations" element={<Vacations />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:employeeId" element={<EmployeeDetails />} />
            <Route path="messenger" element={<Messenger />} />
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
                <WithRoleAcess allowedRoles={["company-admin"]}>
                  <CompanyTasks filter="today" />
                </WithRoleAcess>
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
            <Route
              path="board"
              element={
                // <WithRoleAcess allowedRoles={["employee"]}>
                <Board />
                // </WithRoleAcess>
              }
            />
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
      </BrowserRouter>
    </>
  );
}

export default App;
