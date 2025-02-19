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
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { validateSession } from "./api/service";
import { ProtectedRoute } from "./components/protectedRoute";
import { loginSuccess, logout, setLoading } from "./store/slice/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true));
      try {
        const { user } = await validateSession();
        dispatch(loginSuccess({ user: user?._id, companyId: user?.companyId }));
      } catch (error) {
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };
    checkAuth();
  }, [dispatch]);
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
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Prjects />} />
            <Route path="projects/:projectName" element={<ProjectDetails />} />
            <Route
              path="projects/:projectName/:task"
              element={<TaskDetails />}
            />
            <Route path="calender" element={<Calender />} />
            <Route path="vacations" element={<Vacations />} />
            <Route path="employees" element={<Employees />} />
            <Route path="messenger" element={<Messenger />} />
            <Route path="infoPortal" element={<InfoPortal />} />
            <Route path="events" element={<Events />} />
            <Route path="workload" element={<WorkLoad />} />
            <Route path="settings" element={<SettingsLayout />}>
              <Route path="account" element={<Account />} />
              <Route path="notifications" element={<Account />} />
              <Route path="company" element={<Account />} />
              <Route path="safety" element={<Account />} />
            </Route>
          </Route>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="signin" element={<SignIn />} />
            <Route path="register" element={<Register />} />
            <Route path="sign-up-Success" element={<SingUpSuccess />} />
            <Route path="forget-password" element={<ForgetPassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
