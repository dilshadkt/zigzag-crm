import React from "react";
import Header from "../../components/shared/header";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import WorkLoad from "../../components/dashboard/workload";
import NearestEvents from "../../components/dashboard/workload/events";
import { IoArrowUpOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useCompanyProjects } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";

const Dashboard = () => {
  const { companyId } = useAuth();
  const { data: projects, isSuccess } = useCompanyProjects(companyId);
  return (
    <section className="flex flex-col">
      <span className="text-[#7D8592]">Welcome back, Evan!</span>
      <div className="flexBetween ">
        <Header>Dashboard</Header>
        <div
          className="h-11 flexCenter text-sm gap-x-2 text-[#0A1629] px-5
         rounded-[14px] w-fit bg-[#E6EDF5]"
        >
          <img src="/icons/calender.svg" alt="" className="w-5" />
          <span>Nov 16, 2020 - Dec 16, 2020</span>
        </div>
      </div>
      <div className="w-full grid grid-cols-7 gap-x-6 mt-5">
        {/* work load section  */}
        <WorkLoad />
        {/* nearest event */}
        <NearestEvents />
      </div>
      <div className="w-full grid  grid-cols-7  gap-x-6 mt-5">
        <div className="px-4 col-span-5 h-[470px]  pb-3 pt-5  flex flex-col rounded-3xl">
          <div className="flexBetween">
            <h4 className="font-semibold text-lg text-gray-800">Projects</h4>
            <Link
              to={"/projects"}
              className="text-[#3F8CFF] text-sm cursor-pointer flexStart gap-x-2"
            >
              <span>View all</span>
              <MdOutlineKeyboardArrowRight />
            </Link>
          </div>
          {/* project list section  */}

          <div className=" flex flex-col h-full gap-y-3 mt-3">
            {projects?.map((project, index) => (
              <div key={project?._id} className="flex flex-col   h-fit ">
                <div className="bg-white  rounded-3xl grid grid-cols-2">
                  <div className="p-4  py-5 h-full flex gap-y-4 flex-col border-r border-[#E4E6E8] ">
                    <div className="flexStart  gap-x-3.5">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden">
                        <img
                          src={project?.thumbImg}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col h-full">
                        <span className="text-xs uppercase text-[#91929E]">
                          {project?._id?.slice(0, 8)}
                        </span>
                        <h4 className=" font-medium text-gray-800">
                          {project?.name}
                        </h4>
                      </div>
                    </div>
                    <div className="flexBetween">
                      <div className="flexStart gap-x-2">
                        <img
                          src="/icons/calender2.svg"
                          alt=""
                          className="w-5"
                        />
                        <span className="text-xs text-[#7D8592]">
                          Created Sep 12, 2020
                        </span>
                      </div>
                      <div className="flexEnd text-[#FFBD21] text-xs gap-x-2 pr-2">
                        <IoArrowUpOutline className="text-lg" />
                        <span>{project?.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 flex flex-col  gap-y-3 justify-center items-center">
                    <h5 className="font-medium w-full">Project Data</h5>
                    <div className="w-full grid grid-cols-3 ">
                      <div className="flex flex-col gap-y-2">
                        <span className="text-[#91929E]/90 text-sm">
                          All Tasks
                        </span>
                        <span className="font-semibold text-gray-800 text-lg">
                          {project?.tasks?.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <span className="text-[#91929E]/90 text-sm">
                          Active tasks
                        </span>
                        <span className="font-semibold text-gray-800 text-lg">
                          {project?.tasks?.length}
                        </span>
                      </div>
                      <div className="flex flex-col    gap-y-2">
                        <span className="text-[#91929E]/90 text-sm">
                          Assignees
                        </span>
                        <div className="font-semibold flexStart  text-gray-800 text-lg">
                          {project?.teams?.map((team) => (
                            <div className=" w-7 h-7 rounded-full  border-3 border-white  ">
                              <img
                                src={team?.profileImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* activity stream */}
        <div className="flex  mt-5 h-[450px] flex-col relative col-span-2 mb-3 bg-white  pt-5 pb-10  px-4  rounded-3xl">
          <h4 className="font-semibold text-lg text-gray-800">
            Activity Stream
          </h4>
          <div className="flex h-full  gap-y-6 overflow-y-auto flex-col mt-4">
            {/* activity list items    */}
            <div className="flex flex-col gap-y-3">
              <div className="flexStart gap-x-3">
                <div className="w-11  h-11  bg-black rounded-full"></div>
                <div className="flex flex-col">
                  <h5 className="font-medium">Oscar Holloway</h5>
                  <span className="text-xs text-[#91929E]">UI/UX Designer</span>
                </div>
              </div>
              <div className="flexStart bg-[#F4F9FD] rounded-xl p-4 gap-x-4">
                <img src="/icons/upload.svg" alt="" className="w-5" />
                <p className="text-[#0A1629] text-sm">
                  Updated the status of Mind Map task to In Progress
                </p>
              </div>
              <div className="flexStart bg-[#F4F9FD] rounded-xl p-4 gap-x-4">
                <img src="/icons/file.svg" alt="" className="w-5" />
                <p className="text-[#0A1629] text-sm">
                  Attached files to the task
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-y-3">
              <div className="flexStart gap-x-3">
                <div className="w-11  h-11  bg-black rounded-full"></div>
                <div className="flex flex-col">
                  <h5 className="font-medium">Oscar Holloway</h5>
                  <span className="text-xs text-[#91929E]">UI/UX Designer</span>
                </div>
              </div>
              <div className="flexStart bg-[#F4F9FD] rounded-xl p-4 gap-x-4">
                <img src="/icons/upload.svg" alt="" className="w-5" />
                <p className="text-[#0A1629] text-sm">
                  Updated the status of Mind Map task to In Progress
                </p>
              </div>
              <div className="flexStart bg-[#F4F9FD] rounded-xl p-4 gap-x-4">
                <img src="/icons/file.svg" alt="" className="w-5" />
                <p className="text-[#0A1629] text-sm">
                  Attached files to the task
                </p>
              </div>
            </div>
          </div>
          <button
            className="absolute text-sm text-[#3F8CFF] bottom-3  cursor-pointer
           left-0 right-0 mx-auto"
          >
            View more
          </button>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
