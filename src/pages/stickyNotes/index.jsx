import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import Modal from "../../components/shared/modal";
import StickyNote from "../../components/shared/StickyNote";
import AddNote from "../../components/shared/AddNote";
import NoteForm from "../../components/shared/NoteForm";
import TrashDropZone from "../../components/shared/TrashDropZone";
import ViewNoteModal from "../../components/shared/ViewNoteModal";
import Header from "../../components/shared/header";
import {
  useGetStickyNotes,
  useCreateStickyNote,
  useUpdateStickyNote,
  useDeleteStickyNote,
  useUpdateStickyNotePositions,
} from "../../api/hooks";

const StickyNotes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewNote, setViewNote] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // API hooks
  const { data: notes = [], isLoading, error } = useGetStickyNotes();

  const createNoteMutation = useCreateStickyNote();
  const updateNoteMutation = useUpdateStickyNote();
  const deleteNoteMutation = useDeleteStickyNote();
  const updatePositionsMutation = useUpdateStickyNotePositions();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setIsDragging(true);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveId(null);
    setIsDragging(false);

    if (!over) return;

    // Check if dropped on trash
    if (over.id === "trash-drop-zone") {
      deleteNoteMutation.mutate(active.id);
      return;
    }

    // Handle reordering
    if (active.id !== over.id) {
      const oldIndex = notes.findIndex((note) => note._id === active.id);
      const newIndex = notes.findIndex((note) => note._id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedNotes = arrayMove(notes, oldIndex, newIndex);
        const noteIds = reorderedNotes.map((note) => note._id);

        // Update positions on the server
        updatePositionsMutation.mutate(noteIds);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setIsDragging(false);
  };

  const handleAddNote = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (noteId) => {
    const note = notes.find((n) => n._id === noteId);
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleViewNote = (noteId) => {
    const note = notes.find((n) => n._id === noteId);
    setViewNote(note);
    setIsViewModalOpen(true);
  };

  const handleSaveNote = (formData) => {
    if (selectedNote) {
      // Update existing note
      updateNoteMutation.mutate({
        noteId: selectedNote._id,
        updateData: formData,
      });
    } else {
      // Create new note
      createNoteMutation.mutate(formData);
    }
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = (noteId) => {
    const note = notes.find((n) => n._id === noteId);
    setNoteToDelete(note);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNoteMutation.mutate(noteToDelete._id);
      setIsDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setNoteToDelete(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewNote(null);
  };

  // Get the active note for drag overlay
  const activeNote = activeId
    ? notes.find((note) => note._id === activeId)
    : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="">
        <div className="mb-4">
          <Header>Sticky Notes</Header>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-[#7D8592]">Loading notes...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="">
        <div className="mb-4">
          <Header>Sticky Notes</Header>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load notes</div>
            <div className="text-[#7D8592] text-sm">
              {error?.message || "Something went wrong"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-4">
        <div className="flexBetween">
          <div>
            <Header>Sticky Notes</Header>
          </div>
          <div className="text-sm text-[#91929E]">
            Total Notes:{" "}
            <span className="font-medium text-gray-800">{notes.length}</span>
          </div>
        </div>
      </div>

      {/* Sticky Notes Wall */}
      <section
        className="relative w-full h-full  rounded-3xl
       border-gray-200 overflow-hidden bg-gradient-to-br from-gray-50
        to-blue-50/30"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="relative z-30 w-full h-full overflow-y-auto py-2">
            <SortableContext
              items={notes.map((note) => note._id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {notes.map((note) => (
                  <StickyNote
                    key={note._id}
                    id={note._id}
                    title={note.title}
                    desc={note.desc}
                    priority={note.priority}
                    color={note.color}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onView={handleViewNote}
                  />
                ))}
                <AddNote onAddNote={handleAddNote} />
              </div>
            </SortableContext>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeNote ? (
              <div className="transform rotate-6 opacity-90">
                <StickyNote
                  id={activeNote._id}
                  title={activeNote.title}
                  desc={activeNote.desc}
                  priority={activeNote.priority}
                  color={activeNote.color}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onView={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>

          {/* Trash Drop Zone */}
          <TrashDropZone isDragging={isDragging} />
        </DndContext>

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
      </section>

      {/* View Note Modal */}
      <ViewNoteModal
        note={viewNote}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
      />

      {/* Add/Edit Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedNote ? "Edit Note" : "Create New Note"}
      >
        <NoteForm
          note={selectedNote}
          onSave={handleSaveNote}
          onCancel={handleCloseModal}
          isLoading={
            createNoteMutation.isLoading || updateNoteMutation.isLoading
          }
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Note"
      >
        <div className="space-y-4">
          <p className="text-[#7D8592]">
            Are you sure you want to delete "{noteToDelete?.title}"? This action
            cannot be undone.
          </p>
          <div className="flexEnd gap-x-3 pt-4">
            <button
              onClick={handleCloseDeleteModal}
              className="px-6 py-2.5 rounded-2xl border border-gray-200 text-[#7D8592] hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={deleteNoteMutation.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteNoteMutation.isLoading}
              className="px-6 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {deleteNoteMutation.isLoading ? "Deleting..." : "Delete Note"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StickyNotes;
