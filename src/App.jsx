import { BrowserRouter, HashRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { validateSession } from "./api/service";
import { loginSuccess, logout, setLoading } from "./store/slice/authSlice";
import socketService from "./services/socketService";
import AppRoutes from "./routes/AppRoutes";
import { assetPath } from "./utils/assetPath";

const isDesktop = typeof window !== "undefined" && window.desktop;
const Router = isDesktop ? HashRouter : BrowserRouter;

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

        // Initialize socket connection after successful authentication
        const token = localStorage.getItem("token");
        if (token) {
          socketService.connect(token);
        }
      } catch (error) {
        dispatch(logout());
        // Disconnect socket on logout
        socketService.disconnect();
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
        <img src={assetPath("icons/loading.svg")} alt="" />
      </div>
    );
  }

  return (
    <>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10B981",
              color: "#fff",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#EF4444",
              color: "#fff",
            },
          },
        }}
      />
    </>
  );
}

export default App;
