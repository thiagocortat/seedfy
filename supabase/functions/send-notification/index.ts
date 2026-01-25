// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

interface NotificationPayload {
  record: {
    id: string;
    group_id: string;
    type: string;
    message: string;
    created_at: string;
  };
  table: string;
  type: 'INSERT';
  schema: 'public';
}

serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json()
    
    // Only handle INSERT events on group_activity
    if (payload.type !== 'INSERT' || payload.table !== 'group_activity') {
      return new Response('Ignored', { status: 200 })
    }

    const { record } = payload
    
    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Get Group Details
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('name')
      .eq('id', record.group_id)
      .single()

    if (groupError || !group) {
      console.error('Error fetching group:', groupError)
      return new Response('Error fetching group', { status: 500 })
    }

    // 2. Get Group Members (to get their push tokens)
    // In a real app, we should exclude the user who triggered the activity (if available in record)
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        user_id,
        users (
          push_token
        )
      `)
      .eq('group_id', record.group_id)

    if (membersError || !members) {
      console.error('Error fetching members:', membersError)
      return new Response('Error fetching members', { status: 500 })
    }

    // 3. Filter valid tokens
    const pushTokens = members
      .map((m: any) => m.users?.push_token)
      .filter((token: string | null) => token && token.length > 0)

    if (pushTokens.length === 0) {
      return new Response('No push tokens found', { status: 200 })
    }

    // 4. Send Notifications via Expo
    const messages = pushTokens.map((token: string) => ({
      to: token,
      sound: 'default',
      title: group.name,
      body: record.message,
      data: { groupId: record.group_id },
    }))

    // Batch send to Expo (chunks of 100 recommended, keeping simple here)
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()
    console.log('Expo Push Response:', result)

    return new Response(JSON.stringify({ success: true, count: pushTokens.length }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
