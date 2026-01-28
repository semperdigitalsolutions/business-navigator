/* eslint-disable max-lines */
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
          avatar_url: string | null
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_oauth_providers: {
        Row: {
          id: string
          user_id: string
          provider: 'google' | 'github' | 'apple'
          provider_user_id: string
          provider_email: string | null
          provider_avatar_url: string | null
          access_token_encrypted: string | null
          refresh_token_encrypted: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'google' | 'github' | 'apple'
          provider_user_id: string
          provider_email?: string | null
          provider_avatar_url?: string | null
          access_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'google' | 'github' | 'apple'
          provider_user_id?: string
          provider_email?: string | null
          provider_avatar_url?: string | null
          access_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_oauth_providers_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'businesses_owner_id_fkey'
            columns: ['owner_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'business_formation_sessions_business_id_fkey'
            columns: ['business_id']
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'business_formation_sessions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'agent_sessions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'chat_messages_session_id_fkey'
            columns: ['session_id']
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'user_api_keys_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      task_templates: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          priority: 'high' | 'medium' | 'low'
          week_number: number
          estimated_hours: number
          dependencies: string[]
          metadata: Json
          weight: number
          phase: 'ideation' | 'legal' | 'financial' | 'launch_prep'
          task_type: 'wizard' | 'checklist' | 'tool' | 'education' | 'external'
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          priority?: 'high' | 'medium' | 'low'
          week_number: number
          estimated_hours?: number
          dependencies?: string[]
          metadata?: Json
          weight?: number
          phase?: 'ideation' | 'legal' | 'financial' | 'launch_prep'
          task_type?: 'wizard' | 'checklist' | 'tool' | 'education' | 'external'
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          priority?: 'high' | 'medium' | 'low'
          week_number?: number
          estimated_hours?: number
          dependencies?: string[]
          metadata?: Json
          weight?: number
          phase?: 'ideation' | 'legal' | 'financial' | 'launch_prep'
          task_type?: 'wizard' | 'checklist' | 'tool' | 'education' | 'external'
          icon?: string | null
          created_at?: string
        }
        Relationships: []
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
          skipped_at: string | null
          priority_order: number
          is_hero_task: boolean
          draft_data: Json
          completion_data: Json
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
          skipped_at?: string | null
          priority_order?: number
          is_hero_task?: boolean
          draft_data?: Json
          completion_data?: Json
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
          skipped_at?: string | null
          priority_order?: number
          is_hero_task?: boolean
          draft_data?: Json
          completion_data?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_tasks_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_tasks_business_id_fkey'
            columns: ['business_id']
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_tasks_template_id_fkey'
            columns: ['template_id']
            referencedRelation: 'task_templates'
            referencedColumns: ['id']
          },
        ]
      }
      onboarding_sessions: {
        Row: {
          id: string
          user_id: string
          business_name: string | null
          business_category: 'tech_saas' | 'service' | 'ecommerce' | 'local' | null
          current_stage: 'idea' | 'planning' | 'started' | null
          state_code: string | null
          primary_goals: string[]
          timeline: 'asap' | 'soon' | 'later' | 'exploring' | null
          team_size: number | null
          funding_approach: 'personal_savings' | 'investment' | 'loan' | 'multiple' | 'none' | null
          previous_experience: 'first_business' | 'experienced' | null
          primary_concern: 'legal' | 'financial' | 'marketing' | 'product' | 'time' | null
          current_step: number
          steps_completed: number[]
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name?: string | null
          business_category?: 'tech_saas' | 'service' | 'ecommerce' | 'local' | null
          current_stage?: 'idea' | 'planning' | 'started' | null
          state_code?: string | null
          primary_goals?: string[]
          timeline?: 'asap' | 'soon' | 'later' | 'exploring' | null
          team_size?: number | null
          funding_approach?: 'personal_savings' | 'investment' | 'loan' | 'multiple' | 'none' | null
          previous_experience?: 'first_business' | 'experienced' | null
          primary_concern?: 'legal' | 'financial' | 'marketing' | 'product' | 'time' | null
          current_step?: number
          steps_completed?: number[]
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string | null
          business_category?: 'tech_saas' | 'service' | 'ecommerce' | 'local' | null
          current_stage?: 'idea' | 'planning' | 'started' | null
          state_code?: string | null
          primary_goals?: string[]
          timeline?: 'asap' | 'soon' | 'later' | 'exploring' | null
          team_size?: number | null
          funding_approach?: 'personal_savings' | 'investment' | 'loan' | 'multiple' | 'none' | null
          previous_experience?: 'first_business' | 'experienced' | null
          primary_concern?: 'legal' | 'financial' | 'marketing' | 'product' | 'time' | null
          current_step?: number
          steps_completed?: number[]
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'onboarding_sessions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      waitlist_signups: {
        Row: {
          id: string
          email: string
          first_name: string
          stage: string | null
          email_opt_in: boolean
          signed_up_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          stage?: string | null
          email_opt_in: boolean
          signed_up_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          stage?: string | null
          email_opt_in?: boolean
          signed_up_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      calculate_confidence_score: {
        Args: {
          p_user_id: string
          p_business_id?: string | null
        }
        Returns: Json
      }
      get_hero_task: {
        Args: {
          p_user_id: string
          p_business_id?: string | null
        }
        Returns: string | null
      }
      update_hero_task: {
        Args: {
          p_user_id: string
          p_business_id?: string | null
        }
        Returns: void
      }
    }
    Enums: {
      business_type: 'LLC' | 'CORPORATION' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP'
      business_status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
      task_status: 'pending' | 'in_progress' | 'completed' | 'skipped'
      task_phase: 'ideation' | 'legal' | 'financial' | 'launch_prep'
      task_type: 'wizard' | 'checklist' | 'tool' | 'education' | 'external'
      business_category: 'tech_saas' | 'service' | 'ecommerce' | 'local'
      current_stage: 'idea' | 'planning' | 'started'
      timeline: 'asap' | 'soon' | 'later' | 'exploring'
      funding_approach: 'personal_savings' | 'investment' | 'loan' | 'multiple' | 'none'
      previous_experience: 'first_business' | 'experienced'
      primary_concern: 'legal' | 'financial' | 'marketing' | 'product' | 'time'
    }
  }
}
