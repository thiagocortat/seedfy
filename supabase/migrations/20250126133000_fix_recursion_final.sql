-- Fix Infinite Recursion (Comprehensive)

-- 1. Helper function to check ownership securely (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_group_owner(check_group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_id = check_group_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  );
END;
$$;

-- 2. Fix group_members policies
-- Drop potentially recursive policies
DROP POLICY IF EXISTS "Owners can manage members" ON public.group_members;

-- Create separated, non-recursive policies for owners
CREATE POLICY "Owners can update members" 
ON public.group_members FOR UPDATE
USING (public.is_group_owner(group_id));

CREATE POLICY "Owners can delete members" 
ON public.group_members FOR DELETE
USING (public.is_group_owner(group_id));

-- 3. Fix group_join_requests policies
-- These were querying group_members directly, which triggers RLS. 
-- Using the security definer function avoids the trigger chain.
DROP POLICY IF EXISTS "Owners can view requests for their groups" ON public.group_join_requests;
DROP POLICY IF EXISTS "Owners can resolve requests" ON public.group_join_requests;

CREATE POLICY "Owners can view requests for their groups" 
ON public.group_join_requests FOR SELECT 
USING (public.is_group_owner(group_id));

CREATE POLICY "Owners can resolve requests" 
ON public.group_join_requests FOR UPDATE 
USING (public.is_group_owner(group_id));

-- 4. Optimization: Update groups policy to use get_my_group_ids if possible?
-- The current "Members can view their groups" uses EXISTS(SELECT ... group_members).
-- This triggers group_members RLS. 
-- Now that group_members RLS is safe (via get_my_group_ids and is_group_owner), it should be fine.
-- But we can optimize it to avoid the join if we want, but let's stick to fixing recursion first.
