import { useState } from 'react';
import { useModuleStore, Note } from '~/stores/moduleStore';
import { useAuthStore } from '~/stores/authStore';
import { Button } from '~/ui-kit/catalyst/button';
import { Textarea } from '~/ui-kit/catalyst/textarea';

interface StepNotesProps {
  stepId: string;
}

export default function StepNotes({ stepId }: StepNotesProps) {
  const { user } = useAuthStore();
  const { notes, addNote, updateNote, deleteNote } = useModuleStore();
  const stepNotes = notes[stepId] || [];

  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleAddNote = () => {
    if (user && newNoteContent.trim()) {
      addNote(user.id, stepId, newNoteContent.trim());
      setNewNoteContent('');
    }
  };

  const handleUpdateNote = () => {
    if (editingNote && editingNote.content.trim()) {
      updateNote(editingNote.note_id, editingNote.content.trim());
      setEditingNote(null);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h4 className="font-semibold text-gray-700">Your Notes</h4>
      <ul className="mt-2 space-y-2">
        {stepNotes.map(note => (
          <li key={note.note_id} className="text-sm text-gray-800">
            {editingNote?.note_id === note.note_id ? (
              <div className="flex flex-col space-y-2">
                <Textarea 
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                />
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateNote}>Save</Button>
                  <Button plain onClick={() => setEditingNote(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p>{note.content}</p>
                <div className="flex space-x-2">
                  <Button plain onClick={() => setEditingNote(note)}>Edit</Button>
                  <Button plain onClick={() => deleteNote(note.note_id, stepId)}>Delete</Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Textarea 
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Add a new note..."
        />
        <Button onClick={handleAddNote} className="mt-2">Add Note</Button>
      </div>
    </div>
  );
}
