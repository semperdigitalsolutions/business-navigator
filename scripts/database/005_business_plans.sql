-- Business Plans Table
-- Stores AI-generated business plans and confidence scores
-- Week 2: Epic 1 - Onboarding Completion & Epic 2 - Dashboard

-- Business plans table
CREATE TABLE IF NOT EXISTS public.business_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    onboarding_session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE SET NULL,

    -- AI-generated business plan content
    plan_summary TEXT,
    recommended_entity_type business_type,
    recommended_state CHAR(2),
    executive_summary JSONB DEFAULT '{}',
    phase_recommendations JSONB DEFAULT '{}',

    -- Confidence score system (0-100)
    -- Overall confidence in business formation readiness
    confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),

    -- Phase-specific scores (weighted components)
    ideation_score INTEGER DEFAULT 0 CHECK (ideation_score BETWEEN 0 AND 100),
    legal_score INTEGER DEFAULT 0 CHECK (legal_score BETWEEN 0 AND 100),
    financial_score INTEGER DEFAULT 0 CHECK (financial_score BETWEEN 0 AND 100),
    launch_prep_score INTEGER DEFAULT 0 CHECK (launch_prep_score BETWEEN 0 AND 100),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_plans_user_id ON public.business_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_business_plans_business_id ON public.business_plans(business_id);
CREATE INDEX IF NOT EXISTS idx_business_plans_confidence_score ON public.business_plans(confidence_score);
CREATE INDEX IF NOT EXISTS idx_business_plans_created_at ON public.business_plans(created_at DESC);

-- Row Level Security
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business plan"
    ON public.business_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own business plan"
    ON public.business_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business plan"
    ON public.business_plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business plan"
    ON public.business_plans FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_business_plans_updated_at
    BEFORE UPDATE ON public.business_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.business_plans TO authenticated;

-- Comments
COMMENT ON TABLE public.business_plans IS 'Week 2: AI-generated business plans with confidence scoring';
COMMENT ON COLUMN public.business_plans.confidence_score IS 'Overall readiness score (0-100) - weighted average of phase scores';
COMMENT ON COLUMN public.business_plans.ideation_score IS 'Ideation phase completion (20% weight)';
COMMENT ON COLUMN public.business_plans.legal_score IS 'Legal compliance completion (40% weight)';
COMMENT ON COLUMN public.business_plans.financial_score IS 'Financial setup completion (30% weight)';
COMMENT ON COLUMN public.business_plans.launch_prep_score IS 'Launch preparation completion (10% weight)';
