import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import EditProject from "./pages/editProject";
import EmployeeDetails from "./pages/employeeDetails/EmployeeDetails";
import ProjectsAnalytics from "./pages/projectAnalytics";
import ProjectAnalyticsDetails from "./pages/ProjectAnalyticsDetails";
import Company from "./pages/settings/company";
import Notification from "./pages/settings/notification";
import Safety from "./pages/settings/safety";

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
                <WithRoleAcess allowedRoles={["company-admin", "employee"]}>
                  <Dashboard />
                </WithRoleAcess>
              }
            />
            <Route path="projects" element={<Prjects />} />
            <Route path="projects-analytics" element={<ProjectsAnalytics />} />
            <Route
              path="projects-analytics/:projectId"
              element={<ProjectAnalyticsDetails />}
            />
            <Route
              path="projects/:projectName"
              element={<ProjectDetailLayout />}
            >
              <Route index element={<ProjectDetails />} />
              <Route path=":taskId" element={<TaskDetails />} />
            </Route>
            <Route
              path="projects/:projectName/edit"
              element={<EditProject />}
            />
            <Route path="calender" element={<Calender />} />
            <Route path="vacations" element={<Vacations />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:employeeId" element={<EmployeeDetails />} />
            <Route path="messenger" element={<Messenger />} />
            <Route path="infoPortal" element={<InfoPortal />} />
            <Route path="events" element={<Events />} />
            <Route path="workload" element={<WorkLoad />} />
            <Route path="settings" element={<SettingsLayout />}>
              <Route path="account" element={<Account />} />
              <Route path="notifications" element={<Notification />} />
              <Route path="company" element={<Company />} />
              <Route path="safety" element={<Safety />} />
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
