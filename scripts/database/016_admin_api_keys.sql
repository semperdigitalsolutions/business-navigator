-- Admin API Keys Table
-- Issue #192: Platform-level API keys for AI providers
-- Epic 9: Admin/platform key management
--
-- Security Model:
-- This table stores encrypted API keys for platform-wide use.
-- Keys are encrypted using AES-256-GCM in the backend service (see backend/src/utils/crypto.ts).
-- The encrypted_key column stores: base64(iv + authTag + ciphertext)
-- Decryption requires the API_KEY_ENCRYPTION_KEY environment variable.
--
-- Access Control:
-- - RLS is enabled but NO policies are created for authenticated users
-- - Only the service role (backend) can read/write this table
-- - Admin users access keys through authenticated API endpoints, not directly

-- ============================================
-- Admin API Keys Table
-- Stores encrypted API keys for AI providers
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Provider identifier: openai, anthropic, openrouter
    provider TEXT NOT NULL,

    -- Last 4 characters of the key for display purposes (e.g., "...sk-xxxx")
    -- This allows admins to identify which key is stored without exposing it
    key_identifier TEXT NOT NULL,

    -- AES-256-GCM encrypted API key
    -- Format: base64(iv[16] + authTag[16] + ciphertext)
    -- Encryption/decryption handled by backend/src/utils/crypto.ts
    encrypted_key TEXT NOT NULL,

    -- Whether this key is currently active and should be used
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamp of last usage (updated by backend when key is used)
    last_used_at TIMESTAMPTZ,

    -- Admin user who created this key (for audit trail)
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Standard timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Only one key per provider (can be updated/rotated)
    CONSTRAINT admin_api_keys_provider_unique UNIQUE (provider),

    -- Validate provider is one of the supported values
    CONSTRAINT admin_api_keys_provider_check CHECK (
        provider IN ('openai', 'anthropic', 'openrouter')
    )
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Index on provider for quick lookups when fetching active key
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_provider
    ON public.admin_api_keys(provider);

-- Composite index for common query pattern: active key by provider
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_provider_active
    ON public.admin_api_keys(provider, is_active)
    WHERE is_active = TRUE;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS - this is critical for security
ALTER TABLE public.admin_api_keys ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: No policies are created for 'authenticated' or 'anon' roles.
-- This means regular users cannot access this table directly via Supabase client.
-- Only the service role (used by backend) bypasses RLS and can access this table.
--
-- Admin users manage keys through authenticated API endpoints that:
-- 1. Verify the user has admin privileges
-- 2. Use the service role client to perform operations
-- 3. Handle encryption/decryption in the backend service

-- ============================================
-- Trigger for updated_at timestamp
-- ============================================
CREATE TRIGGER update_admin_api_keys_updated_at
    BEFORE UPDATE ON public.admin_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE public.admin_api_keys IS
    'Platform-level API keys for AI providers (OpenAI, Anthropic, OpenRouter). Keys are AES-256-GCM encrypted. Access restricted to service role only.';

COMMENT ON COLUMN public.admin_api_keys.provider IS
    'AI provider identifier: openai, anthropic, or openrouter';

COMMENT ON COLUMN public.admin_api_keys.key_identifier IS
    'Last 4 characters of the API key for display (e.g., "...xxxx"). Allows identification without exposure.';

COMMENT ON COLUMN public.admin_api_keys.encrypted_key IS
    'AES-256-GCM encrypted API key. Format: base64(iv[16 bytes] + authTag[16 bytes] + ciphertext). See backend/src/utils/crypto.ts for encryption implementation.';

COMMENT ON COLUMN public.admin_api_keys.is_active IS
    'Whether this key should be used. Allows disabling without deletion.';

COMMENT ON COLUMN public.admin_api_keys.last_used_at IS
    'Timestamp of last API call using this key. Updated by backend service.';

COMMENT ON COLUMN public.admin_api_keys.created_by IS
    'UUID of admin user who created this key. References auth.users with ON DELETE SET NULL for audit trail preservation.';

-- ============================================
-- Grant permissions
-- ============================================

-- No grants to 'authenticated' role - only service role should access
-- The service role automatically bypasses RLS

-- Grant to service_role explicitly for clarity (though it has superuser-like access)
GRANT ALL ON public.admin_api_keys TO service_role;
