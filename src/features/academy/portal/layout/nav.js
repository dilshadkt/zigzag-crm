import { FiAward, FiBookOpen, FiCalendar, FiClipboard, FiCreditCard, FiHome, FiUser } from "react-icons/fi";

// Shaped like the CRM's SIDE_MENU so SidebarMenuItem can render it
export const PORTAL_MENU = [
  { title: "Dashboard", icon: FiHome, path: "/student" },
  { title: "My Course", icon: FiBookOpen, path: "/student/course" },
  { title: "Tasks", icon: FiClipboard, path: "/student/tasks" },
  { title: "Attendance", icon: FiCalendar, path: "/student/attendance" },
  { title: "Fees", icon: FiCreditCard, path: "/student/fees" },
  { title: "Certificate", icon: FiAward, path: "/student/certificate" },
  { title: "My Profile", icon: FiUser, path: "/student/profile" },
];
