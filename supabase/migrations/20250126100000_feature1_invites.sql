-- Create group_invitations table
CREATE TABLE IF NOT EXISTS public.group_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  inviter_user_id UUID NOT NULL REFERENCES public.users(id),
  invited_user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  
  -- Unique constraint to prevent duplicate pending invites
  CONSTRAINT unique_pending_invite UNIQUE NULLS NOT DISTINCT (group_id, invited_user_id, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON public.group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_user ON public.group_invitations(invited_user_id, status);

-- Enable RLS
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. View invitations: User can see invites where they are the invited person
CREATE POLICY "Users can view their own invitations" 
ON public.group_invitations 
FOR SELECT 
USING (auth.uid() = invited_user_id);

-- 2. Create invitations: Only group owners can create invitations
-- Note: This assumes we can check group ownership easily. 
-- We'll use a EXISTS clause to check if the auth user is an owner of the group.
CREATE POLICY "Group owners can create invitations" 
ON public.group_invitations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_invitations.group_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- 3. Update invitations: Only the invited user can update status (accept/decline)
-- Or the owner can revoke (optional v1.1, but good to have safety)
CREATE POLICY "Invited users can update their invitation status" 
ON public.group_invitations 
FOR UPDATE 
USING (auth.uid() = invited_user_id);

-- Functions (RPCs)

-- Search user by email (Secure search)
-- Returns minimal info to avoid exposing all users
CREATE OR REPLACE FUNCTION public.search_user_by_email(search_email TEXT)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  avatar_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name as display_name,
    u.photo_url as avatar_url
  FROM public.users u
  WHERE LOWER(u.email) = LOWER(search_email)
  LIMIT 1;
END;
$$;

-- Accept Invitation Transaction
CREATE OR REPLACE FUNCTION public.accept_group_invitation(p_invite_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite RECORD;
  v_existing_member RECORD;
BEGIN
  -- 1. Get and lock the invitation
  SELECT * INTO v_invite 
  FROM public.group_invitations 
  WHERE id = p_invite_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  -- 2. Verify permission (caller must be the invited user)
  IF v_invite.invited_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to accept this invitation';
  END IF;

  -- 3. Verify status
  IF v_invite.status != 'pending' THEN
    RAISE EXCEPTION 'Invitation is no longer pending';
  END IF;

  -- 4. Check if already a member (idempotency)
  SELECT * INTO v_existing_member
  FROM public.group_members
  WHERE group_id = v_invite.group_id AND user_id = v_invite.invited_user_id;

  IF FOUND THEN
    -- Already a member, just mark invite as accepted if not already
    UPDATE public.group_invitations
    SET status = 'accepted', responded_at = now()
    WHERE id = p_invite_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Already a member');
  END IF;

  -- 5. Insert into group_members
  INSERT INTO public.group_members (group_id, user_id, role, joined_at)
  VALUES (v_invite.group_id, v_invite.invited_user_id, 'member', now());

  -- 6. Update invitation status
  UPDATE public.group_invitations
  SET status = 'accepted', responded_at = now()
  WHERE id = p_invite_id;

  -- 7. Log activity (optional, but good for consistency)
  INSERT INTO public.group_activity (group_id, type, message, created_at)
  VALUES (
    v_invite.group_id, 
    'joined', 
    (SELECT name FROM public.users WHERE id = v_invite.invited_user_id) || ' joined via invite', 
    now()
  );

  RETURN jsonb_build_object('success', true);
END;
$$;
