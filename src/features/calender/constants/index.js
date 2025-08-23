import { BiTask } from "react-icons/bi";
import { IoAdd } from "react-icons/io5";
import { MdAlarm } from "react-icons/md";

export const CALENDAR_MENU_ITEMS = [
  {
    label: "Create Task",
    icon: BiTask,
    key: "create-task",
  },
  {
    label: "Add Event",
    icon: IoAdd,
    key: "add-event",
  },

  {
    label: "Add Reminder",
    icon: MdAlarm,
    key: "add-reminder",
  },
];

export const MAX_ITEMS_PER_DAY = 2;
