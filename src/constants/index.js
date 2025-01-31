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

export const USERS = [
  {
    name: "Oscar Holloway",
    avatar: "avatar1.svg",
    leave: { date: ["12/01/2025"], status: "approved" },
    approved: { date: ["07/01/2025", "08/01/2025"], status: "pending" },
    remote: { date: ["01/01/2025"], status: "pending" },
  },
  {
    name: "Evan Yates",
    avatar: "avatar2.svg",
    leave: { date: ["04/01/2025"], status: "approved" },
    approved: { date: [], status: "pending" },
    remote: { date: ["01/01/2025"], status: "approved" },
  },
  {
    name: "Lola Zimmerman",
    avatar: "avatar3.svg",
    leave: { date: ["07/01/2025"], status: "approved" },
    approved: { date: ["23/01/2025", "22/01/2025"], status: "approved" },
    remote: { date: ["01/01/2025"], status: "approved" },
  },
  {
    name: "Tyler Curry",
    avatar: "avatar4.svg",
    leave: { date: ["11/01/2025"], status: "approved" },
    approved: { date: ["23/01/2025"], status: "approved" },
    remote: { date: ["01/01/2025"], status: "pending" },
  },
  {
    name: "Sadie Wolfe",
    avatar: "avatar5.svg",
    leave: { date: ["20/01/2025"], status: "approved" },
    approved: { date: ["23/01/2025"], status: "approved" },
    remote: { date: ["01/01/2025"], status: "approved" },
  },
  {
    name: "Sean Gibbs",
    avatar: "avatar6.svg",
    leave: { date: ["22/01/2025"], status: "approved" },
    approved: { date: ["04/01/2025"], status: "approved" },
    remote: { date: ["01/01/2025"], status: "approved" },
  },
  {
    name: "Corey Watts",
    avatar: "avatar7.svg",
    leave: { date: ["05/01/2025"], status: "approved" },
    approved: { date: ["09/01/2025", "10/01/2025"], status: "approved" },
    remote: { date: ["21/01/2025"], status: "approved" },
  },
  {
    name: "Theodore Shaw",
    avatar: "avatar8.svg",
    leave: { date: ["07/01/2025"], status: "approved" },
    approved: { date: ["31/01/2025"], status: "approved" },
    remote: { date: ["01/01/2025"], status: "approved" },
  },
  {
    name: "Edwin Austin",
    avatar: "avatar9.svg",
    leave: { date: ["28/01/2025"], status: "approved" },
    approved: {
      date: ["23/01/2025", "25/01/2025", "26/01/2025"],
      status: "approved",
    },
    remote: {
      date: ["27/01/2025", "28/01/2025", "29/01/2025"],
      status: "pending",
    },
  },
  {
    name: "Thomas Cummings",
    avatar: "avatar10.svg",
    leave: { date: ["19/01/2025"], status: "approved" },
    approved: { date: ["02/01/2025", "03/01/2025"], status: "approved" },
    remote: { date: ["05/01/2025"], status: "approved" },
  },
  {
    name: "Augusta Gordon",
    avatar: "avatar11.svg",
    leave: { date: ["17/01/2025"], status: "approved" },
    approved: { date: ["23/01/2025"], status: "approved" },
    remote: { date: ["01/01/2025", "02/01/2025"], status: "approved" },
  },
];
