import { TbLayoutDashboardFilled } from "react-icons/tb";
import { IoLayers } from "react-icons/io5";
import { FaCalendar } from "react-icons/fa";
import { BiSolidPlane } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";
import { FaSignalMessenger } from "react-icons/fa6";
import { GoFileDirectoryFill } from "react-icons/go";

export const SIDE_MENU = [
  {
    id: 1,
    title: "Dashboard",
    icon: TbLayoutDashboardFilled,
    path: "/",
  },
  {
    id: 2,
    title: "Projects",
    icon: IoLayers,
    path: "/projects",
  },
  {
    id: 3,
    title: "Calender",
    icon: FaCalendar,
    path: "/calender",
  },
  {
    id: 4,
    title: "Vacations",
    icon: BiSolidPlane,
    path: "/vacations",
  },
  {
    id: 5,
    title: "Employees",
    icon: HiUsers,
    path: "/employees",
  },
  {
    id: 6,
    title: "Messenger",
    icon: FaSignalMessenger,
    path: "/messenger",
  },
  {
    id: 7,
    title: "Info Portal",
    icon: GoFileDirectoryFill,
    path: "/infoPortal",
  },
];
