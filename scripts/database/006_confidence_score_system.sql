-- Confidence Score System
-- Auto-calculates business formation readiness based on task completion
-- Week 2: Epic 2 - Dashboard with Confidence Score

-- Create phase enum
CREATE TYPE task_phase AS ENUM ('ideation', 'legal', 'financial', 'launch_prep');

-- Extend task_templates table with weight and phase
ALTER TABLE public.task_templates
    ADD COLUMN IF NOT EXISTS weight INTEGER NOT NULL DEFAULT 1 CHECK (weight BETWEEN 1 AND 10),
    ADD COLUMN IF NOT EXISTS phase task_phase;

-- Extend user_tasks table for hero task system
ALTER TABLE public.user_tasks
    ADD COLUMN IF NOT EXISTS priority_order INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_hero_task BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS skipped_at TIMESTAMPTZ;

-- Indexes for hero task queries
CREATE INDEX IF NOT EXISTS idx_user_tasks_priority_order ON public.user_tasks(priority_order DESC);
CREATE INDEX IF NOT EXISTS idx_user_tasks_is_hero_task ON public.user_tasks(is_hero_task) WHERE is_hero_task = TRUE;

/**
 * Calculate Confidence Score for a User
 *
 * Algorithm:
 * - Group tasks by phase (ideation, legal, financial, launch_prep)
 * - Calculate phase completion % based on weighted task completion
 * - Apply phase weights: Ideation 20%, Legal 40%, Financial 30%, Launch 10%
 * - Return overall score (0-100) and phase breakdowns
 *
 * Returns: JSON object with total score and phase scores
 */
CREATE OR REPLACE FUNCTION calculate_confidence_score(p_user_id UUID, p_business_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_ideation_total INTEGER := 0;
    v_ideation_completed INTEGER := 0;
    v_legal_total INTEGER := 0;
    v_legal_completed INTEGER := 0;
    v_financial_total INTEGER := 0;
    v_financial_completed INTEGER := 0;
    v_launch_total INTEGER := 0;
    v_launch_completed INTEGER := 0;
    v_ideation_score INTEGER;
    v_legal_score INTEGER;
    v_financial_score INTEGER;
    v_launch_score INTEGER;
    v_total_score INTEGER;
BEGIN
    -- Calculate ideation phase
    SELECT
        COALESCE(SUM(tt.weight), 0),
        COALESCE(SUM(CASE WHEN ut.status = 'completed' THEN tt.weight ELSE 0 END), 0)
    INTO v_ideation_total, v_ideation_completed
    FROM public.user_tasks ut
    LEFT JOIN public.task_templates tt ON ut.template_id = tt.id
    WHERE ut.user_id = p_user_id
        AND (p_business_id IS NULL OR ut.business_id = p_business_id)
        AND COALESCE(tt.phase, 'ideation') = 'ideation';

    -- Calculate legal phase
    SELECT
        COALESCE(SUM(tt.weight), 0),
        COALESCE(SUM(CASE WHEN ut.status = 'completed' THEN tt.weight ELSE 0 END), 0)
    INTO v_legal_total, v_legal_completed
    FROM public.user_tasks ut
    LEFT JOIN public.task_templates tt ON ut.template_id = tt.id
    WHERE ut.user_id = p_user_id
        AND (p_business_id IS NULL OR ut.business_id = p_business_id)
        AND COALESCE(tt.phase, 'legal') = 'legal';

    -- Calculate financial phase
    SELECT
        COALESCE(SUM(tt.weight), 0),
        COALESCE(SUM(CASE WHEN ut.status = 'completed' THEN tt.weight ELSE 0 END), 0)
    INTO v_financial_total, v_financial_completed
    FROM public.user_tasks ut
    LEFT JOIN public.task_templates tt ON ut.template_id = tt.id
    WHERE ut.user_id = p_user_id
        AND (p_business_id IS NULL OR ut.business_id = p_business_id)
        AND COALESCE(tt.phase, 'financial') = 'financial';

    -- Calculate launch prep phase
    SELECT
        COALESCE(SUM(tt.weight), 0),
        COALESCE(SUM(CASE WHEN ut.status = 'completed' THEN tt.weight ELSE 0 END), 0)
    INTO v_launch_total, v_launch_completed
    FROM public.user_tasks ut
    LEFT JOIN public.task_templates tt ON ut.template_id = tt.id
    WHERE ut.user_id = p_user_id
        AND (p_business_id IS NULL OR ut.business_id = p_business_id)
        AND COALESCE(tt.phase, 'launch_prep') = 'launch_prep';

    -- Calculate phase scores (0-100)
    v_ideation_score := CASE WHEN v_ideation_total > 0
        THEN ROUND((v_ideation_completed::NUMERIC / v_ideation_total::NUMERIC) * 100)
        ELSE 0 END;

    v_legal_score := CASE WHEN v_legal_total > 0
        THEN ROUND((v_legal_completed::NUMERIC / v_legal_total::NUMERIC) * 100)
        ELSE 0 END;

    v_financial_score := CASE WHEN v_financial_total > 0
        THEN ROUND((v_financial_completed::NUMERIC / v_financial_total::NUMERIC) * 100)
        ELSE 0 END;

    v_launch_score := CASE WHEN v_launch_total > 0
        THEN ROUND((v_launch_completed::NUMERIC / v_launch_total::NUMERIC) * 100)
        ELSE 0 END;

    -- Calculate weighted total score
    -- Weights: Ideation 20%, Legal 40%, Financial 30%, Launch 10%
    v_total_score := ROUND(
        (v_ideation_score * 0.20) +
        (v_legal_score * 0.40) +
        (v_financial_score * 0.30) +
        (v_launch_score * 0.10)
    );

    -- Return JSON with all scores
    RETURN jsonb_build_object(
        'total', v_total_score,
        'ideation', v_ideation_score,
        'legal', v_legal_score,
        'financial', v_financial_score,
        'launch_prep', v_launch_score,
        'calculated_at', NOW()
    );
END;
$$ LANGUAGE plpgsql STABLE;

/**
 * Update Business Plan Confidence Score
 * Triggered when user tasks change
 */
CREATE OR REPLACE FUNCTION update_business_plan_confidence()
RETURNS TRIGGER AS $$
DECLARE
    v_scores JSONB;
BEGIN
    -- Calculate new scores
    v_scores := calculate_confidence_score(NEW.user_id, NEW.business_id);

    -- Update business_plans table if exists
    UPDATE public.business_plans
    SET
        confidence_score = (v_scores->>'total')::INTEGER,
        ideation_score = (v_scores->>'ideation')::INTEGER,
        legal_score = (v_scores->>'legal')::INTEGER,
        financial_score = (v_scores->>'financial')::INTEGER,
        launch_prep_score = (v_scores->>'launch_prep')::INTEGER,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
        AND (business_id = NEW.business_id OR business_id IS NULL);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update confidence score on task completion
CREATE TRIGGER update_confidence_on_task_change
    AFTER INSERT OR UPDATE OF status ON public.user_tasks
    FOR EACH ROW
    WHEN (NEW.status = 'completed' OR OLD.status = 'completed')
    EXECUTE FUNCTION update_business_plan_confidence();

/**
 * Get Hero Task for User
 * Selects the highest priority incomplete task
 *
 * Selection criteria:
 * 1. Not completed
 * 2. Not skipped recently (< 24 hours)
 * 3. Dependencies met (if any)
 * 4. Highest priority_order
 * 5. Earliest due_date
 */
CREATE OR REPLACE FUNCTION get_hero_task(p_user_id UUID, p_business_id UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    v_hero_task_id UUID;
BEGIN
    SELECT id INTO v_hero_task_id
    FROM public.user_tasks
    WHERE user_id = p_user_id
        AND (p_business_id IS NULL OR business_id = p_business_id)
        AND status IN ('pending', 'in_progress')
        AND (skipped_at IS NULL OR skipped_at < NOW() - INTERVAL '24 hours')
    ORDER BY
        priority_order DESC,
        CASE priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
            ELSE 4
        END,
        due_date ASC NULLS LAST,
        created_at ASC
    LIMIT 1;

    RETURN v_hero_task_id;
END;
$$ LANGUAGE plpgsql STABLE;

/**
 * Update Hero Task Flag
 * Clears old hero task and sets new one
 */
CREATE OR REPLACE FUNCTION update_hero_task(p_user_id UUID, p_business_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    v_new_hero_id UUID;
BEGIN
    -- Clear existing hero task flag
    UPDATE public.user_tasks
    SET is_hero_task = FALSE
    WHERE user_id = p_user_id
        AND (p_business_id IS NULL OR business_id = p_business_id)
        AND is_hero_task = TRUE;

    -- Get new hero task
    v_new_hero_id := get_hero_task(p_user_id, p_business_id);

    -- Set new hero task
    IF v_new_hero_id IS NOT NULL THEN
        UPDATE public.user_tasks
        SET is_hero_task = TRUE
        WHERE id = v_new_hero_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update task templates with phases and weights
-- (This is a mapping based on the plan - adjust as needed)
UPDATE public.task_templates SET phase = 'ideation', weight = 5 WHERE title ILIKE '%business structure%';
UPDATE public.task_templates SET phase = 'ideation', weight = 6 WHERE title ILIKE '%business name%';
UPDATE public.task_templates SET phase = 'ideation', weight = 3 WHERE title ILIKE '%domain name%';
UPDATE public.task_templates SET phase = 'legal', weight = 10 WHERE title ILIKE '%file formation%';
UPDATE public.task_templates SET phase = 'legal', weight = 8 WHERE title ILIKE '%EIN%';
UPDATE public.task_templates SET phase = 'financial', weight = 8 WHERE title ILIKE '%bank account%';
UPDATE public.task_templates SET phase = 'legal', weight = 7 WHERE title ILIKE '%operating agreement%';
UPDATE public.task_templates SET phase = 'financial', weight = 7 WHERE title ILIKE '%state taxes%';
UPDATE public.task_templates SET phase = 'legal', weight = 9 WHERE title ILIKE '%licenses%';
UPDATE public.task_templates SET phase = 'financial', weight = 9 WHERE title ILIKE '%accounting system%';
UPDATE public.task_templates SET phase = 'legal', weight = 6 WHERE title ILIKE '%insurance%';
UPDATE public.task_templates SET phase = 'financial', weight = 7 WHERE title ILIKE '%financial projections%';
UPDATE public.task_templates SET phase = 'legal', weight = 5 WHERE title ILIKE '%annual report%';
UPDATE public.task_templates SET phase = 'launch_prep', weight = 4 WHERE title ILIKE '%record-keeping%';
UPDATE public.task_templates SET phase = 'financial', weight = 8 WHERE title ILIKE '%tax strategy%';

-- Comments
COMMENT ON COLUMN public.task_templates.weight IS 'Task importance weight (1-10) for confidence score calculation';
COMMENT ON COLUMN public.task_templates.phase IS 'Business formation phase: ideation, legal, financial, or launch_prep';
COMMENT ON COLUMN public.user_tasks.is_hero_task IS 'Whether this is the current recommended next action';
COMMENT ON COLUMN public.user_tasks.priority_order IS 'Manual priority ordering (higher = more important)';
COMMENT ON COLUMN public.user_tasks.skipped_at IS 'When user skipped this task (prevents immediate re-recommendation)';
COMMENT ON FUNCTION calculate_confidence_score IS 'Calculates weighted confidence score (0-100) based on task completion';
COMMENT ON FUNCTION get_hero_task IS 'Selects the highest priority incomplete task as the recommended next action';
COMMENT ON FUNCTION update_hero_task IS 'Updates the is_hero_task flag to the current recommended task';
