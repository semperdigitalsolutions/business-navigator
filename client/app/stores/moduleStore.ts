import { create } from 'zustand';
import { supabase } from '~/lib/supabaseClient';

// Define types for our data to ensure type safety
export interface Step {
  step_id: string;
  module_id: string;
  step_name: string;
  step_type: string;
  step_order: number;
}

export interface Module {
  module_id: string;
  module_name: string;
  description: string;
  module_order: number;
  steps: Step[];
}

interface Progress {
  [stepId: string]: {
    status: string;
    completed_at: string | null;
  };
}

export interface Note {
  note_id: string;
  step_id: string;
  content: string;
  // Add other note fields if necessary, e.g., created_at
}

interface ModuleState {
  modules: Module[];
  progress: Progress;
  notes: { [stepId: string]: Note[] };
  loading: boolean;
  error: string | null;
  fetchModulesAndSteps: () => Promise<void>;
  fetchUserProgress: (userId: string) => Promise<void>;
  updateStepStatus: (userId: string, stepId: string, status: string) => Promise<void>;
  fetchUserNotes: (userId: string) => Promise<void>;
  addNote: (userId: string, stepId: string, content: string) => Promise<void>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string, stepId: string) => Promise<void>;
}

export const useModuleStore = create<ModuleState>((set, get) => ({
  modules: [],
  progress: {},
  notes: {},
  loading: false,
  error: null,

  fetchModulesAndSteps: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch all modules and their steps in one go
      const { data, error } = await supabase
        .from('modules')
        .select('*, steps (*)')
        .order('module_order')
        .order('step_order', { foreignTable: 'steps' });

      if (error) throw error;

      set({ modules: data || [], loading: false });
    } catch (error: any) {
      console.error('Error fetching modules and steps:', error);
      set({ error: error.message, loading: false });
    }
  },

  fetchUserProgress: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_step_progress')
        .select('step_id, status, completed_at')
        .eq('user_id', userId);

      if (error) throw error;

      const progressMap = data.reduce((acc, p) => {
        acc[p.step_id] = { status: p.status, completed_at: p.completed_at };
        return acc;
      }, {} as Progress);

      set({ progress: progressMap });
    } catch (error: any) {
      console.error('Error fetching user progress:', error);
      // Don't set a global error, as this might not be a critical failure
    }
  },

  updateStepStatus: async (userId: string, stepId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('user_step_progress')
        .upsert(
          { user_id: userId, step_id: stepId, status: status, completed_at: new Date().toISOString() },
          { onConflict: 'user_id,step_id' }
        )
        .select();

      if (error) throw error;

      if (data) {
        set((state) => ({
          progress: {
            ...state.progress,
            [stepId]: { status: data[0].status, completed_at: data[0].completed_at },
          },
        }));
      }
    } catch (error: any) {
      console.error('Error updating step status:', error);
      // Optionally set an error state for the specific component to handle
    }
  },

  fetchUserNotes: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_step_notes')
        .select('note_id, step_id, content')
        .eq('user_id', userId);

      if (error) throw error;

      const notesMap = data.reduce((acc, note) => {
        if (!acc[note.step_id]) {
          acc[note.step_id] = [];
        }
        acc[note.step_id].push(note);
        return acc;
      }, {} as { [stepId: string]: Note[] });

      set({ notes: notesMap });
    } catch (error: any) {
      console.error('Error fetching user notes:', error);
    }
  },

  addNote: async (userId: string, stepId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('user_step_notes')
        .insert({ user_id: userId, step_id: stepId, content: content })
        .select();
      
      if (error) throw error;

      if (data) {
        const newNote = data[0];
        set(state => ({
          notes: {
            ...state.notes,
            [stepId]: [...(state.notes[stepId] || []), newNote],
          }
        }));
      }
    } catch (error: any) {
      console.error('Error adding note:', error);
    }
  },

  updateNote: async (noteId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('user_step_notes')
        .update({ content: content })
        .eq('note_id', noteId)
        .select();

      if (error) throw error;

      if (data) {
        const updatedNote = data[0];
        set(state => {
          const newNotes = { ...state.notes };
          const stepNotes = newNotes[updatedNote.step_id].map(n => 
            n.note_id === updatedNote.note_id ? updatedNote : n
          );
          newNotes[updatedNote.step_id] = stepNotes;
          return { notes: newNotes };
        });
      }
    } catch (error: any) {
      console.error('Error updating note:', error);
    }
  },

  deleteNote: async (noteId: string, stepId: string) => {
    try {
      const { error } = await supabase
        .from('user_step_notes')
        .delete()
        .eq('note_id', noteId);

      if (error) throw error;

      set(state => {
        const newNotes = { ...state.notes };
        newNotes[stepId] = newNotes[stepId].filter(n => n.note_id !== noteId);
        return { notes: newNotes };
      });
    } catch (error: any) {
      console.error('Error deleting note:', error);
    }
  },
}));
