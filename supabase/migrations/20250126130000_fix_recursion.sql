-- Fix Infinite Recursion in group_members Policy

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Members can view other members in their group" ON public.group_members;

-- 2. Create a SECURITY DEFINER function to get the current user's group IDs
-- This function bypasses RLS on group_members because it runs with the privileges of the creator (postgres/superuser)
CREATE OR REPLACE FUNCTION public.get_my_group_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid();
$$;

-- 3. Re-create the policy using the secure function
CREATE POLICY "Members can view other members in their group" 
ON public.group_members FOR SELECT 
USING (
  group_id IN (SELECT public.get_my_group_ids())
);
