-- Feature 2: Group Discovery and Join Requests

-- 1. Update groups table
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS discoverable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS join_policy TEXT DEFAULT 'invite_only' CHECK (join_policy IN ('request_to_join', 'invite_only'));

-- 2. Create group_join_requests table
CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  requester_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied', 'canceled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by_user_id UUID REFERENCES public.users(id)
);

-- Unique index to ensure only one pending request per user per group
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_join_requests_unique_pending 
ON public.group_join_requests (group_id, requester_user_id) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_group_join_requests_group_status ON public.group_join_requests(group_id, status);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_user_status ON public.group_join_requests(requester_user_id, status);

-- 3. RLS Policies

-- Enable RLS
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- Groups: Allow read if discoverable
CREATE POLICY "Anyone can view discoverable groups" 
ON public.groups FOR SELECT 
USING (discoverable = true AND join_policy = 'request_to_join');

-- Group Join Requests Policies

-- Requester can view their own join requests
CREATE POLICY "Users can view their own join requests" 
ON public.group_join_requests FOR SELECT 
USING (auth.uid() = requester_user_id);

-- Requester can create join requests
CREATE POLICY "Users can create join requests" 
ON public.group_join_requests FOR INSERT 
WITH CHECK (
  auth.uid() = requester_user_id AND
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = group_id AND discoverable = true AND join_policy = 'request_to_join'
  )
);

-- Requester can cancel their own pending requests
CREATE POLICY "Users can cancel their own pending requests" 
ON public.group_join_requests FOR UPDATE 
USING (auth.uid() = requester_user_id AND status = 'pending')
WITH CHECK (status = 'canceled');

-- Owners can view requests for their groups
CREATE POLICY "Owners can view requests for their groups" 
ON public.group_join_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = public.group_join_requests.group_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Owners can update (approve/deny) via direct update if needed, but we prefer RPC.
-- Adding this policy allows the RPC (executed with SECURITY DEFINER) to work, 
-- or if we decide to do it client-side (though RPC is safer for atomicity).
CREATE POLICY "Owners can resolve requests" 
ON public.group_join_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = public.group_join_requests.group_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- 4. RPC for Atomic Approval
CREATE OR REPLACE FUNCTION resolve_join_request(
  request_id UUID,
  action TEXT -- 'approved' or 'denied'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id UUID;
  v_requester_id UUID;
  v_current_status TEXT;
BEGIN
  -- Get request details
  SELECT group_id, requester_user_id, status 
  INTO v_group_id, v_requester_id, v_current_status
  FROM public.group_join_requests
  WHERE id = request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_current_status <> 'pending' THEN
    RAISE EXCEPTION 'Request is not pending';
  END IF;

  -- Verify Caller is Owner
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = v_group_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update Request
  UPDATE public.group_join_requests
  SET 
    status = action,
    resolved_at = now(),
    resolved_by_user_id = auth.uid()
  WHERE id = request_id;

  -- If Approved, Add to Members
  IF action = 'approved' THEN
    INSERT INTO public.group_members (group_id, user_id, role, joined_at)
    VALUES (v_group_id, v_requester_id, 'member', now())
    ON CONFLICT (group_id, user_id) DO NOTHING; -- Idempotency
  END IF;
END;
$$;
