/**
 * Database types for Supabase
 * These types should match your database schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          name: string
          type: 'LLC' | 'CORPORATION' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP'
          state: string
          status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
          owner_id: string
          ein: string | null
          formation_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'LLC' | 'CORPORATION' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP'
          state: string
          status?: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
          owner_id: string
          ein?: string | null
          formation_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'LLC' | 'CORPORATION' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP'
          state?: string
          status?: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
          owner_id?: string
          ein?: string | null
          formation_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_formation_sessions: {
        Row: {
          id: string
          business_id: string
          user_id: string
          agent_responses: Json
          current_step: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          agent_responses?: Json
          current_step: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          agent_responses?: Json
          current_step?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      agent_sessions: {
        Row: {
          id: string
          user_id: string
          thread_id: string
          agent_type: string
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thread_id: string
          agent_type: string
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thread_id?: string
          agent_type?: string
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json
          tokens_used?: number | null
          created_at?: string
        }
      }
      user_api_keys: {
        Row: {
          id: string
          user_id: string
          provider: string
          api_key_encrypted: string
          preferred_model: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          api_key_encrypted: string
          preferred_model?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          api_key_encrypted?: string
          preferred_model?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      task_templates: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          order_index?: number
          created_at?: string
        }
      }
      user_tasks: {
        Row: {
          id: string
          user_id: string
          business_id: string | null
          template_id: string | null
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'skipped'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id?: string | null
          template_id?: string | null
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string | null
          template_id?: string | null
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      business_type: 'LLC' | 'CORPORATION' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP'
      business_status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
      task_status: 'pending' | 'in_progress' | 'completed' | 'skipped'
    }
  }
}
