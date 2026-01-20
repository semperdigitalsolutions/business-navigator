/**
 * PostgreSQL Checkpointer for LangGraph
 * Saves conversation state to Supabase PostgreSQL database
 */
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres'
import {
  BaseCheckpointSaver,
  type Checkpoint,
  type CheckpointListOptions,
  type CheckpointMetadata,
  type CheckpointTuple,
  type PendingWrite,
} from '@langchain/langgraph-checkpoint'
import type { RunnableConfig } from '@langchain/core/runnables'
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
 * Implements BaseCheckpointSaver interface following LangGraph's MemorySaver pattern
 */
export class MemoryCheckpointer extends BaseCheckpointSaver {
  // Nested structure for checkpoint management: thread_id -> checkpoint_ns -> checkpoint_id -> [[type, data], [type, data], parentId]
  private storage: Record<
    string,
    Record<string, Record<string, [[string, Uint8Array], [string, Uint8Array], string | undefined]>>
  > = {}

  // Track pending writes: combined key -> [taskId, channel, value]
  private writes: Record<string, [string, string, unknown][]> = {}

  /**
   * Store a checkpoint
   */
  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata
  ): Promise<RunnableConfig> {
    const thread_id = config.configurable?.thread_id
    const checkpoint_ns = config.configurable?.checkpoint_ns ?? ''
    const checkpoint_id = checkpoint.id

    if (!thread_id) {
      throw new Error('thread_id required')
    }

    // Initialize nested structure if needed
    if (!this.storage[thread_id]) {
      this.storage[thread_id] = {}
    }
    if (!this.storage[thread_id][checkpoint_ns]) {
      this.storage[thread_id][checkpoint_ns] = {}
    }

    // Serialize and store
    const checkpointData = await this.serde.dumpsTyped(checkpoint)
    const metadataData = await this.serde.dumpsTyped(metadata)

    this.storage[thread_id][checkpoint_ns][checkpoint_id] = [
      checkpointData,
      metadataData,
      config.configurable?.checkpoint_id, // parent checkpoint ID
    ]

    return {
      configurable: {
        thread_id,
        checkpoint_ns,
        checkpoint_id,
      },
    }
  }

  /**
   * Retrieve a checkpoint tuple by config
   */
  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const thread_id = config.configurable?.thread_id
    const checkpoint_ns = config.configurable?.checkpoint_ns ?? ''
    let checkpoint_id = config.configurable?.checkpoint_id

    if (!thread_id) {
      return undefined
    }

    // Case 1: Get specific checkpoint
    if (checkpoint_id) {
      const saved = this.storage[thread_id]?.[checkpoint_ns]?.[checkpoint_id]
      if (!saved) {
        return undefined
      }

      const [checkpointData, metadataData, parentCheckpointId] = saved
      const [checkpointType, checkpointBytes] = checkpointData
      const [metadataType, metadataBytes] = metadataData

      return {
        config,
        checkpoint: await this.serde.loadsTyped(checkpointType, checkpointBytes),
        metadata: await this.serde.loadsTyped(metadataType, metadataBytes),
        parentConfig: parentCheckpointId
          ? {
              configurable: {
                thread_id,
                checkpoint_ns,
                checkpoint_id: parentCheckpointId,
              },
            }
          : undefined,
        pendingWrites: this.getPendingWrites(thread_id, checkpoint_ns, checkpoint_id),
      }
    }

    // Case 2: Get latest checkpoint
    const checkpoints = this.storage[thread_id]?.[checkpoint_ns]
    if (!checkpoints) {
      return undefined
    }

    // Sort checkpoint IDs to get latest (newest first)
    checkpoint_id = Object.keys(checkpoints).sort((a, b) => b.localeCompare(a))[0]
    if (!checkpoint_id) {
      return undefined
    }

    const saved = checkpoints[checkpoint_id]
    const [checkpointData, metadataData, parentCheckpointId] = saved
    const [checkpointType, checkpointBytes] = checkpointData
    const [metadataType, metadataBytes] = metadataData

    return {
      config: {
        configurable: {
          thread_id,
          checkpoint_ns,
          checkpoint_id,
        },
      },
      checkpoint: await this.serde.loadsTyped(checkpointType, checkpointBytes),
      metadata: await this.serde.loadsTyped(metadataType, metadataBytes),
      parentConfig: parentCheckpointId
        ? {
            configurable: {
              thread_id,
              checkpoint_ns,
              checkpoint_id: parentCheckpointId,
            },
          }
        : undefined,
      pendingWrites: this.getPendingWrites(thread_id, checkpoint_ns, checkpoint_id),
    }
  }

  /**
   * Get pending writes for a checkpoint
   */
  private getPendingWrites(
    thread_id: string,
    checkpoint_ns: string,
    checkpoint_id: string
  ): [string, string, unknown][] {
    const key = `${thread_id}:${checkpoint_ns}:${checkpoint_id}`
    return this.writes[key] || []
  }

  /**
   * Store pending writes for a checkpoint
   */
  async putWrites(config: RunnableConfig, writes: PendingWrite[], _taskId: string): Promise<void> {
    const thread_id = config.configurable?.thread_id
    const checkpoint_ns = config.configurable?.checkpoint_ns ?? ''
    const checkpoint_id = config.configurable?.checkpoint_id

    if (!thread_id || !checkpoint_id) {
      return
    }

    const key = `${thread_id}:${checkpoint_ns}:${checkpoint_id}`
    if (!this.writes[key]) {
      this.writes[key] = []
    }

    // Store writes as 3-tuples [taskId, channel, value]
    // Since PendingWrite doesn't include the value, we use undefined as a placeholder
    for (const [taskId, channel] of writes) {
      this.writes[key].push([taskId as string, channel as string, undefined])
    }
  }

  /**
   * Delete a thread and all its checkpoints
   */
  async deleteThread(threadId: string): Promise<void> {
    delete this.storage[threadId]
    // Clean up writes for this thread
    const keysToDelete = Object.keys(this.writes).filter((key) => key.startsWith(`${threadId}:`))
    for (const key of keysToDelete) {
      delete this.writes[key]
    }
  }

  /**
   * List checkpoints as async generator
   */
  async *list(
    config: RunnableConfig,
    _options?: CheckpointListOptions
  ): AsyncGenerator<CheckpointTuple> {
    const thread_id = config.configurable?.thread_id
    const checkpoint_ns = config.configurable?.checkpoint_ns ?? ''

    if (!thread_id) {
      return
    }

    const checkpoints = this.storage[thread_id]?.[checkpoint_ns]
    if (!checkpoints) {
      return
    }

    // Sort checkpoint IDs (newest first)
    const sortedIds = Object.keys(checkpoints).sort((a, b) => b.localeCompare(a))

    for (const checkpoint_id of sortedIds) {
      const [checkpointData, metadataData, parentCheckpointId] = checkpoints[checkpoint_id]
      const [checkpointType, checkpointBytes] = checkpointData
      const [metadataType, metadataBytes] = metadataData

      yield {
        config: {
          configurable: {
            thread_id,
            checkpoint_ns,
            checkpoint_id,
          },
        },
        checkpoint: await this.serde.loadsTyped(checkpointType, checkpointBytes),
        metadata: await this.serde.loadsTyped(metadataType, metadataBytes),
        parentConfig: parentCheckpointId
          ? {
              configurable: {
                thread_id,
                checkpoint_ns,
                checkpoint_id: parentCheckpointId,
              },
            }
          : undefined,
        pendingWrites: this.getPendingWrites(thread_id, checkpoint_ns, checkpoint_id),
      }
    }
  }
}

/**
 * Get checkpointer with fallback to in-memory for development
 */
export async function getCheckpointerWithFallback(): Promise<PostgresSaver | MemoryCheckpointer> {
  try {
    return await getCheckpointer()
  } catch {
    console.warn('⚠️  Using in-memory checkpointer (conversations will not persist)')
    return new MemoryCheckpointer()
  }
}
