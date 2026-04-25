import { useState } from "react";
import { FiSend, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import { useAddLeadNote } from "../../../features/leads/api";

const LeadNotes = ({ notes = [], onAddNote, onEditNote, onDeleteNote, leadId }) => {
  const { user } = useAuth();
  const [noteText, setNoteText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editText, setEditText] = useState("");

  const { mutate: addNote, isLoading: isAddingNote } = useAddLeadNote();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    if (!leadId) {
      setError("Lead ID is required to add a note");
      return;
    }

    setError(null);

    // Call the API to save the note
    addNote(
      {
        leadId,
        noteData: {
          text: noteText.trim(),
        },
      },
      {
        onSuccess: (response) => {
          // Note was successfully saved
          // The notes will be automatically refetched due to query invalidation
          setNoteText("");
          setIsExpanded(false);

          // Also call the callback if provided (for optimistic updates)
          if (onAddNote && response?.data) {
            const savedNote = response.data;
            const userName =
              user?.name || user?.firstName || user?.email || "Unknown User";
            onAddNote({
              text: savedNote.text,
              author: userName,
              date: new Date(savedNote.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            });
          }
        },
        onError: (error) => {
          console.error("Error adding note:", error);
          setError(
            error.response?.data?.message ||
              "Failed to add note. Please try again."
          );
        },
      }
    );
  };

  const handleCancel = () => {
    setNoteText("");
    setIsExpanded(false);
  };

  const formatDate = (dateString) => {
    return dateString;
  };

  const startEditing = (note) => {
    setEditingNoteId(note._id || note.id);
    setEditText(note.text);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditText("");
  };

  const handleEditSubmit = (noteId) => {
    if (!editText.trim()) return;
    if (onEditNote) {
      onEditNote(noteId, editText.trim());
    }
    cancelEditing();
  };

  const handleDelete = (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      if (onDeleteNote) {
        onDeleteNote(noteId);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Notes</h3>
      </div>

      {/* Add Note Form */}
      <div className="mb-6">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-left text-sm text-slate-500 hover:border-[#3f8cff] hover:text-[#3f8cff] transition-colors"
          >
            Add a note...
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                setError(null); // Clear error when user types
              }}
              placeholder="Write your note here..."
              className="w-full p-4 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f8cff] focus:border-transparent resize-none"
              rows={4}
              autoFocus
              disabled={isAddingNote}
            />
            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isAddingNote}
                className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!noteText.trim() || isAddingNote}
                className="px-4 py-2 rounded-full bg-[#3f8cff] text-white text-sm font-semibold hover:bg-[#2f6bff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiSend size={16} />
                {isAddingNote ? "Adding..." : "Add Note"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No notes yet. Add a note to get started.
          </div>
        )}
        {notes.map((note, index) => {
          const noteId = note._id || note.id;
          const isEditing = editingNoteId === noteId;

          return (
            <div
              key={noteId || `${note.date}-${index}`}
              className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group relative"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3f8cff] resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Cancel"
                    >
                      <FiX size={16} />
                    </button>
                    <button
                      onClick={() => handleEditSubmit(noteId)}
                      disabled={!editText.trim()}
                      className="p-1.5 rounded-full text-[#3f8cff] hover:bg-blue-50 transition-colors disabled:opacity-50"
                      title="Save Changes"
                    >
                      <FiCheck size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap flex-1">
                      {note.text}
                    </p>
                    <div className="hidden group-hover:flex items-center gap-1 ml-2">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-[#3f8cff] hover:bg-blue-50 transition-colors"
                        title="Edit note"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(noteId)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete note"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Added by <span className="font-semibold">{note.author}</span> on{" "}
                    {formatDate(note.date)}
                    {note.isEdited && <span className="ml-2 italic text-slate-400">(edited)</span>}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadNotes;
