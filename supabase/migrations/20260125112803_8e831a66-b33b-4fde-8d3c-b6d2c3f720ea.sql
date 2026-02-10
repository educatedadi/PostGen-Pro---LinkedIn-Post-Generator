-- Create usage_tracking table for anonymous and authenticated users
CREATE TABLE public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id)
);

-- Enable Row Level Security
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read their own session data (by session_id)
CREATE POLICY "Users can read own session usage"
  ON public.usage_tracking
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert usage tracking (for anonymous sessions)
CREATE POLICY "Anyone can insert usage tracking"
  ON public.usage_tracking
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update usage tracking (for incrementing count)
CREATE POLICY "Anyone can update usage tracking"
  ON public.usage_tracking
  FOR UPDATE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_usage_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_usage_tracking_updated_at();

-- Create function to check and increment usage (used by edge function)
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(
  p_session_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_max_free_generations INTEGER DEFAULT 3
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record usage_tracking%ROWTYPE;
  v_can_generate BOOLEAN;
  v_remaining INTEGER;
BEGIN
  -- Try to get existing record
  SELECT * INTO v_record FROM usage_tracking WHERE session_id = p_session_id;
  
  IF NOT FOUND THEN
    -- Create new record
    INSERT INTO usage_tracking (session_id, user_id, generation_count)
    VALUES (p_session_id, p_user_id, 1)
    RETURNING * INTO v_record;
    
    RETURN json_build_object(
      'can_generate', true,
      'generation_count', 1,
      'remaining', p_max_free_generations - 1,
      'is_authenticated', p_user_id IS NOT NULL
    );
  END IF;
  
  -- Check if authenticated (unlimited) or within limit
  v_can_generate := (p_user_id IS NOT NULL) OR (v_record.generation_count < p_max_free_generations);
  
  IF v_can_generate THEN
    -- Increment count
    UPDATE usage_tracking 
    SET generation_count = generation_count + 1,
        user_id = COALESCE(p_user_id, user_id)
    WHERE session_id = p_session_id
    RETURNING * INTO v_record;
  END IF;
  
  v_remaining := GREATEST(0, p_max_free_generations - v_record.generation_count);
  
  RETURN json_build_object(
    'can_generate', v_can_generate,
    'generation_count', v_record.generation_count,
    'remaining', v_remaining,
    'is_authenticated', p_user_id IS NOT NULL OR v_record.user_id IS NOT NULL
  );
END;
$$;

-- Create function to link anonymous usage to authenticated user
CREATE OR REPLACE FUNCTION public.link_anonymous_usage(
  p_session_id TEXT,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE usage_tracking 
  SET user_id = p_user_id
  WHERE session_id = p_session_id AND user_id IS NULL;
END;
$$;