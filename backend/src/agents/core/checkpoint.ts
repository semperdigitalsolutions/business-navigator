/**
 * PostgreSQL Checkpointer for LangGraph
 * Saves conversation state to Supabase PostgreSQL database
 */
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres'
import { env } from '@/config/env.js'
import { Pool } from 'pg'

let checkpointer: PostgresSaver | null = null
let pool: Pool | null = null

/**
 * Initialize the PostgreSQL checkpointer
 * Creates connection pool and PostgresSaver instance
 */
export async function initializeCheckpointer(): Promise<PostgresSaver> {
  if (checkpointer) {
    return checkpointer
  }

  if (!env.DATABASE_URL) {
    console.warn(
      '⚠️  DATABASE_URL not configured. Checkpointing disabled. Conversations will not persist.'
    )
    throw new Error('DATABASE_URL required for checkpoint persistence')
  }

  try {
    // Create PostgreSQL connection pool
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl:
        env.NODE_ENV === 'production'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    })

    // Test connection
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()

    // Create PostgresSaver instance
    checkpointer = PostgresSaver.fromConnString(env.DATABASE_URL)
    await checkpointer.setup()

    console.log('✅ PostgreSQL checkpointer initialized')
    return checkpointer
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL checkpointer:', error)
    throw error
  }
}

/**
 * Get the checkpointer instance
 * Initializes if not already initialized
 */
export async function getCheckpointer(): Promise<PostgresSaver> {
  if (!checkpointer) {
    return await initializeCheckpointer()
  }
  return checkpointer
}

/**
 * Close database connections
 */
export async function closeCheckpointer(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
  checkpointer = null
  console.log('✅ PostgreSQL checkpointer closed')
}

/**
 * In-memory checkpointer for development/testing when DATABASE_URL not available
 */
export class MemoryCheckpointer {
  private checkpoints: Map<string, any> = new Map()

  async put(config: any, checkpoint: any, metadata: any): Promise<void> {
    const key = `${config.configurable?.thread_id}_${config.configurable?.checkpoint_ns}`
    this.checkpoints.set(key, { checkpoint, metadata })
  }

  async get(config: any): Promise<any> {
    const key = `${config.configurable?.thread_id}_${config.configurable?.checkpoint_ns}`
    return this.checkpoints.get(key)?.checkpoint
  }

  async list(): Promise<any[]> {
    return Array.from(this.checkpoints.values())
  }
}

/**
 * Get checkpointer with fallback to in-memory for development
 */
export async function getCheckpointerWithFallback(): Promise<PostgresSaver | MemoryCheckpointer> {
  try {
    return await getCheckpointer()
  } catch (error) {
    console.warn('⚠️  Using in-memory checkpointer (conversations will not persist)')
    return new MemoryCheckpointer()
  }
}
