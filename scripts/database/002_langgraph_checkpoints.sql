-- LangGraph Checkpoint Tables
-- These tables store conversation state for AI agents

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Checkpoints table - stores conversation state snapshots
CREATE TABLE IF NOT EXISTS public.checkpoints (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    type TEXT,
    checkpoint JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

-- Checkpoint writes table - stores pending writes for checkpoints
CREATE TABLE IF NOT EXISTS public.checkpoint_writes (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    idx INTEGER NOT NULL,
    channel TEXT NOT NULL,
    type TEXT,
    value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);

-- Checkpoint blobs table - stores large binary data
CREATE TABLE IF NOT EXISTS public.checkpoint_blobs (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    channel TEXT NOT NULL,
    version TEXT NOT NULL,
    type TEXT NOT NULL,
    blob BYTEA,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (thread_id, checkpoint_ns, channel, version)
);

-- Agent sessions table - tracks user conversations with agents
CREATE TABLE IF NOT EXISTS public.agent_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    thread_id TEXT NOT NULL UNIQUE,
    agent_type TEXT NOT NULL, -- 'triage', 'legal', 'financial', 'tasks'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed'
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat messages table - stores user/agent messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.agent_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User API keys table - stores encrypted API keys and model preferences
CREATE TABLE IF NOT EXISTS public.user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'openrouter', 'openai', 'anthropic'
    api_key_encrypted TEXT NOT NULL,
    preferred_model TEXT NOT NULL DEFAULT 'openai/gpt-4-turbo',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Task templates table - predefined tasks for business formation
CREATE TABLE IF NOT EXISTS public.task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'legal', 'financial', 'product', 'marketing', 'testing', 'analytics'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
    week_number INTEGER NOT NULL,
    estimated_hours INTEGER DEFAULT 0,
    dependencies JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User tasks table - user-specific task instances
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'blocked'
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkpoints_thread_id ON public.checkpoints(thread_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_created_at ON public.checkpoints(created_at);
CREATE INDEX IF NOT EXISTS idx_checkpoint_writes_thread_id ON public.checkpoint_writes(thread_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_blobs_thread_id ON public.checkpoint_blobs(thread_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON public.agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_thread_id ON public.agent_sessions(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON public.user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_business_id ON public.user_tasks(business_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON public.user_tasks(status);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_sessions_updated_at BEFORE UPDATE ON public.agent_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON public.user_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tasks_updated_at BEFORE UPDATE ON public.user_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Agent sessions
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent sessions"
    ON public.agent_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agent sessions"
    ON public.agent_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent sessions"
    ON public.agent_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Chat messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
    ON public.chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agent_sessions
            WHERE agent_sessions.id = chat_messages.session_id
            AND agent_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own chat messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agent_sessions
            WHERE agent_sessions.id = chat_messages.session_id
            AND agent_sessions.user_id = auth.uid()
        )
    );

-- User API keys
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
    ON public.user_api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys"
    ON public.user_api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
    ON public.user_api_keys FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
    ON public.user_api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- Task templates (public read)
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view task templates"
    ON public.task_templates FOR SELECT
    TO authenticated
    USING (true);

-- User tasks
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
    ON public.user_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
    ON public.user_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
    ON public.user_tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
    ON public.user_tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Seed task templates (15 core tasks for business formation)
INSERT INTO public.task_templates (title, description, category, priority, week_number, estimated_hours, dependencies) VALUES
('Choose Business Structure', 'Determine whether to form an LLC, Corporation, Sole Proprietorship, or Partnership based on your needs.', 'legal', 'high', 1, 2, '[]'),
('Select Business Name', 'Choose a unique, available business name and check trademark availability.', 'legal', 'high', 1, 3, '["Choose Business Structure"]'),
('Register Domain Name', 'Secure your business domain name and social media handles.', 'marketing', 'medium', 1, 1, '["Select Business Name"]'),
('File Formation Documents', 'File Articles of Organization (LLC) or Incorporation (Corp) with your state.', 'legal', 'high', 2, 4, '["Choose Business Structure", "Select Business Name"]'),
('Obtain EIN', 'Apply for an Employer Identification Number (EIN) from the IRS.', 'legal', 'high', 2, 1, '["File Formation Documents"]'),
('Open Business Bank Account', 'Establish a dedicated business bank account to separate personal and business finances.', 'financial', 'high', 2, 2, '["Obtain EIN"]'),
('Create Operating Agreement', 'Draft an operating agreement (LLC) or bylaws (Corporation) defining ownership and operations.', 'legal', 'medium', 3, 4, '["File Formation Documents"]'),
('Register for State Taxes', 'Register for state tax IDs and determine sales tax obligations.', 'financial', 'high', 3, 2, '["Obtain EIN"]'),
('Obtain Business Licenses', 'Research and obtain necessary federal, state, and local business licenses and permits.', 'legal', 'high', 3, 3, '["File Formation Documents"]'),
('Setup Accounting System', 'Choose and configure accounting software for bookkeeping and tax preparation.', 'financial', 'high', 4, 3, '["Open Business Bank Account"]'),
('Get Business Insurance', 'Research and purchase necessary business insurance (liability, workers comp, etc).', 'legal', 'medium', 4, 4, '["File Formation Documents"]'),
('Create Financial Projections', 'Develop 12-month financial projections including revenue, expenses, and cash flow.', 'financial', 'medium', 5, 6, '["Setup Accounting System"]'),
('File Initial Annual Report', 'Submit your first annual report to the state (requirements vary by state).', 'legal', 'medium', 6, 2, '["File Formation Documents"]'),
('Establish Record-Keeping System', 'Create a system for maintaining corporate records, minutes, and important documents.', 'legal', 'low', 6, 2, '["Create Operating Agreement"]'),
('Plan Tax Strategy', 'Consult with CPA to optimize tax structure and understand quarterly tax obligations.', 'financial', 'high', 7, 3, '["Setup Accounting System", "Register for State Taxes"]')
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.checkpoints IS 'LangGraph checkpoint storage for conversation state';
COMMENT ON TABLE public.checkpoint_writes IS 'Pending writes for LangGraph checkpoints';
COMMENT ON TABLE public.checkpoint_blobs IS 'Binary data storage for LangGraph checkpoints';
COMMENT ON TABLE public.agent_sessions IS 'User conversation sessions with AI agents';
COMMENT ON TABLE public.chat_messages IS 'Individual messages within agent sessions';
COMMENT ON TABLE public.user_api_keys IS 'User-provided API keys for LLM providers';
COMMENT ON TABLE public.task_templates IS 'Predefined task templates for business formation';
COMMENT ON TABLE public.user_tasks IS 'User-specific task instances';
