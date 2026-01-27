/**
 * Environment configuration with Zod validation
 */
import { z } from 'zod'

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),

  // Encryption key for API keys (32 bytes / 64 hex chars recommended)
  // Optional at startup, but required when encrypting/decrypting API keys
  API_KEY_ENCRYPTION_KEY: z.string().min(32).optional(),

  // Database (for LangGraph checkpoints)
  DATABASE_URL: z.string().url().optional(),

  // AI/LLM - Default keys (can be overridden by user-provided keys)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  DEFAULT_LLM_MODEL: z.string().default('openai/gpt-4-turbo'),

  // CORS
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),

  // OAuth (Week 2)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OAUTH_REDIRECT_URI: z.string().url().optional(),
})

// Validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      process.exit(1)
    }
    throw error
  }
}

export const env = parseEnv()

export type Env = z.infer<typeof envSchema>
