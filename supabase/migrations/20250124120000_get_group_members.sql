-- Function to get group members securely
-- Returns minimal profile information (name, photo_url) along with role and joined_at date.
-- Access Control: Only members of the group can execute this function.

-- Drop function first to allow return type changes
drop function if exists public.get_group_members(uuid);

create or replace function public.get_group_members(p_group_id uuid)
returns table (
  member_user_id uuid,
  member_role text,
  member_joined_at timestamptz,
  member_name text,
  member_photo_url text
)
language plpgsql
security definer
as $$
begin
  -- Check if the requesting user is a member of the group
  if not exists (
    select 1 
    from public.group_members 
    where group_id = p_group_id 
    and user_id = auth.uid()
  ) then
    raise exception 'Access denied: You are not a member of this group.';
  end if;

  -- Return members with their profile data
  return query
  select
    gm.user_id as member_user_id,
    gm.role as member_role,
    gm.joined_at as member_joined_at,
    u.name as member_name,
    u.photo_url as member_photo_url
  from public.group_members gm
  join public.users u on gm.user_id = u.id
  where gm.group_id = p_group_id
  order by
    case when gm.role = 'owner' then 1 else 2 end asc, -- Owner first
    u.name asc; -- Then alphabetical
end;
$$;
