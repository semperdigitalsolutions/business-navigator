-- Add task_type column to task_templates
-- Week 3: Epic 3 - Task System

-- Create task type enum
DO $$ BEGIN
    CREATE TYPE task_type AS ENUM ('wizard', 'checklist', 'tool', 'education', 'external');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add task_type column to task_templates
ALTER TABLE public.task_templates
    ADD COLUMN IF NOT EXISTS task_type task_type NOT NULL DEFAULT 'education';

-- Add icon column for task display
ALTER TABLE public.task_templates
    ADD COLUMN IF NOT EXISTS icon TEXT;

-- Update existing task templates with appropriate types
-- Ideation tasks (typically education or wizard)
UPDATE public.task_templates SET task_type = 'wizard', icon = '💡' WHERE title ILIKE '%business structure%';
UPDATE public.task_templates SET task_type = 'wizard', icon = '📝' WHERE title ILIKE '%business name%';
UPDATE public.task_templates SET task_type = 'checklist', icon = '🌐' WHERE title ILIKE '%domain name%';

-- Legal tasks (typically wizard or external)
UPDATE public.task_templates SET task_type = 'external', icon = '📄' WHERE title ILIKE '%file formation%';
UPDATE public.task_templates SET task_type = 'external', icon = '🏛️' WHERE title ILIKE '%EIN%';
UPDATE public.task_templates SET task_type = 'wizard', icon = '📋' WHERE title ILIKE '%operating agreement%';
UPDATE public.task_templates SET task_type = 'checklist', icon = '📜' WHERE title ILIKE '%licenses%';
UPDATE public.task_templates SET task_type = 'wizard', icon = '🛡️' WHERE title ILIKE '%insurance%';
UPDATE public.task_templates SET task_type = 'external', icon = '📊' WHERE title ILIKE '%annual report%';

-- Financial tasks (typically wizard or tool)
UPDATE public.task_templates SET task_type = 'wizard', icon = '🏦' WHERE title ILIKE '%bank account%';
UPDATE public.task_templates SET task_type = 'external', icon = '💰' WHERE title ILIKE '%state taxes%';
UPDATE public.task_templates SET task_type = 'wizard', icon = '📈' WHERE title ILIKE '%accounting system%';
UPDATE public.task_templates SET task_type = 'tool', icon = '📉' WHERE title ILIKE '%financial projections%';
UPDATE public.task_templates SET task_type = 'wizard', icon = '💵' WHERE title ILIKE '%tax strategy%';

-- Launch prep tasks
UPDATE public.task_templates SET task_type = 'checklist', icon = '📁' WHERE title ILIKE '%record-keeping%';

-- Comments
COMMENT ON COLUMN public.task_templates.task_type IS 'Task interaction pattern: wizard, checklist, tool, education, or external';
COMMENT ON COLUMN public.task_templates.icon IS 'Emoji icon for task display';
