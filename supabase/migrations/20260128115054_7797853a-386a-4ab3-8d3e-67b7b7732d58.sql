-- Block direct INSERT - all inserts go through check_and_increment_usage SECURITY DEFINER function
CREATE POLICY "No direct insert to usage tracking" 
ON public.usage_tracking 
FOR INSERT 
TO anon, authenticated
WITH CHECK (false);

-- Block direct UPDATE - all updates go through SECURITY DEFINER functions
CREATE POLICY "No direct update to usage tracking" 
ON public.usage_tracking 
FOR UPDATE 
TO anon, authenticated
USING (false);

-- Block direct DELETE - usage records should never be deleted by clients
CREATE POLICY "No direct delete to usage tracking" 
ON public.usage_tracking 
FOR DELETE 
TO anon, authenticated
USING (false);