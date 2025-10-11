import React, { useState, useMemo, useEffect } from "react";
import { FaTimes, FaImage, FaFile, FaLink, FaChartBar } from "react-icons/fa";
import ImageLightbox from "./ImageLightbox";
import VoiceMessage from "./VoiceMessage";
import { getProjectStats } from "../../api/projectStatsService";

const MediaFilesPanel = ({
  isOpen,
  onClose,
  messages,
  conversationName,
  selectedConversation,
}) => {
  const [activeTab, setActiveTab] = useState("media");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Initialize selected month when panel opens
  useEffect(() => {
    if (isOpen && !selectedMonth) {
      const currentMonth = new Date();
      const monthKey = `${currentMonth.getFullYear()}-${String(
        currentMonth.getMonth() + 1
      ).padStart(2, "0")}`;
      setSelectedMonth(monthKey);
    }
  }, [isOpen, selectedMonth]);

  // Load project stats when panel opens, conversation changes, or month changes
  useEffect(() => {
    const loadProjectStats = async () => {
      if (isOpen && selectedConversation?.project?._id && selectedMonth) {
        setLoadingStats(true);
        try {
          const response = await getProjectStats(
            selectedConversation.project._id,
            selectedMonth
          );
          setProjectStats(response.data);
        } catch (error) {
          console.error("Error loading project stats:", error);
        } finally {
          setLoadingStats(false);
        }
      }
    };

    loadProjectStats();
  }, [isOpen, selectedConversation?.project?._id, selectedMonth]);

  // Month navigation functions
  const changeMonth = (direction) => {
    if (!selectedMonth) return;

    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);

    if (direction === "prev") {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }

    const newMonthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    setSelectedMonth(newMonthKey);
  };

  const isCurrentMonth = () => {
    if (!selectedMonth) return true;
    const currentMonth = new Date();
    const currentKey = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}`;
    return selectedMonth === currentKey;
  };

  const isFutureMonth = () => {
    if (!selectedMonth) return false;
    const currentMonth = new Date();
    const currentKey = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}`;
    return selectedMonth > currentKey;
  };

  // Extract all media, files, and links from messages
  const extractedContent = useMemo(() => {
    const media = [];
    const files = [];
    const links = [];
    const audio = [];

    messages.forEach((message) => {
      // Extract from regular message attachments
      if (message.attachments && message.attachments.length > 0) {
        message.attachments.forEach((attachment) => {
          const item = {
            ...attachment,
            messageId: message.id,
            sender: message.sender,
            timestamp: message.timestamp,
            time: message.time,
          };

          // Check if it's an image
          if (
            attachment.mimetype?.startsWith("image/") ||
            attachment.type === "image" ||
            message.type === "image"
          ) {
            media.push(item);
          }
          // Check if it's audio/voice
          else if (
            attachment.mimetype?.startsWith("audio/") ||
            attachment.type === "voice" ||
            message.type === "voice"
          ) {
            audio.push(item);
          }
          // Everything else is a file
          else {
            files.push(item);
          }
        });
      }

      // Extract from system message metadata (activity attachments)
      if (
        message.metadata?.attachments &&
        message.metadata.attachments.length > 0
      ) {
        message.metadata.attachments.forEach((attachment) => {
          const item = {
            ...attachment,
            messageId: message.id,
            sender: message.sender,
            timestamp: message.timestamp,
            time: message.time,
            isFromActivity: true,
          };

          // Check if it's an image
          if (
            attachment.mimetype?.startsWith("image/") ||
            attachment.type === "image"
          ) {
            media.push(item);
          }
          // Check if it's audio/voice
          else if (
            attachment.mimetype?.startsWith("audio/") ||
            attachment.type === "voice"
          ) {
            audio.push(item);
          }
          // Everything else is a file
          else {
            files.push(item);
          }
        });
      }

      // Extract links from message content
      if (message.type === "link" || message.isLink) {
        links.push({
          url: message.message,
          messageId: message.id,
          sender: message.sender,
          timestamp: message.timestamp,
          time: message.time,
        });
      }
    });

    return {
      media: media.reverse(), // Most recent first
      files: files.reverse(),
      links: links.reverse(),
      audio: audio.reverse(),
    };
  }, [messages]);

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setSelectedImageIndex(index);
    setShowLightbox(true);
  };

  const handleNavigateImage = (newIndex) => {
    setSelectedImageIndex(newIndex);
    setSelectedImage(extractedContent.media[newIndex]);
  };

  const tabs = [
    ...(selectedConversation?.isGroup && selectedConversation?.project
      ? [
          {
            id: "project",
            label: "Project",
            icon: FaChartBar,
            count: null,
          },
        ]
      : []),
    {
      id: "media",
      label: "Media",
      icon: FaImage,
      count: extractedContent.media.length,
    },
    {
      id: "files",
      label: "Files",
      icon: FaFile,
      count: extractedContent.files.length,
    },
    {
      id: "links",
      label: "Links",
      icon: FaLink,
      count: extractedContent.links.length,
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 bg-opacity-25 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Shared Content
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Project Info Tab */}
          {activeTab === "project" && (
            <div>
              {loadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : projectStats ? (
                <div className="space-y-4">
                  {/* Project Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <h3 className="font-bold text-lg mb-1">
                      {projectStats.project.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className=" bg-opacity-20 px-2 py-1 rounded capitalize">
                        {projectStats.project.status}
                      </span>
                      <span className=" bg-opacity-20 px-2 py-1 rounded capitalize">
                        {projectStats.project.priority} Priority
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Overall Progress
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {projectStats.statistics.completionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${projectStats.statistics.completionRate}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {projectStats.statistics.completed +
                        projectStats.statistics.approved +
                        projectStats.statistics.clientApproved}{" "}
                      of {projectStats.statistics.total} tasks completed
                    </p>
                  </div>

                  {/* Month Navigator */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      {/* Previous Month Button */}
                      <button
                        onClick={() => changeMonth("prev")}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous month"
                      >
                        <svg
                          className="w-4 h-4 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>

                      {/* Month Display */}
                      <div className="text-center flex-1">
                        <span className="text-sm font-medium text-gray-700">
                          📅{" "}
                          {new Date(
                            projectStats.month + "-01"
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {isCurrentMonth() && (
                          <div className="mt-0.5">
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Next Month Button */}
                      <button
                        onClick={() => changeMonth("next")}
                        disabled={isFutureMonth()}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          isFutureMonth()
                            ? "Cannot view future months"
                            : "Next month"
                        }
                      >
                        <svg
                          className="w-4 h-4 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Monthly Work Details / Balance */}
                  {projectStats.monthlyWorkDetails && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        📊 Work Details & Balance
                      </h4>
                      <div className="space-y-2">
                        {/* Reels */}
                        {projectStats.monthlyWorkDetails.reels &&
                          projectStats.monthlyWorkDetails.reels.total > 0 && (
                            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🎬</span>
                                  <span className="text-sm font-semibold text-gray-800">
                                    Reels
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                  {
                                    projectStats.monthlyWorkDetails.reels
                                      .completed
                                  }{" "}
                                  /{" "}
                                  {projectStats.monthlyWorkDetails.reels.total}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-lg font-bold text-amber-600">
                                    {
                                      projectStats.monthlyWorkDetails.reels
                                        .count
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Balance
                                  </p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-green-600">
                                    {
                                      projectStats.monthlyWorkDetails.reels
                                        .completed
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Done</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-blue-600">
                                    {
                                      projectStats.monthlyWorkDetails.reels
                                        .extra
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Extra</p>
                                </div>
                              </div>
                              {/* Progress bar */}
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-1.5 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      projectStats.monthlyWorkDetails.reels
                                        .total > 0
                                        ? (projectStats.monthlyWorkDetails.reels
                                            .completed /
                                            projectStats.monthlyWorkDetails
                                              .reels.total) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                        {/* Posters */}
                        {projectStats.monthlyWorkDetails.poster &&
                          projectStats.monthlyWorkDetails.poster.total > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🖼️</span>
                                  <span className="text-sm font-semibold text-gray-800">
                                    Posters
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                  {
                                    projectStats.monthlyWorkDetails.poster
                                      .completed
                                  }{" "}
                                  /{" "}
                                  {projectStats.monthlyWorkDetails.poster.total}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-lg font-bold text-amber-600">
                                    {
                                      projectStats.monthlyWorkDetails.poster
                                        .count
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Balance
                                  </p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-green-600">
                                    {
                                      projectStats.monthlyWorkDetails.poster
                                        .completed
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Done</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-blue-600">
                                    {
                                      projectStats.monthlyWorkDetails.poster
                                        .extra
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Extra</p>
                                </div>
                              </div>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      projectStats.monthlyWorkDetails.poster
                                        .total > 0
                                        ? (projectStats.monthlyWorkDetails
                                            .poster.completed /
                                            projectStats.monthlyWorkDetails
                                              .poster.total) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                        {/* Motion Posters */}
                        {projectStats.monthlyWorkDetails.motionPoster &&
                          projectStats.monthlyWorkDetails.motionPoster.total >
                            0 && (
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">✨</span>
                                  <span className="text-sm font-semibold text-gray-800">
                                    Motion Posters
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                  {
                                    projectStats.monthlyWorkDetails.motionPoster
                                      .completed
                                  }{" "}
                                  /{" "}
                                  {
                                    projectStats.monthlyWorkDetails.motionPoster
                                      .total
                                  }
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-lg font-bold text-amber-600">
                                    {
                                      projectStats.monthlyWorkDetails
                                        .motionPoster.count
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Balance
                                  </p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-green-600">
                                    {
                                      projectStats.monthlyWorkDetails
                                        .motionPoster.completed
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Done</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-blue-600">
                                    {
                                      projectStats.monthlyWorkDetails
                                        .motionPoster.extra
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Extra</p>
                                </div>
                              </div>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-violet-500 h-1.5 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      projectStats.monthlyWorkDetails
                                        .motionPoster.total > 0
                                        ? (projectStats.monthlyWorkDetails
                                            .motionPoster.completed /
                                            projectStats.monthlyWorkDetails
                                              .motionPoster.total) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                        {/* Shooting */}
                        {projectStats.monthlyWorkDetails.shooting &&
                          projectStats.monthlyWorkDetails.shooting.total >
                            0 && (
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🎥</span>
                                  <span className="text-sm font-semibold text-gray-800">
                                    Shooting
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                  {
                                    projectStats.monthlyWorkDetails.shooting
                                      .completed
                                  }{" "}
                                  /{" "}
                                  {
                                    projectStats.monthlyWorkDetails.shooting
                                      .total
                                  }
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-lg font-bold text-amber-600">
                                    {
                                      projectStats.monthlyWorkDetails.shooting
                                        .count
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Balance
                                  </p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-green-600">
                                    {
                                      projectStats.monthlyWorkDetails.shooting
                                        .completed
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Done</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-blue-600">
                                    {
                                      projectStats.monthlyWorkDetails.shooting
                                        .extra
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Extra</p>
                                </div>
                              </div>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      projectStats.monthlyWorkDetails.shooting
                                        .total > 0
                                        ? (projectStats.monthlyWorkDetails
                                            .shooting.completed /
                                            projectStats.monthlyWorkDetails
                                              .shooting.total) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                        {/* Motion Graphics */}
                        {projectStats.monthlyWorkDetails.motionGraphics &&
                          projectStats.monthlyWorkDetails.motionGraphics.total >
                            0 && (
                            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🎨</span>
                                  <span className="text-sm font-semibold text-gray-800">
                                    Motion Graphics
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                  {
                                    projectStats.monthlyWorkDetails
                                      .motionGraphics.completed
                                  }{" "}
                                  /{" "}
                                  {
                                    projectStats.monthlyWorkDetails
                                      .motionGraphics.total
                                  }
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-lg font-bold text-amber-600">
                                    {
                                      projectStats.monthlyWorkDetails
                                        .motionGraphics.count
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Balance
                                  </p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-green-600">
                                    {
                                      projectStats.monthlyWorkDetails
                                        .motionGraphics.completed
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Done</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-blue-600">
                                    {
                                      projectStats.monthlyWorkDetails
                                        .motionGraphics.extra
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">Extra</p>
                                </div>
                              </div>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-teal-500 h-1.5 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      projectStats.monthlyWorkDetails
                                        .motionGraphics.total > 0
                                        ? (projectStats.monthlyWorkDetails
                                            .motionGraphics.completed /
                                            projectStats.monthlyWorkDetails
                                              .motionGraphics.total) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                        {/* Other Work Types */}
                        {projectStats.monthlyWorkDetails.other &&
                          projectStats.monthlyWorkDetails.other.length > 0 &&
                          projectStats.monthlyWorkDetails.other
                            .filter((item) => item.total > 0)
                            .map((item, index) => (
                              <div
                                key={index}
                                className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-300 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">📌</span>
                                    <span className="text-sm font-semibold text-gray-800">
                                      {item.name}
                                    </span>
                                  </div>
                                  <span className="text-xs font-medium text-gray-600">
                                    {item.completed} / {item.total}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div>
                                    <p className="text-lg font-bold text-amber-600">
                                      {item.count}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Balance
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-green-600">
                                      {item.completed}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Done
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-blue-600">
                                      {item.extra}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Extra
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-gray-500 to-slate-500 h-1.5 rounded-full transition-all"
                                    style={{
                                      width: `${
                                        item.total > 0
                                          ? (item.completed / item.total) * 100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}

                        {/* Summary Card if all work details are empty */}
                        {!projectStats.monthlyWorkDetails.reels?.total &&
                          !projectStats.monthlyWorkDetails.poster?.total &&
                          !projectStats.monthlyWorkDetails.motionPoster
                            ?.total &&
                          !projectStats.monthlyWorkDetails.shooting?.total &&
                          !projectStats.monthlyWorkDetails.motionGraphics
                            ?.total &&
                          (!projectStats.monthlyWorkDetails.other ||
                            projectStats.monthlyWorkDetails.other.length ===
                              0) && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-500">
                                No monthly work details set for this project
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Task Status Cards */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Task Status
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">
                            Completed
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {projectStats.statistics.completed +
                            projectStats.statistics.approved +
                            projectStats.statistics.clientApproved}
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">
                            In Progress
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {projectStats.statistics.inProgress}
                        </p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">To Do</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-600 mt-1">
                          {projectStats.statistics.todo}
                        </p>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">
                            On Review
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 mt-1">
                          {projectStats.statistics.onReview}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  {projectStats.statistics.overdue > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-700">
                          ⚠️ Overdue Tasks
                        </span>
                        <span className="text-xl font-bold text-red-600">
                          {projectStats.statistics.overdue}
                        </span>
                      </div>
                    </div>
                  )}

                  {projectStats.statistics.rework > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-orange-700">
                          🔄 Rework Needed
                        </span>
                        <span className="text-xl font-bold text-orange-600">
                          {projectStats.statistics.rework}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Priority Distribution */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Priority Distribution
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${
                                projectStats.statistics.total > 0
                                  ? (projectStats.statistics.highPriority /
                                      projectStats.statistics.total) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-16">
                          High: {projectStats.statistics.highPriority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: `${
                                projectStats.statistics.total > 0
                                  ? (projectStats.statistics.mediumPriority /
                                      projectStats.statistics.total) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-16">
                          Medium: {projectStats.statistics.mediumPriority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                projectStats.statistics.total > 0
                                  ? (projectStats.statistics.lowPriority /
                                      projectStats.statistics.total) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-16">
                          Low: {projectStats.statistics.lowPriority}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subtasks Summary */}
                  {projectStats.statistics.subTasks.total > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-xs font-semibold text-gray-700 mb-3">
                        📝 Subtasks
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            {projectStats.statistics.subTasks.completed +
                              projectStats.statistics.subTasks.approved}
                          </p>
                          <p className="text-xs text-gray-500">Done</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            {projectStats.statistics.subTasks.inProgress}
                          </p>
                          <p className="text-xs text-gray-500">Working</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-amber-600">
                            {projectStats.statistics.subTasks.todo}
                          </p>
                          <p className="text-xs text-gray-500">Pending</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Members */}
                  {projectStats.project.teams &&
                    projectStats.project.teams.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          👥 Team Members ({projectStats.project.teams.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {projectStats.project.teams.map((member, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5"
                            >
                              <img
                                src={
                                  member.profileImage || "/image/noProfile.svg"
                                }
                                alt={`${member.firstName} ${member.lastName}`}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="text-xs font-medium text-gray-700">
                                {member.firstName} {member.lastName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaChartBar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">
                    Project info unavailable
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div>
              {extractedContent.media.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {extractedContent.media.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageClick(item, index)}
                      className="aspect-square relative group overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 transition-all cursor-pointer"
                    >
                      <img
                        src={item.url || item.preview}
                        alt={item.originalName || item.title || "Media"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "/image/noProfile.svg";
                        }}
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                      {/* Info badge */}
                      {item.isFromActivity && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                          Activity
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaImage className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No media shared yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Images shared in this chat will appear here
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === "files" && (
            <div>
              {/* Audio/Voice Messages Section */}
              {extractedContent.audio.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Audio & Voice Messages ({extractedContent.audio.length})
                  </h3>
                  <div className="space-y-2">
                    {extractedContent.audio.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🎵</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {item.originalName ||
                                item.title ||
                                "Voice Message"}
                            </p>
                            <p className="text-xs text-gray-500">{item.time}</p>
                          </div>
                        </div>
                        <VoiceMessage
                          attachment={item}
                          isOwn={false}
                          messageId={item.messageId}
                          attachmentIndex={index}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Files Section */}
              {extractedContent.files.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Documents & Files ({extractedContent.files.length})
                  </h3>
                  <div className="space-y-2">
                    {extractedContent.files.map((item, index) => (
                      <a
                        key={index}
                        href={item.url || item.preview}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group"
                      >
                        {/* File Icon */}
                        <div className="flex-shrink-0 w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-xl">
                          {item.mimetype?.includes("pdf")
                            ? "📄"
                            : item.mimetype?.includes("word") ||
                              item.mimetype?.includes("document")
                            ? "📝"
                            : item.mimetype?.startsWith("video/")
                            ? "🎥"
                            : item.mimetype?.startsWith("audio/")
                            ? "🎵"
                            : item.mimetype?.includes("zip") ||
                              item.mimetype?.includes("rar")
                            ? "📦"
                            : "📎"}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.originalName || item.title || "File"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500">{item.time}</p>
                            {item.size && (
                              <>
                                <span className="text-gray-300">•</span>
                                <p className="text-xs text-gray-500">
                                  {(item.size / 1024).toFixed(1)} KB
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Download Icon */}
                        <div className="flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>

                        {/* Activity badge */}
                        {item.isFromActivity && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                            Activity
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {extractedContent.files.length === 0 &&
                extractedContent.audio.length === 0 && (
                  <div className="text-center py-12">
                    <FaFile className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">No files shared yet</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Documents and files shared in this chat will appear here
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* Links Tab */}
          {activeTab === "links" && (
            <div>
              {extractedContent.links.length > 0 ? (
                <div className="space-y-2">
                  {extractedContent.links.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group"
                    >
                      {/* Link Icon */}
                      <div className="flex-shrink-0 w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                        <FaLink className="w-4 h-4 text-blue-500" />
                      </div>

                      {/* Link Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-blue-600 truncate hover:underline">
                          {item.url}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500">
                            Shared by {item.sender}
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                      </div>

                      {/* External Link Icon */}
                      <div className="flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaLink className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No links shared yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Links shared in this chat will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {extractedContent.media.length}
              </p>
              <p className="text-xs text-gray-500">Media</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {extractedContent.files.length}
              </p>
              <p className="text-xs text-gray-500">Files</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {extractedContent.audio.length}
              </p>
              <p className="text-xs text-gray-500">Audio</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {extractedContent.links.length}
              </p>
              <p className="text-xs text-gray-500">Links</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        image={selectedImage}
        isOpen={showLightbox}
        onClose={() => {
          setShowLightbox(false);
          setSelectedImage(null);
        }}
        allImages={extractedContent.media}
        currentIndex={selectedImageIndex}
        onNavigate={handleNavigateImage}
      />
    </>
  );
};

export default MediaFilesPanel;
