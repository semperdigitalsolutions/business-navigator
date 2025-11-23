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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      business_type: 'LLC' | 'CORPORATION' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP'
      business_status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    }
  }
}
