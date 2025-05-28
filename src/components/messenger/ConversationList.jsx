import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import ConversationItem from "./ConversationItem";
import EmployeeListModal from "./EmployeeListModal";
import { CONVERSATIONS_DATA } from "./data";

const ConversationList = ({
  conversations = [],
  collapsedSections,
  onToggleSection,
  selectedConversation,
  onSelectConversation,
  loading = false,
  error = null,
  onCreateDirectConversation,
}) => {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // Organize conversations into sections based on type (already transformed in useChat hook)
  const conversationSections =
    conversations.length > 0
      ? [
          {
            type: "group",
            title: "Project Chats",
            items: conversations.filter((conv) => conv.type === "project"),
          },
          {
            type: "direct",
            title: "Direct Messages",
            items: conversations.filter((conv) => conv.type === "direct"),
          },
        ]
      : CONVERSATIONS_DATA;
  const handleStartNewChat = () => {
    setShowEmployeeModal(true);
  };

  const handleCreateConversation = async (employeeId) => {
    if (onCreateDirectConversation) {
      await onCreateDirectConversation(employeeId);
    }
    setShowEmployeeModal(false);
  };

  if (loading) {
    return (
      <div className="border-r border-gray-200 overflow-y-auto col-span-1 flex flex-col">
        <div className="h-[70px] flexBetween border-b border-gray-200 p-6">
          <h4 className="font-bold text-gray-800">Conversations</h4>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-r border-gray-200 overflow-y-auto col-span-1 flex flex-col">
        <div className="h-[70px] flexBetween border-b border-gray-200 p-6">
          <h4 className="font-bold text-gray-800">Conversations</h4>
        </div>
        <div className="flex items-center justify-center p-8 text-red-500">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-r border-gray-200 overflow-y-auto col-span-1 flex flex-col">
        <div className="h-[70px] flexBetween border-b border-gray-200 p-6">
          <h4 className="font-bold text-gray-800">Conversations</h4>
          <div className="flexEnd">
            {/* Add new conversation button */}
            <button
              onClick={handleStartNewChat}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Start new conversation"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-col overflow-y-auto">
          {conversationSections.map((section) => (
            <div key={section.type} className="mb-2">
              <SectionHeader
                title={section.title}
                sectionType={section.type}
                isCollapsed={collapsedSections[section.type]}
                onToggle={onToggleSection}
              />
              {!collapsedSections[section.type] && (
                <div className="px-2">
                  {section.items.length > 0 ? (
                    section.items.map((item) => (
                      <ConversationItem
                        key={item.id}
                        item={item}
                        isGroup={section.type === "group"}
                        isSelected={selectedConversation?.id === item.id}
                        onSelect={onSelectConversation}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">
                        {section.type === "group"
                          ? "No project chats yet"
                          : "No direct messages yet"}
                      </p>
                      {section.type === "direct" && (
                        <button
                          onClick={handleStartNewChat}
                          className="mt-2 text-blue-500 hover:text-blue-600 text-sm underline"
                        >
                          Start a conversation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Employee List Modal */}
      {showEmployeeModal && (
        <EmployeeListModal
          onClose={() => setShowEmployeeModal(false)}
          onSelectEmployee={handleCreateConversation}
        />
      )}
    </>
  );
};

export default ConversationList;
