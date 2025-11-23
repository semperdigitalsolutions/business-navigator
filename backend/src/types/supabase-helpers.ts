/**
 * Supabase type helpers to work around type inference issues
 */
import type { Database } from './database.js'

// Table row types
export type UserApiKey = Database['public']['Tables']['user_api_keys']['Row']
export type UserApiKeyInsert = Database['public']['Tables']['user_api_keys']['Insert']
export type UserApiKeyUpdate = Database['public']['Tables']['user_api_keys']['Update']

export type AgentSession = Database['public']['Tables']['agent_sessions']['Row']
export type AgentSessionInsert = Database['public']['Tables']['agent_sessions']['Insert']
export type AgentSessionUpdate = Database['public']['Tables']['agent_sessions']['Update']

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']
export type ChatMessageUpdate = Database['public']['Tables']['chat_messages']['Update']

export type UserTask = Database['public']['Tables']['user_tasks']['Row']
export type UserTaskInsert = Database['public']['Tables']['user_tasks']['Insert']
export type UserTaskUpdate = Database['public']['Tables']['user_tasks']['Update']

export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']
