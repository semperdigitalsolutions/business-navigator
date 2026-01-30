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
          subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise'
          is_admin: boolean
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
          subscription_tier?: 'free' | 'basic' | 'pro' | 'enterprise'
          is_admin?: boolean
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
          subscription_tier?: 'free' | 'basic' | 'pro' | 'enterprise'
          is_admin?: boolean
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
          skip_reason: string | null
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
          skip_reason?: string | null
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
          skip_reason?: string | null
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
      user_message_counts: {
        Row: {
          id: string
          user_id: string
          date: string
          message_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          message_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          message_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_message_counts_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      subscription_tiers: {
        Row: {
          id: string
          name: string
          slug: string
          monthly_credits: number
          price_cents: number
          features: Json
          is_default: boolean
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          monthly_credits: number
          price_cents: number
          features?: Json
          is_default?: boolean
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          monthly_credits?: number
          price_cents?: number
          features?: Json
          is_default?: boolean
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_models: {
        Row: {
          id: string
          provider: string
          model_id: string
          display_name: string
          description: string | null
          credits_per_message: number
          input_cost_per_1k: number
          output_cost_per_1k: number
          context_window: number
          max_output_tokens: number
          capabilities: Json
          is_active: boolean
          is_default: boolean
          min_tier: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider: string
          model_id: string
          display_name: string
          description?: string | null
          credits_per_message?: number
          input_cost_per_1k?: number
          output_cost_per_1k?: number
          context_window?: number
          max_output_tokens?: number
          capabilities?: Json
          is_active?: boolean
          is_default?: boolean
          min_tier?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider?: string
          model_id?: string
          display_name?: string
          description?: string | null
          credits_per_message?: number
          input_cost_per_1k?: number
          output_cost_per_1k?: number
          context_window?: number
          max_output_tokens?: number
          capabilities?: Json
          is_active?: boolean
          is_default?: boolean
          min_tier?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_min_tier'
            columns: ['min_tier']
            referencedRelation: 'subscription_tiers'
            referencedColumns: ['slug']
          },
        ]
      }
      user_credits: {
        Row: {
          id: string
          user_id: string
          balance: number
          lifetime_earned: number
          lifetime_spent: number
          last_refill_at: string | null
          next_refill_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          lifetime_earned?: number
          lifetime_spent?: number
          last_refill_at?: string | null
          next_refill_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          lifetime_earned?: number
          lifetime_spent?: number
          last_refill_at?: string | null
          next_refill_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_credits_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type:
            | 'tier_refill'
            | 'purchase'
            | 'bonus'
            | 'usage'
            | 'refund'
            | 'adjustment'
            | 'expiration'
          amount: number
          balance_before: number
          balance_after: number
          description: string | null
          metadata: Json
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type:
            | 'tier_refill'
            | 'purchase'
            | 'bonus'
            | 'usage'
            | 'refund'
            | 'adjustment'
            | 'expiration'
          amount: number
          balance_before: number
          balance_after: number
          description?: string | null
          metadata?: Json
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?:
            | 'tier_refill'
            | 'purchase'
            | 'bonus'
            | 'usage'
            | 'refund'
            | 'adjustment'
            | 'expiration'
          amount?: number
          balance_before?: number
          balance_after?: number
          description?: string | null
          metadata?: Json
          reference_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credit_transactions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          category: string
          is_public: boolean
          is_sensitive: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          category?: string
          is_public?: boolean
          is_sensitive?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          category?: string
          is_public?: boolean
          is_sensitive?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_api_keys: {
        Row: {
          id: string
          provider: string
          key_identifier: string
          encrypted_key: string
          is_active: boolean
          last_used_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider: string
          key_identifier: string
          encrypted_key: string
          is_active?: boolean
          last_used_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider?: string
          key_identifier?: string
          encrypted_key?: string
          is_active?: boolean
          last_used_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          id: string
          admin_user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'admin_audit_log_admin_user_id_fkey'
            columns: ['admin_user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      feature_flags: {
        Row: {
          id: string
          key: string
          name: string
          description: string | null
          is_enabled: boolean
          enabled_for_tiers: string[]
          enabled_for_users: string[]
          rollout_percentage: number
          metadata: Json
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          description?: string | null
          is_enabled?: boolean
          enabled_for_tiers?: string[]
          enabled_for_users?: string[]
          rollout_percentage?: number
          metadata?: Json
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
          description?: string | null
          is_enabled?: boolean
          enabled_for_tiers?: string[]
          enabled_for_users?: string[]
          rollout_percentage?: number
          metadata?: Json
          expires_at?: string | null
          created_at?: string
          updated_at?: string
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
      increment_user_message_count: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_user_message_count: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      is_admin: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      current_user_is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_feature_enabled: {
        Args: {
          p_feature_key: string
          p_user_id?: string | null
          p_user_tier?: string
        }
        Returns: boolean
      }
      get_user_features: {
        Args: {
          p_user_id: string
          p_user_tier?: string
        }
        Returns: {
          key: string
          name: string
          metadata: Json
        }[]
      }
      get_site_setting: {
        Args: {
          p_key: string
        }
        Returns: Json
      }
      set_site_setting: {
        Args: {
          p_key: string
          p_value: Json
          p_description?: string | null
          p_category?: string
          p_is_public?: boolean
          p_is_sensitive?: boolean
        }
        Returns: void
      }
      log_admin_action: {
        Args: {
          p_admin_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string | null
          p_details?: Json
          p_ip_address?: string | null
          p_user_agent?: string | null
        }
        Returns: string
      }
      spend_credits: {
        Args: {
          p_user_id: string
          p_model_id: string
          p_message_id?: string | null
        }
        Returns: {
          success: boolean
          credits_spent: number
          balance_after: number
          error_message: string | null
        }[]
      }
      add_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: string
          p_description?: string | null
          p_reference_id?: string | null
          p_metadata?: Json
        }
        Returns: {
          success: boolean
          credits_added: number
          balance_after: number
          error_message: string | null
        }[]
      }
      refill_tier_credits: {
        Args: {
          p_user_id?: string | null
        }
        Returns: {
          users_processed: number
          total_credits_added: number
        }[]
      }
      can_use_model: {
        Args: {
          p_user_id: string
          p_model_id: string
        }
        Returns: boolean
      }
      get_credit_summary: {
        Args: {
          p_user_id: string
        }
        Returns: Json
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
      subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise'
      credit_transaction_type:
        | 'tier_refill'
        | 'purchase'
        | 'bonus'
        | 'usage'
        | 'refund'
        | 'adjustment'
        | 'expiration'
      admin_action_type:
        | 'user_create'
        | 'user_update'
        | 'user_delete'
        | 'user_suspend'
        | 'user_unsuspend'
        | 'user_tier_change'
        | 'user_credit_adjustment'
        | 'api_key_create'
        | 'api_key_update'
        | 'api_key_delete'
        | 'api_key_rotate'
        | 'setting_create'
        | 'setting_update'
        | 'setting_delete'
        | 'feature_flag_create'
        | 'feature_flag_update'
        | 'feature_flag_delete'
        | 'ai_model_create'
        | 'ai_model_update'
        | 'ai_model_delete'
        | 'tier_create'
        | 'tier_update'
        | 'tier_delete'
        | 'system_maintenance_start'
        | 'system_maintenance_end'
        | 'system_migration_run'
        | 'system_backup_create'
    }
  }
}
