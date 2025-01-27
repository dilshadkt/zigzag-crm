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

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Prjects />} />
            <Route path="calender" element={<Calender />} />
            <Route path="vacations" element={<Vacations />} />
            <Route path="employees" element={<Employees />} />
            <Route path="messenger" element={<Messenger />} />
            <Route path="infoPortal" element={<InfoPortal />} />
            <Route path="events" element={<Events />} />
            <Route path="workload" element={<WorkLoad />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
