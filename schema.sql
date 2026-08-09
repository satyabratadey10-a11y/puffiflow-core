-- PuffiFlow Supabase PostgreSQL Database Schema (BYOS, Dual-Storage & Auth Profiles)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Dual-Storage Architecture: Supabase Storage & Cloudflare R2)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  youtube_refresh_token TEXT, -- Encrypted AES-256 string
  r2_account_id TEXT,         -- Encrypted AES-256 string
  r2_access_key_id TEXT,     -- Encrypted AES-256 string
  r2_secret_access_key TEXT, -- Encrypted AES-256 string
  r2_bucket_name TEXT,       -- Plaintext bucket name
  r2_public_domain TEXT,     -- Plaintext public R2 domain
  storage_provider TEXT DEFAULT 'supabase', -- Options: 'supabase' | 'cloudflare_r2'
  storage_setup_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration for existing environments
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS storage_provider TEXT DEFAULT 'supabase';

-- 2. Jobs Table (Rich Video Metadata & Resolution Controls)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail_url TEXT,
  related_video_id TEXT,
  ai_enhancer_enabled BOOLEAN DEFAULT TRUE,
  target_resolution TEXT DEFAULT '4K',
  raw_video_url TEXT NOT NULL,
  processed_4k_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'PUBLISHED', 'FAILED')) DEFAULT 'QUEUED',
  scheduled_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Profiles Table (Referencing auth.users.id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient background publishing & user lookups
CREATE INDEX IF NOT EXISTS idx_jobs_status_scheduled ON public.jobs (status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users (google_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Service role full access to jobs" ON public.jobs FOR ALL USING (true);
CREATE POLICY "Service role full access to profiles" ON public.profiles FOR ALL USING (true);

-- User RLS policies for profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Trigger to auto-create profile on new user registration in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC Function: Narrow email existence check (Security Definer, returns boolean only)
CREATE OR REPLACE FUNCTION public.email_exists(check_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = lower(check_email)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon, authenticated;
