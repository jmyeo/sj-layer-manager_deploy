-- Sunjin Layer Performance Manager - Schema V3
-- Run this in your Supabase SQL Editor AFTER schema-v2.sql

-- 1. Add contact_phone to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- 2. Add flock_name to flocks
ALTER TABLE public.flocks ADD COLUMN IF NOT EXISTS flock_name TEXT;

-- 3. Add created_by to daily_records
ALTER TABLE public.daily_records ADD COLUMN IF NOT EXISTS created_by TEXT;
