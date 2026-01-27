-- Week 3: Add draft_data and completion_data columns for task save/complete endpoints
-- Issue #59: POST /api/tasks/:id/complete - stores completion_data
-- Issue #60: POST /api/tasks/:id/save - stores draft_data

ALTER TABLE public.user_tasks
    ADD COLUMN IF NOT EXISTS draft_data JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS completion_data JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_tasks.draft_data IS 'Auto-saved draft data for in-progress tasks';
COMMENT ON COLUMN public.user_tasks.completion_data IS 'Data submitted when task was completed';
