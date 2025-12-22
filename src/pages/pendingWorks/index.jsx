import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useCompanyWorkDetailsByMonth } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth"; // access from pages/pendingWorks/index.jsx -> ../../hooks/useAuth

const PendingWorks = () => {
    const navigate = useNavigate();
    const { companyId } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get month from query param or default to current month
    const currentMonth = useMemo(() => {
        const paramMonth = searchParams.get("month");
        if (paramMonth) return new Date(paramMonth + "-01"); // Append day to make it parseable
        return new Date();
    }, [searchParams]);

    // Helper handling month navigation
    const navigateMonth = (direction) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + direction);
        const monthStr = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, "0")}`;
        setSearchParams({ month: monthStr });
    };

    const monthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, "0")}`;

    const { data: projectsWorkDetails, isLoading } = useCompanyWorkDetailsByMonth(
        companyId,
        monthKey
    );

    const allPendingProjects = useMemo(() => {
        if (!projectsWorkDetails) return [];

        return projectsWorkDetails
            .map((project) => {
                const details = project.workDetails[0] || {};

                const pendingCount =
                    (details.reels?.pending || 0) +
                    (details.poster?.pending || 0) +
                    (details.motionPoster?.pending || 0) +
                    (details.shooting?.pending || 0) +
                    (details.motionGraphics?.pending || 0) +
                    (details.other || []).reduce((acc, item) => acc + (item.pending || 0), 0);

                return {
                    ...project,
                    pendingCount,
                    details,
                };
            })
            .filter((p) => p.pendingCount > 0)
            .sort((a, b) => b.pendingCount - a.pendingCount);
    }, [projectsWorkDetails]);

    const dateRange = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-5">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <MdOutlineKeyboardArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Pending Works</h1>
                </div>

                <div className="flex items-center justify-center gap-4 bg-gray-50 px-4 py-2 rounded-xl">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <MdOutlineKeyboardArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium text-gray-700 w-32 text-center select-none">
                        {dateRange}
                    </span>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <MdOutlineKeyboardArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allPendingProjects.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 bg-white rounded-2xl">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-gray-500 text-lg">No pending work for {dateRange}</p>
                    </div>
                ) : (
                    allPendingProjects.map((project) => (
                        <div
                            key={project._id}
                            onClick={() => navigate(`/projects/${project._id}`)}
                            className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-100 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-gray-800 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {project.name}
                                </h3>
                                <span className="bg-red-50 text-red-500 text-xs font-bold px-3 py-1 rounded-full">
                                    {project.pendingCount} Pending
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <DetailRow label="Reels" item={project.details.reels} color="text-pink-600" bg="bg-pink-50" />
                                <DetailRow label="Posters" item={project.details.poster} color="text-purple-600" bg="bg-purple-50" />
                                <DetailRow label="Motion Check" item={project.details.motionPoster} color="text-indigo-600" bg="bg-indigo-50" />
                                <DetailRow label="Shooting" item={project.details.shooting} color="text-orange-600" bg="bg-orange-50" />
                                <DetailRow label="Motion Graphics" item={project.details.motionGraphics} color="text-teal-600" bg="bg-teal-50" />

                                {/* Handle 'Other' array if needed, generally these are dynamic */}
                                {project.details.other && project.details.other.map((item, idx) => (
                                    item.pending > 0 && (
                                        <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-50">
                                            <span className="text-gray-600">{item.name || `Other ${idx + 1}`}</span>
                                            <span className="font-bold text-gray-700">{item.pending}/{item.total}</span>
                                        </div>
                                    )
                                ))}

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const DetailRow = ({ label, item, color, bg }) => {
    if (!item || !item.pending || item.pending <= 0) return null;
    return (
        <div className={`flex justify-between items-center text-sm p-2 rounded-lg ${bg}`}>
            <span className={`${color} font-medium`}>{label}</span>
            <span className="font-bold text-gray-700">
                {item.pending} <span className="text-gray-400 font-normal text-xs">/ {item.total}</span>
            </span>
        </div>
    );
};

export default PendingWorks;
