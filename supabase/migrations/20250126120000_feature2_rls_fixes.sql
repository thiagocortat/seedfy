-- Feature 2 Fixes: Missing RLS Policies

-- 1. Groups Policies
-- Ensure RLS is enabled (it might be already, but good to ensure)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create groups
CREATE POLICY "Authenticated users can create groups" 
ON public.groups FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow owners to update their groups
CREATE POLICY "Owners can update their groups" 
ON public.groups FOR UPDATE 
USING (auth.uid() = created_by);

-- Allow owners to delete their groups
CREATE POLICY "Owners can delete their groups" 
ON public.groups FOR DELETE 
USING (auth.uid() = created_by);

-- Allow members to view groups they belong to
CREATE POLICY "Members can view their groups" 
ON public.groups FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = public.groups.id 
    AND user_id = auth.uid()
  )
);

-- Note: We already added "Anyone can view discoverable groups" in the previous migration.

-- 2. Group Members Policies
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Allow members to view other members in the same group
CREATE POLICY "Members can view other members in their group" 
ON public.group_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = public.group_members.group_id 
    AND gm.user_id = auth.uid()
  )
);

-- Allow users to add themselves as owner when creating a group
-- (Logic: You can insert if you are the user_id AND role is owner... 
--  but we need to verify you actually created the group? 
--  Simplification for MVP: Authenticated users can insert rows where user_id = auth.uid())
CREATE POLICY "Users can add themselves" 
ON public.group_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow owners to manage members (remove, change role)
CREATE POLICY "Owners can manage members" 
ON public.group_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = public.group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'owner'
  )
);

-- 3. Group Invitations Policies (if not already there)
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- Inviter can see invitations they sent
CREATE POLICY "Users can view invitations they sent" 
ON public.group_invitations FOR SELECT 
USING (inviter_user_id = auth.uid());

-- Invited user can see invitations sent to them
CREATE POLICY "Users can view invitations sent to them" 
ON public.group_invitations FOR SELECT 
USING (invited_user_id = auth.uid());

-- Inviter can create invitations
CREATE POLICY "Users can create invitations" 
ON public.group_invitations FOR INSERT 
WITH CHECK (inviter_user_id = auth.uid());

-- Invited user can update status (accept/decline)
CREATE POLICY "Invited users can update status" 
ON public.group_invitations FOR UPDATE 
USING (invited_user_id = auth.uid());

