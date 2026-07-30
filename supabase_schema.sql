-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sessions table (speech practice sessions)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'rhythm-lab', 'daily-games'
  drill_id TEXT,
  drill_name TEXT,
  transcript TEXT,
  audio_url TEXT,
  analysis JSONB,
  xp_gained INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Friends table (social connections)
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'accepted', -- 'pending', 'accepted'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 4. Weekly XP table (for leaderboard reset)
CREATE TABLE weekly_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- e.g., '2024-05-13' (Monday)
  xp INTEGER DEFAULT 0,
  UNIQUE(user_id, week_start_date)
);

-- 5. Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view; authenticated users can create/update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create profile data before an email-confirmed session exists. The function is
-- not exposed through the Data API and runs only from the auth.users trigger.
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_username TEXT;
BEGIN
  profile_username := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'username', ''),
    SPLIT_PART(COALESCE(NEW.email, 'speaker'), '@', 1) || '_' || LEFT(NEW.id::TEXT, 6)
  );

  INSERT INTO public.profiles (id, username, full_name, language)
  VALUES (
    NEW.id,
    profile_username,
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'language', ''), 'en')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.weekly_xp (user_id, week_start_date, xp)
  VALUES (NEW.id, DATE_TRUNC('week', CURRENT_DATE)::DATE, 0)
  ON CONFLICT (user_id, week_start_date) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION private.handle_new_auth_user();

-- Sessions: Only user can view/manage own sessions
CREATE POLICY "Users can manage own sessions" ON sessions FOR ALL USING (auth.uid() = user_id);

-- Friends: Only user can view/manage own friends
CREATE POLICY "Users can manage own friends" ON friends FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Weekly XP: Anyone can view (for leaderboard), only user can update
CREATE POLICY "Weekly XP viewable by everyone" ON weekly_xp FOR SELECT USING (true);
CREATE POLICY "Users can update own weekly XP" ON weekly_xp FOR ALL USING (auth.uid() = user_id);

-- Achievements: Anyone can view, only user can update
CREATE POLICY "Achievements viewable by everyone" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can update own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
