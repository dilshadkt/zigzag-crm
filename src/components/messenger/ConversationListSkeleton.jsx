import React from "react";

const ConversationItemSkeleton = ({ delay = 0 }) => (
  <div
    className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Avatar skeleton */}
    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>

    {/* Content skeleton */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        {/* Name skeleton */}
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        {/* Time skeleton */}
        <div className="h-3 bg-gray-200 rounded w-12"></div>
      </div>
      {/* Last message skeleton */}
      <div className="h-3 bg-gray-200 rounded w-32"></div>
    </div>

    {/* Unread badge skeleton */}
    <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0"></div>
  </div>
);

const SectionHeaderSkeleton = ({ delay = 0 }) => (
  <div
    className="flex items-center gap-2 px-3 py-2 mx-2 animate-pulse"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-4 h-4 bg-gray-200 rounded"></div>
    <div className="h-4 bg-gray-200 rounded w-20"></div>
  </div>
);

const ConversationListSkeleton = () => {
  return (
    <div className="border-r border-gray-200 overflow-y-auto col-span-1 flex flex-col">
      {/* Header skeleton */}
      <div className="h-[70px] flexBetween border-b border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col overflow-y-auto">
        {/* Project Chats Section */}
        <div className="mb-2">
          <SectionHeaderSkeleton delay={0} />
          <div className="px-2">
            {[1, 2, 3].map((item, index) => (
              <ConversationItemSkeleton key={item} delay={index * 100} />
            ))}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="mb-2">
          <SectionHeaderSkeleton delay={300} />
          <div className="px-2">
            {[1, 2, 3, 4].map((item, index) => (
              <ConversationItemSkeleton key={item} delay={400 + index * 100} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationListSkeleton;
