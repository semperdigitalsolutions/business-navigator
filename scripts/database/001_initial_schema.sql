-- Business Navigator Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for businesses
CREATE TYPE business_type AS ENUM ('LLC', 'CORPORATION', 'SOLE_PROPRIETORSHIP', 'PARTNERSHIP');
CREATE TYPE business_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- ============================================
-- Users Table (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Businesses Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type business_type NOT NULL,
    state TEXT NOT NULL CHECK (LENGTH(state) = 2), -- Two-letter state code
    status business_status NOT NULL DEFAULT 'DRAFT',
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Business Formation Sessions Table
-- Tracks AI agent interactions and progress
-- ============================================
CREATE TABLE IF NOT EXISTS public.business_formation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agent_responses JSONB DEFAULT '[]'::jsonb,
    current_step TEXT NOT NULL DEFAULT 'initial',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Businesses
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON public.businesses(created_at DESC);

-- Formation Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_business_id ON public.business_formation_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.business_formation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON public.business_formation_sessions(completed);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_formation_sessions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Businesses table policies
CREATE POLICY "Users can view own businesses"
    ON public.businesses FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own businesses"
    ON public.businesses FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own businesses"
    ON public.businesses FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own businesses"
    ON public.businesses FOR DELETE
    USING (auth.uid() = owner_id);

-- Formation sessions policies
CREATE POLICY "Users can view own formation sessions"
    ON public.business_formation_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own formation sessions"
    ON public.business_formation_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own formation sessions"
    ON public.business_formation_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own formation sessions"
    ON public.business_formation_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Triggers for updated_at timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.business_formation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to create user profile on sign up
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Grant necessary permissions
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.businesses TO authenticated;
GRANT ALL ON public.business_formation_sessions TO authenticated;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE public.users IS 'User profiles for Business Navigator';
COMMENT ON TABLE public.businesses IS 'Business entities created by users';
COMMENT ON TABLE public.business_formation_sessions IS 'AI-assisted business formation sessions';
