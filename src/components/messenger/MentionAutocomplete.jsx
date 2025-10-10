import React from "react";

const MentionAutocomplete = ({
  participants = [],
  searchTerm = "",
  onSelectUser,
  position = { top: 0, left: 0 },
  visible = false,
}) => {
  if (!visible || !participants || participants.length === 0) {
    return null;
  }

  // Filter participants based on search term
  const filteredParticipants = participants.filter((participant) => {
    const fullName = `${participant.firstName || ""} ${
      participant.lastName || ""
    }`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (filteredParticipants.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
      style={{
        bottom: `${position.bottom || 60}px`,
        left: `${position.left || 0}px`,
        maxHeight: "200px",
        width: "300px",
      }}
    >
      <div className="text-xs text-gray-500 px-3 py-2 bg-gray-50 border-b border-gray-200">
        Mention someone
      </div>
      <div className="overflow-y-auto max-h-[160px]">
        {filteredParticipants.map((participant, index) => (
          <button
            key={participant._id || participant.id || index}
            onClick={() => onSelectUser(participant)}
            className="w-full px-3 py-2 hover:bg-blue-50 transition-colors flex items-center gap-3 text-left"
          >
            <img
              src={
                participant.profileImage ||
                participant.avatar ||
                "/api/placeholder/32/32"
              }
              alt={`${participant.firstName} ${participant.lastName}`}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">
                {participant.firstName} {participant.lastName}
              </div>
              {participant.position && (
                <div className="text-xs text-gray-500 truncate">
                  {participant.position}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MentionAutocomplete;
