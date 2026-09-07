import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { FiFolderPlus, FiVideo } from "react-icons/fi";
import { MdOutlineTaskAlt } from "react-icons/md";
import { RiCalendarCheckLine } from "react-icons/ri";
import MobileCreateFab from "./MobileCreateFab";
import AddProject from "../projects/addProject";
import AddTask from "../projects/addTask";
import ScheduleMeetingModal from "../meetings/ScheduleMeetingModal";
import VacationRequestModal from "../../features/vacations/components/VacationRequestModal";
import {
  useAddProject,
  useCompanyProjects,
  useConnectGoogleMeet,
  useCreateMeeting,
  useCreateTaskFromBoard,
  useGetAllEmployees,
  useGetGoogleMeetStatus,
} from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { processAttachments, cleanTaskData } from "../../lib/attachmentUtils";
import { uploadSingleFile } from "../../api/service";

/**
 * App-wide mobile create hub (same idea as GlobalNudges).
 * Mount once in the dashboard layout so the + button is available on every page.
 */
const GlobalCreateFab = () => {
  const navigate = useNavigate();
  const { user, companyId, isCompany } = useAuth();
  const { hasPermission, canScheduleMeetings, isAdmin } = usePermissions();

  const [showModalProject, setShowModalProject] = useState(false);
  const [showModalTask, setShowModalTask] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const isClient = user?.role === "client";
  const isCompanyAdmin = isAdmin();
  const canCreateProject = isCompany || hasPermission("projects", "create");
  const canCreateTask = isCompany || hasPermission("tasks", "create");
  const canSchedule = canScheduleMeetings();
  const canRequestLeave = isCompany || hasPermission("vacations", "create");

  const projectCompanyId = companyId || user?.company;
  const needEmployees = canSchedule || canCreateTask || isCompanyAdmin;
  const { data: projectsData } = useCompanyProjects(
    canCreateTask || canCreateProject ? projectCompanyId : null
  );
  const { data: employeesData } = useGetAllEmployees(needEmployees);
  const { data: googleStatus } = useGetGoogleMeetStatus();
  const employees = employeesData?.employees || [];

  const addProject = useAddProject();
  const createMeeting = useCreateMeeting();
  const connectGoogle = useConnectGoogleMeet();
  const createTask = useCreateTaskFromBoard((data) => {
    setShowModalTask(false);
    if (data?.data?.task?._id) {
      const task = data.data.task;
      if (task.project) {
        navigate(`/projects/${task.project}/${task._id}`);
      } else {
        navigate(`/tasks/${task._id}`);
      }
    }
  });

  if (isClient) return null;

  const handleAddProject = async (values, { resetForm }) => {
    try {
      const response = await addProject.mutateAsync(values);
      setShowModalProject(false);
      resetForm();
      if (response?.project?._id) {
        navigate(`/projects/${response.project._id}`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not create project");
    }
  };

  const handleAddTask = async (values, { resetForm }) => {
    const updatedValues = cleanTaskData(values);
    updatedValues.creator = user?._id;
    updatedValues.attachments = await processAttachments(
      values?.attachments,
      uploadSingleFile
    );
    try {
      await createTask.mutateAsync(updatedValues);
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not create task");
    }
  };

  const handleSaveMeeting = (payload) => {
    createMeeting.mutate(payload, {
      onSuccess: (res) => {
        toast.success("Meeting scheduled");
        if (res?.meetLinkWarning) toast(res.meetLinkWarning);
        setShowSchedule(false);
      },
      onError: (error) =>
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Could not save meeting"
        ),
    });
  };

  const handleConnectGoogle = () => {
    connectGoogle.mutate(window.location.pathname || "/", {
      onSuccess: (res) => {
        if (res?.url) window.location.href = res.url;
      },
      onError: (error) =>
        toast.error(error?.message || "Could not start Google Calendar connect"),
    });
  };

  return (
    <>
      <MobileCreateFab
        ariaLabel="Create"
        actions={[
          {
            id: "meeting",
            label: "Schedule meeting",
            icon: <FiVideo size={18} />,
            show: canSchedule,
            onClick: () => setShowSchedule(true),
          },
          {
            id: "task",
            label: "Create task",
            icon: <MdOutlineTaskAlt size={18} />,
            show: canCreateTask,
            onClick: () => setShowModalTask(true),
          },
          {
            id: "project",
            label: "Create project",
            icon: <FiFolderPlus size={18} />,
            show: canCreateProject,
            onClick: () => setShowModalProject(true),
          },
          {
            id: "leave",
            label: "Request leave",
            icon: <RiCalendarCheckLine size={18} />,
            show: canRequestLeave,
            onClick: () => setShowRequestModal(true),
          },
        ]}
      />

      {canCreateProject && (
        <AddProject
          isOpen={showModalProject}
          setShowModalProject={setShowModalProject}
          onSubmit={handleAddProject}
        />
      )}

      {canCreateTask && (
        <AddTask
          isOpen={showModalTask}
          setShowModalTask={setShowModalTask}
          projects={projectsData || []}
          onSubmit={handleAddTask}
          teams={employees}
          selectedMonth={format(new Date(), "yyyy-MM")}
          isLoading={createTask.isPending}
          showProjectSelection={true}
        />
      )}

      {canSchedule && (
        <ScheduleMeetingModal
          isOpen={showSchedule}
          meeting={null}
          employees={employees}
          isSaving={createMeeting.isPending}
          googleStatus={googleStatus}
          isAdmin={isCompanyAdmin}
          onConnectGoogle={handleConnectGoogle}
          isConnectingGoogle={connectGoogle.isPending}
          onClose={() => setShowSchedule(false)}
          onSubmit={handleSaveMeeting}
        />
      )}

      {showRequestModal && canRequestLeave && (
        <VacationRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </>
  );
};

export default GlobalCreateFab;
