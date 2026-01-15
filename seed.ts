import { SupabaseClient } from '@supabase/supabase-js';

const CHURCHES = [
  { name: 'Igreja da Cidade', city: 'São José dos Campos', state: 'SP', logo_url: 'https://placehold.co/200/4F46E5/FFFFFF?text=IC' },
  { name: 'Lagoinha', city: 'Belo Horizonte', state: 'MG', logo_url: 'https://placehold.co/200/E11D48/FFFFFF?text=L' },
  { name: 'Bola de Neve', city: 'São Paulo', state: 'SP', logo_url: 'https://placehold.co/200/F59E0B/FFFFFF?text=BN' },
];

const CONTENT = [
  { type: 'podcast', title: 'Café com Deus', description: 'Comece seu dia com fé.', cover_url: 'https://placehold.co/400/4F46E5/FFFFFF?text=Cafe', media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', is_live: false },
  { type: 'video', title: 'Culto Ao Vivo', description: 'Assista agora.', cover_url: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Live', media_url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', is_live: true },
  { type: 'music', title: 'Adoração', description: 'Músicas para orar.', cover_url: 'https://placehold.co/400/8B5CF6/FFFFFF?text=Worship', media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', is_live: false },
];

export const seedGlobalData = async (supabase: SupabaseClient) => {
  console.log('Seeding global data (Churches & Content)...');
  
  // Seed Churches
  const { error: churchError } = await supabase.from('churches').insert(CHURCHES);
  if (churchError) console.error('Error seeding churches:', churchError);
  else console.log('Churches seeded.');

  // Seed Content
  const { error: contentError } = await supabase.from('content_items').insert(CONTENT);
  if (contentError) console.error('Error seeding content:', contentError);
  else console.log('Content seeded.');
};

export const seedUserData = async (supabase: SupabaseClient, userId: string) => {
  if (!userId) {
    console.error('User ID required for user data seeding');
    return;
  }
  
  console.log(`Seeding data for user ${userId}...`);

  // Create a Group
  const { data: group, error: groupError } = await supabase.from('groups').insert({
    name: 'Célula Jovem',
    image_url: 'https://placehold.co/300/10B981/FFFFFF?text=Célula',
    created_by: userId
  }).select().single();

  if (groupError || !group) {
    console.error('Error creating group:', groupError);
    return;
  }
  console.log('Group created:', group.id);

  // Add user to group
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: userId,
    role: 'owner'
  });

  // Create a Challenge
  const { error: challengeError } = await supabase.from('challenges').insert({
    group_id: group.id,
    created_by: userId,
    type: 'reading',
    title: 'Leitura de Salmos',
    duration_days: 30,
    start_date: new Date().toISOString(),
    status: 'active'
  });

  if (challengeError) console.error('Error creating challenge:', challengeError);
  else console.log('Challenge created.');
};
