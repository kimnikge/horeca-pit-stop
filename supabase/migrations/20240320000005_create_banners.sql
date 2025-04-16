-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for querying active banners efficiently
CREATE INDEX IF NOT EXISTS idx_banners_active_dates ON public.banners (is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_banners_priority ON public.banners (priority);

-- Add RLS (Row Level Security)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access to active banners
CREATE POLICY "Allow public read access to active banners" 
  ON public.banners 
  FOR SELECT 
  USING (
    is_active = true AND 
    starts_at <= now() AND 
    (expires_at IS NULL OR expires_at > now())
  );

-- Allow authenticated admins to perform all operations
CREATE POLICY "Allow admins full control"
  ON public.banners
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users
    WHERE id IN (
      SELECT user_id FROM public.profiles
      WHERE role = 'admin'
    )
  ));

-- Add function to get active banners
CREATE OR REPLACE FUNCTION public.get_active_banners()
RETURNS SETOF public.banners
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.banners
  WHERE 
    is_active = true AND 
    starts_at <= now() AND 
    (expires_at IS NULL OR expires_at > now())
  ORDER BY priority DESC, created_at DESC;
$$;

-- Automatic updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp(); 