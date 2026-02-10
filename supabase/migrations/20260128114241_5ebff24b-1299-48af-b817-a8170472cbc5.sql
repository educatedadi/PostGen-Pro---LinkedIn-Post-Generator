-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert usage tracking" ON public.usage_tracking;
DROP POLICY IF EXISTS "Anyone can update usage tracking" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can read own session usage" ON public.usage_tracking;

-- The usage_tracking table is accessed via SECURITY DEFINER functions (check_and_increment_usage, link_anonymous_usage)
-- which bypass RLS. Direct table access should be restricted.
-- However, we need to allow the service role to operate, which it does by default.
-- For client-side access, we restrict to authenticated users viewing their own data only.

-- Users can only read their own usage records (either by user_id match or session_id from their client)
-- Note: Anonymous users won't be able to read directly, but they access via the SECURITY DEFINER functions
CREATE POLICY "Authenticated users can read own usage" 
ON public.usage_tracking 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- No direct INSERT/UPDATE from clients - all modifications go through SECURITY DEFINER functions
-- This prevents manipulation of usage counts directly