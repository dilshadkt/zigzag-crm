import React, { useEffect, useState } from "react";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { IoArrowUpOutline } from "react-icons/io5";
import Progress from "../../components/shared/progress";
import { Link } from "react-router-dom";
import Input from "../../components/shared/Field/input";
import DatePicker from "../../components/shared/Field/date";
import Select from "../../components/shared/Field/select";
import Description from "../../components/shared/Field/description";
import AddProject from "../../components/projects/addProject";
import AddTask from "../../components/projects/addTask";
import { useCompanyProjects, useProjectDetails } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { setActiveProject } from "../../store/slice/projectSlice";
import { useProject } from "../../hooks/useProject";

const Prjects = () => {
  const { companyId } = useAuth();
  const { activeProject: selectProject } = useProject();
  const dispatch = useDispatch();
  const { data: projects, isSuccess } = useCompanyProjects(companyId);
  const { data: activeProject, isLoading } = useProjectDetails(selectProject);
  useEffect(() => {
    dispatch(setActiveProject(projects?.[0]?._id));
  }, [isSuccess]);
  const [showModalProject, setShowModalProject] = useState(false);
  const [showModalFilter, setShowModalFilter] = useState(false);
  const [showModalTask, setShowModalTask] = useState(false);

  if (isLoading) return <div>Loading...</div>;

  const activeTasks = activeProject?.tasks?.filter(
    (task) => task?.status === "todo"
  );
  const progressTasks = activeProject?.tasks?.filter(
    (task) => task?.status === "in-progress"
  );
  const completedTasks = activeProject?.tasks?.filter(
    (task) => task?.status === "completed"
  );

  return (
    <section className="flex flex-col h-full gap-y-3">
      <div className="flexBetween ">
        <Header>Projects</Header>
        <div className="flexEnd gap-x-2">
          <PrimaryButton
            icon={"/icons/add.svg"}
            title={"Add Project"}
            onclick={() => setShowModalProject(true)}
            className={"mt-3 text-white px-5"}
          />
        </div>
      </div>
      <div className="w-full h-full  overflow-hidden gap-x-5  grid grid-cols-5">
        {/* current project section  */}
        <div
          className="col-span-1 bg-white overflow-hidden text-[#0A1629]
         rounded-3xl  flex flex-col "
        >
          <div className="flexCenter border-b  border-[#E4E6E8] gap-x-2 py-5">
            <button className="flexCenter cursor-pointer">
              <span className="font-medium ">Current Projects</span>
              <img src="/icons/arrowDown.svg" alt="" />
            </button>
          </div>
          {/* projects  */}
          <div
            className="flex flex-col h-full my-2 pl-2    
            gap-y-2 overflow-y-auto"
          >
            {/* project card  */}
            {projects?.map((project, index) => (
              <div
                onClick={() => {
                  dispatch(setActiveProject(project?._id));
                  // setSelectProject(project?._id);
                }}
                key={index}
                className={`${
                  selectProject === project?._id && `bg-[#F4F9FD]`
                }  hover:bg-[#F4F9FD] 
                 cursor-pointer relative rounded-2xl px-4
                  gap-y-1.5  group  mr-3 py-3 flex flex-col`}
              >
                <span className="text-xs uppercase text-[#91929E]">
                  {project?._id.slice(0, 9)}
                </span>
                <h4 className="font-medium text-gray-800 text-sm">
                  {project?.name}
                </h4>
                <Link
                  to={`/projects/Medical-app`}
                  className="flexStart hover:underline w-fit cursor-pointer gap-x-1 text-[#3F8CFF]"
                >
                  <span className="text-sm"> View details</span>
                  <MdOutlineKeyboardArrowRight className="translate-y-0.5" />
                </Link>
                {/* the side bar  */}
                <div
                  className={`absolute w-1 top-0  -right-3
                  h-0 ${
                    selectProject === project?._id && `h-full`
                  } group-hover:h-full transition-all duration-300  bg-[#3F8CFF] rounded-full `}
                ></div>
              </div>
            ))}
          </div>
        </div>
        {/* project detail page  */}
        <div className="col-span-4 overflow-hidden   flex flex-col">
          <div className="flexBetween">
            <h3 className="text-lg font-medium text-gray-800">Tasks</h3>
            <PrimaryButton
              icon={"/icons/filter.svg"}
              onclick={() => setShowModalFilter(true)}
              className={"bg-white"}
            />
          </div>

          <div className="flex flex-col h-full gap-y-4 mt-4  rounded-xl overflow-hidden   overflow-y-auto">
            {/* task  */}
            {activeProject?.tasks?.length === 0 ? (
              <div className="w-full h-full gap-y-5  flexCenter flex-col">
                <img
                  src="/image/projects/noTask.png"
                  alt=""
                  className="w-2xs"
                />
                <h4 className="font-semibold text-lg  leading-6 max-w-sm text-center">
                  There are no tasks in this project <br /> yet Let's add them
                </h4>
                <PrimaryButton
                  icon={"/icons/add.svg"}
                  title={"Add Task"}
                  onclick={() => setShowModalTask(true)}
                />
              </div>
            ) : (
              <>
                <div className="min-h-10 font-medium  sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
                  Active Tasks
                </div>
                {activeTasks.map((task, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-10 gap-x-3 px-5 bg-white py-5 rounded-3xl"
                  >
                    <div className="col-span-3 gap-y-1 flex flex-col">
                      <span className="text-sm text-[#91929E]">Task Name</span>
                      <h4>{task?.title}</h4>
                    </div>
                    <div className="col-span-5  grid grid-cols-4">
                      <div className="flex flex-col gap-y-1">
                        <span className="text-sm text-[#91929E]">Estimate</span>
                        <h4>{task?.timeEstimate}h</h4>
                      </div>
                      <div className="flex flex-col gap-y-1">
                        <span className="text-sm text-[#91929E]">
                          Spent Time
                        </span>
                        <h4>1d 2h</h4>
                      </div>
                      <div className="flex flex-col gap-y-1">
                        <span className="text-sm text-[#91929E]">Assignee</span>

                        <div className="w-6 h-6 rounded-full  flexCenter">
                          <img src="/image/photo.png" alt="" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-1">
                        <span className="text-sm text-[#91929E]">Priority</span>
                        <div className="flexStart gap-x-1 text-[#FFBD21]">
                          <IoArrowUpOutline className="text-lg " />
                          <span className="text-xs font-medium">
                            {task?.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2  flexBetween">
                      <span
                        className="bg-[#E0F9F2] text-[#00D097] 
                  flexCenter capitalize text-xs font-medium py-[7px] px-[15px] rounded-lg"
                      >
                        {task?.status}
                      </span>
                      <Progress size={30} strokeWidth={2} currentValue={100} />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* back log  */}
            <div className="min-h-10 font-medium  sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
              Progress
            </div>
            {progressTasks.map((task, index) => (
              <div
                key={index}
                className="grid grid-cols-10 gap-x-3 px-5 bg-white py-5 rounded-3xl"
              >
                <div className="col-span-3 gap-y-1 flex flex-col">
                  <span className="text-sm text-[#91929E]">Task Name</span>
                  <h4>{task?.title}</h4>
                </div>
                <div className="col-span-5  grid grid-cols-4">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Estimate</span>
                    <h4>{task?.timeEstimate}h</h4>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Spent Time</span>
                    <h4>1d 2h</h4>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Assignee</span>

                    <div className="w-6 h-6 rounded-full  flexCenter">
                      <img src="/image/photo.png" alt="" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Priority</span>
                    <div className="flexStart gap-x-1 text-[#FFBD21]">
                      <IoArrowUpOutline className="text-lg " />
                      <span className="text-xs font-medium">
                        {task?.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2  flexBetween">
                  <span
                    className="bg-[#E0F9F2] text-[#00D097] 
            flexCenter capitalize text-xs font-medium py-[7px] px-[15px] rounded-lg"
                  >
                    {task?.status}
                  </span>
                  <Progress size={30} strokeWidth={2} currentValue={100} />
                </div>
              </div>
            ))}
            {/* back log  */}
            <div className="min-h-10 font-medium  sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
              Completed
            </div>
            {completedTasks.map((task, index) => (
              <div
                key={index}
                className="grid grid-cols-10 gap-x-3 px-5 bg-white py-5 rounded-3xl"
              >
                <div className="col-span-3 gap-y-1 flex flex-col">
                  <span className="text-sm text-[#91929E]">Task Name</span>
                  <h4>{task?.title}</h4>
                </div>
                <div className="col-span-5  grid grid-cols-4">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Estimate</span>
                    <h4>{task?.timeEstimate}h</h4>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Spent Time</span>
                    <h4>1d 2h</h4>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Assignee</span>

                    <div className="w-6 h-6 rounded-full  flexCenter">
                      <img src="/image/photo.png" alt="" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Priority</span>
                    <div className="flexStart gap-x-1 text-[#FFBD21]">
                      <IoArrowUpOutline className="text-lg " />
                      <span className="text-xs font-medium">
                        {task?.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2  flexBetween">
                  <span
                    className="bg-[#E0F9F2] text-[#00D097] 
            flexCenter capitalize text-xs font-medium py-[7px] px-[15px] rounded-lg"
                  >
                    {task?.status}
                  </span>
                  <Progress size={30} strokeWidth={2} currentValue={100} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* filter menu  */}
      {showModalFilter && (
        <div
          className="fixed left-0 right-0 top-0 bottom-0
bg-[#2155A3]/15  py-3 px-3 z-50 flexEnd"
        >
          <div
            className="w-[400px]  bg-white rounded-3xl flex flex-col
         py-7 h-full"
          >
            <div className="flexBetween px-7 border-b border-[#E4E6E8]/80 pb-4">
              <h4 className="text-lg font-medium ">Filters</h4>
              <PrimaryButton
                icon={"/icons/cancel.svg"}
                className={"bg-[#F4F9FD]"}
                onclick={() => setShowModalFilter(false)}
              />
            </div>
            <div className="px-7 pb-5 pt-4  border-b border-[#E4E6E8]/80">
              <DatePicker title="Period" />
            </div>
            {/* task group  */}
            <div className="px-7 py-5  border-b border-[#E4E6E8]/80 flex flex-col">
              <h5 className="text-sm font-medium text-[#7D8592]">Task Group</h5>
              <div className="flex flex-col mt-5 gap-y-5">
                {new Array(4).fill(" ").map((item, index) => (
                  <label
                    key={index}
                    class="flex items-center space-x-2 cursor-pointer peer"
                  >
                    <input type="checkbox" class="hidden peer" />
                    <div
                      class="w-4 h-4 border-2 border-gray-500 rounded-md flex
                   items-center justify-center transition-all peer-checked:bg-black
                    peer-checked:border-black peer-checked:text-white"
                    >
                      <svg
                        class="w-3 h-3 text-white opacity-0 transition-opacity duration-200
                       peer-has-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <span class="text-gray-700 text-sm font-medium">
                      Design
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {/* reporteres  */}
            <div className="px-7 py-5  border-b border-[#E4E6E8]/80 flex flex-col">
              <h5 className="text-sm font-medium text-[#7D8592]">Reporter</h5>
              <div className="flex flex-col mt-5 gap-y-5">
                {new Array(4).fill(" ").map((item, index) => (
                  <label
                    key={index}
                    class="flex items-center space-x-2 cursor-pointer peer"
                  >
                    <input type="checkbox" class="hidden peer" />
                    <div
                      class="w-4 h-4 border-2 border-gray-500 rounded-md flex
                   items-center justify-center transition-all peer-checked:bg-black
                    peer-checked:border-black peer-checked:text-white"
                    >
                      <svg
                        class="w-3 h-3 text-white opacity-0 transition-opacity duration-200
                       peer-has-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <span class="text-gray-700 text-sm font-medium">
                      Custom Checkbox
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-7 py-5  border-b border-[#E4E6E8]/80 flex flex-col"></div>
          </div>
        </div>
      )}

      {/* add task modal  */}
      {showModalTask && (
        <AddTask
          setShowModalTask={setShowModalTask}
          selectedProject={selectProject}
          assignee={activeProject?.teams}
        />
      )}

      {/* add project modal */}
      {showModalProject && (
        <AddProject setShowModalProject={setShowModalProject} />
      )}
    </section>
  );
};

export default Prjects;
