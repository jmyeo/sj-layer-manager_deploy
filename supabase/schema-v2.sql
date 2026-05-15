-- Sunjin Layer Performance Manager - Schema V2
-- Run this in your Supabase SQL Editor AFTER schema.sql

-- 1. User-Customer assignment mapping
CREATE TABLE IF NOT EXISTS public.user_customers (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES public.customers(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, customer_id)
);

ALTER TABLE public.user_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view user_customers"
  ON public.user_customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage user_customers"
  ON public.user_customers FOR ALL
  TO authenticated
  USING (true);

-- 2. Add region to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region TEXT;

-- 3. Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and Manager can view audit_logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert audit_logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_audit_logs_table_record
  ON public.audit_logs(table_name, record_id);

CREATE INDEX idx_audit_logs_created
  ON public.audit_logs(created_at DESC);
