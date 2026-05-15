-- Sunjin Layer Performance Manager - Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Farm User'
    CHECK (role IN ('Admin', 'Manager', 'Consultant', 'Farm User')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    'Farm User'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Customers (farms / 거래처)
CREATE TABLE public.customers (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  region TEXT,
  contact_name TEXT,
  status TEXT NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (true);

-- 3. Flocks (계군)
CREATE TABLE public.flocks (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  breed TEXT NOT NULL,
  placement_date DATE NOT NULL,
  initial_birds INTEGER NOT NULL CHECK (initial_birds > 0),
  status TEXT NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Completed', 'Culled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.flocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view flocks"
  ON public.flocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert flocks"
  ON public.flocks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update flocks"
  ON public.flocks FOR UPDATE
  TO authenticated
  USING (true);

-- 4. Daily Records (일별 기록)
CREATE TABLE public.daily_records (
  id SERIAL PRIMARY KEY,
  flock_id INTEGER NOT NULL REFERENCES public.flocks(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  previous_birds INTEGER NOT NULL CHECK (previous_birds >= 0),
  mortality INTEGER NOT NULL DEFAULT 0 CHECK (mortality >= 0),
  current_birds INTEGER NOT NULL CHECK (current_birds >= 0),
  feed_kg NUMERIC(10,2) NOT NULL CHECK (feed_kg >= 0),
  egg_count INTEGER NOT NULL DEFAULT 0 CHECK (egg_count >= 0),
  hd_ratio NUMERIC(6,2),
  hh_ratio NUMERIC(6,2),
  avg_feed_g NUMERIC(8,2),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(flock_id, record_date)
);

ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view daily_records"
  ON public.daily_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert daily_records"
  ON public.daily_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily_records"
  ON public.daily_records FOR UPDATE
  TO authenticated
  USING (true);

-- Index for fast lookups
CREATE INDEX idx_daily_records_flock_date
  ON public.daily_records(flock_id, record_date DESC);

CREATE INDEX idx_flocks_customer
  ON public.flocks(customer_id);
