import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Load environment variables manually
const loadEnv = () => {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (e) {
    console.log('Could not load .env file, relying on process.env');
  }
};

loadEnv();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedHome() {
  console.log('Seeding Home Data (Groups & Challenges)...');

  // 1. Get a user to attach data to (usually the first one found)
  const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
  
  if (userError || !users || users.length === 0) {
    console.error('No users found. Please sign up in the app first.');
    return;
  }

  const userId = users[0].id;
  console.log(`Using User ID: ${userId}`);

  // 2. Create a Group
  console.log('Creating Group...');
  const { data: group, error: groupError } = await supabase.from('groups').insert({
    name: 'Early Birds Devotional',
    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop',
    created_by: userId
  }).select().single();

  if (groupError) {
    console.error('Error creating group:', groupError.message);
  } else {
    console.log(`Group created: ${group.id}`);

    // Add user to group
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      role: 'owner'
    });
  }

  // 3. Create a Challenge
  console.log('Creating Challenge...');
  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30);

  const { data: challenge, error: challengeError } = await supabase.from('challenges').insert({
    group_id: group?.id, // Link to group if created, else null (might fail constraint depending on schema)
    created_by: userId,
    type: 'reading',
    title: '30 Days of Proverbs',
    description: 'Read one chapter of Proverbs every day.',
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    status: 'active'
  }).select().single();

  if (challengeError) {
    console.error('Error creating challenge:', challengeError.message);
  } else {
    console.log(`Challenge created: ${challenge.id}`);
    
    // Add participant
    await supabase.from('challenge_participants').insert({
      challenge_id: challenge.id,
      user_id: userId,
      status: 'active',
      progress: 0
    });
  }
  
  console.log('Home seeding completed.');
}

seedHome().catch(console.error);
