-- PuffiFlow Supabase PostgreSQL Database Schema (BYOS & Extended Metadata)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (BYOS Architecture)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE NOT NULL,
  youtube_refresh_token TEXT, -- Encrypted AES-256 string
  r2_account_id TEXT,         -- Encrypted AES-256 string
  r2_access_key_id TEXT,     -- Encrypted AES-256 string
  r2_secret_access_key TEXT, -- Encrypted AES-256 string
  r2_bucket_name TEXT,       -- Plaintext bucket name
  r2_public_domain TEXT,     -- Plaintext public R2 domain
  storage_setup_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- Indexes for efficient background publishing & user lookups
CREATE INDEX IF NOT EXISTS idx_jobs_status_scheduled ON public.jobs (status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users (google_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Service role full access to jobs" ON public.jobs FOR ALL USING (true);
