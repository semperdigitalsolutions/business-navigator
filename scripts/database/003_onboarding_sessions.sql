-- Onboarding Sessions Table
-- Stores user responses to the 7-step onboarding wizard
-- Week 2: Epic 1 - Authentication & Onboarding

-- Create enum types for onboarding
CREATE TYPE business_category AS ENUM ('tech_saas', 'service', 'ecommerce', 'local');
CREATE TYPE current_stage AS ENUM ('idea', 'planning', 'started');
CREATE TYPE timeline AS ENUM ('asap', 'soon', 'later', 'exploring');
CREATE TYPE funding_approach AS ENUM ('personal_savings', 'investment', 'loan', 'multiple', 'none');
CREATE TYPE previous_experience AS ENUM ('first_business', 'experienced');
CREATE TYPE primary_concern AS ENUM ('legal', 'financial', 'marketing', 'product', 'time');

-- Onboarding sessions table
CREATE TABLE IF NOT EXISTS public.onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Step 1: Business Name (optional at this stage)
    business_name TEXT CHECK (business_name IS NULL OR LENGTH(business_name) BETWEEN 1 AND 100),

    -- Step 2: Business Category & Stage
    business_category business_category,
    current_stage current_stage,

    -- Step 3: State Selection
    state_code CHAR(2) CHECK (
        state_code IN (
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
        )
    ),

    -- Step 4: Primary Goals (multi-select, stored as array)
    primary_goals TEXT[] DEFAULT '{}' CHECK (array_length(primary_goals, 1) IS NULL OR array_length(primary_goals, 1) BETWEEN 1 AND 5),

    -- Step 5: Timeline
    timeline timeline,

    -- Step 6: Team Size
    team_size INTEGER CHECK (team_size IS NULL OR (team_size >= 1 AND team_size <= 1000)),

    -- Step 7: Funding & Experience & Concerns
    funding_approach funding_approach,
    previous_experience previous_experience,
    primary_concern primary_concern,

    -- Progress tracking
    current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 7),
    steps_completed INTEGER[] DEFAULT '{}' CHECK (array_length(steps_completed, 1) IS NULL OR array_length(steps_completed, 1) <= 7),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id ON public.onboarding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_completed ON public.onboarding_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_created_at ON public.onboarding_sessions(created_at DESC);

-- Row Level Security
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding session"
    ON public.onboarding_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own onboarding session"
    ON public.onboarding_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding session"
    ON public.onboarding_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding session"
    ON public.onboarding_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_onboarding_sessions_updated_at
    BEFORE UPDATE ON public.onboarding_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update completed_at when completed becomes true
CREATE OR REPLACE FUNCTION update_onboarding_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_completed_at_trigger
    BEFORE UPDATE ON public.onboarding_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_completed_at();

-- Grant permissions
GRANT ALL ON public.onboarding_sessions TO authenticated;

-- Comment for documentation
COMMENT ON TABLE public.onboarding_sessions IS 'Week 2: User responses to 7-step onboarding wizard for business formation';
