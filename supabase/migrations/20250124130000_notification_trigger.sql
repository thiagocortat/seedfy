-- Trigger to call the send-notification Edge Function on new group activity

create or replace function public.handle_new_group_activity()
returns trigger
language plpgsql
security definer
as $$
begin
  perform
    net.http_post(
      url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-notification', -- Replace with your project URL
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}', -- Ideally handled via Vault or built-in hooks
      body := json_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW)
      )::jsonb
    );
  return new;
end;
$$;

-- Note: In Supabase, it is often easier to use "Database Webhooks" via the Dashboard UI 
-- to connect a Table Event (INSERT on group_activity) to an Edge Function.
-- This SQL is an example if using pg_net extension, but Dashboard setup is recommended for Edge Functions.
