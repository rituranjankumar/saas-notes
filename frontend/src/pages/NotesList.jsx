import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getNotes, createNote, deleteNote, updateNote, getMembers } from "../api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function NotesList() {
  const user = useSelector((state) => state.auth.user);
  const token = localStorage.getItem("token");

  const [allNotes, setAllNotes] = useState([]);
  const [members, setMembers] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    if (user && token) {
      fetchData();
    }
  }, [user, token]);

  async function fetchData() {
    try {
      const notesRes = await getNotes(token);
      setAllNotes(notesRes.data.notes);

      if (user.role === 'admin') {
        const membersRes = await getMembers(user.tenantSlug, token);
        setMembers(membersRes.data.members);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch data");
    }
  }

  async function handleCreateNote(e) {
    e.preventDefault();
    try {
      const res = await createNote(newNote.title, newNote.content, token);

 
      setAllNotes([res.data.note, ...allNotes]);
      setNewNote({ title: "", content: "" });
      toast.success("Note created!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create note");
    }
  }

  async function handleUpdateNote(e) {
    e.preventDefault();
    try {
      const res = await updateNote(editingNote._id, editingNote.title, editingNote.content, token);
      setAllNotes(allNotes.map(note => note._id === res.data.note._id ? res.data.note : note));
      setEditingNote(null);
      setNewNote({ title: "", content: "" });
      toast.success("Note updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update note");
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      await deleteNote(noteId, token);
      setAllNotes(allNotes.filter(note => note._id !== noteId));
      toast.success("Note deleted!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete note");
    }
  }

  const getCreatorEmail = (creatorId) => {
    const member = members.find(m => m._id === creatorId);
    return member ? member.email : "Unknown";
  };

  const canModify = (note) => {
    if (!user) return false;
    // Check if creator is an object with an _id or a string id
    const creatorId = typeof note.creator === 'object' ? note.creator._id : note.creator;
    return user.role === 'admin' || creatorId === user.id;
  };

  const isFreePlanAndLimitReached = user?.plan === "free" && allNotes.filter(n => n.creator._id === user.id).length >= 3;
  
  const myNotes = allNotes.filter(n => typeof n.creator === 'object' ? n.creator._id === user.id : n.creator === user.id);
  const otherNotes = allNotes.filter(n => typeof n.creator === 'object' ? n.creator._id !== user.id : n.creator !== user.id);

  console.log("All notes ",allNotes)
  return (
    <div className="container mx-auto p-4">
      {isFreePlanAndLimitReached && (
        <div className="bg-yellow-800 p-4 rounded-lg mb-6 text-center">
          <p className="font-semibold mb-2">You have reached the 3 note limit on the Free plan.</p>
          <p>Contact your admin to upgrade your plan.</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">
          {editingNote ? "Edit Note" : "Create New Note"}
        </h2>
        <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote}>
          <div className="mb-4">
            <input
              type="text"
              value={editingNote ? editingNote.title : newNote.title}
              onChange={(e) => editingNote ? setEditingNote({ ...editingNote, title: e.target.value }) : setNewNote({ ...newNote, title: e.target.value })}
              placeholder="Title"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <textarea
              value={editingNote ? editingNote.content : newNote.content}
              onChange={(e) => editingNote ? setEditingNote({ ...editingNote, content: e.target.value }) : setNewNote({ ...newNote, content: e.target.value })}
              placeholder="Content"
              rows="4"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-medium transition-colors ${isFreePlanAndLimitReached && !editingNote ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            disabled={isFreePlanAndLimitReached && !editingNote}
          >
            {editingNote ? "Update Note" : "Create Note"}
          </button>
          {editingNote && (
            <button
              type="button"
              onClick={() => {
                setEditingNote(null);
                setNewNote({ title: "", content: "" });
              }}
              className="mt-2 w-full py-2 rounded-lg bg-gray-600 hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">My Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {myNotes.length === 0 ? (
            <p className="text-gray-400">No notes found.</p>
          ) : (
            myNotes?.map((note) => (
              <div key={note._id} className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col border border-blue-500">
                <h3 className="text-xl font-bold text-white mb-2">{note.title}</h3>
                <p className="text-gray-300 flex-1">{note.content}</p>
                <div className="mt-4 text-sm text-gray-400">
                  By: {note.creator.email}
                </div>
                {canModify(note) && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="flex-1 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note?._id)}
                      className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {user.role === 'admin' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Other Members' Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherNotes.length === 0 ? (
              <p className="text-gray-400">No other members' notes found.</p>
            ) : (
              otherNotes.map((note) => (
                <div key={note._id} className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col border border-gray-500">
                  <h3 className="text-xl font-bold text-white mb-2">{note.title}</h3>
                  <p className="text-gray-300 flex-1">{note.content}</p>
                  <div className="mt-4 text-sm text-gray-400">
                    By: {note.creator.email}
                  </div>
                  {canModify(note) && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="flex-1 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}