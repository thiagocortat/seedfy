import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Load environment variables manually if dotenv is not working as expected with expo structure
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
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; // Using anon key for simplicity, assuming policies allow insert for authenticated or public (if dev)

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key. Make sure .env is set or EXPO_PUBLIC_ variables are available.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Realistic Content Sources
const ASSETS = [
  {
    type: 'video',
    title: 'Morning Devotional: Faith & Patience',
    description: 'A short reflection on waiting for God\'s timing.',
    sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Reliable sample
    coverUrl: 'https://images.unsplash.com/photo-1507692049790-de58293a4697?q=80&w=1000&auto=format&fit=crop',
    fileName: 'devotional_video.mp4',
    coverName: 'devotional_cover.jpg'
  },
  {
    type: 'podcast',
    title: 'Weekly Wisdom: The Power of Community',
    description: 'Discussing why we need each other in our spiritual walk.',
    sourceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Example MP3
    coverUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop', // Group/Community
    fileName: 'podcast_community.mp3',
    coverName: 'podcast_cover.jpg'
  },
  {
    type: 'music',
    title: 'Worship Session: Quiet Time',
    description: 'Instrumental background for prayer and meditation.',
    sourceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // Calmer MP3
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop', // Music/Instrument
    fileName: 'worship_music.mp3',
    coverName: 'worship_cover.jpg'
  }
];

async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToSupabase(bucket: string, fileName: string, fileData: Buffer, contentType: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileData, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error(`Error uploading ${fileName}:`, error.message);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

async function seed() {
  console.log('Starting content seed with Supabase Storage...');

  // Try to create buckets if they don't exist (this might fail if no permissions, but we assume SQL was run or policies are open)
  // Actually, client-side bucket creation requires service_role key usually. We'll skip and assume they exist.
  
  // Clear existing content items to avoid duplicates
  console.log('Clearing old content...');
  const { error: deleteError } = await supabase.from('content_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  if (deleteError) console.warn('Could not clear table (might be empty or RLS):', deleteError.message);

  for (const asset of ASSETS) {
    console.log(`Processing: ${asset.title}`);

    try {
      // 1. Upload Media
      console.log(`  Downloading media: ${asset.sourceUrl}...`);
      const mediaBuffer = await downloadFile(asset.sourceUrl);
      const mediaMime = asset.type === 'video' ? 'video/mp4' : 'audio/mpeg';
      console.log(`  Uploading media to Supabase 'media' bucket...`);
      const mediaUrl = await uploadToSupabase('media', asset.fileName, mediaBuffer, mediaMime);

      // 2. Upload Cover
      console.log(`  Downloading cover: ${asset.coverUrl}...`);
      const coverBuffer = await downloadFile(asset.coverUrl);
      console.log(`  Uploading cover to Supabase 'covers' bucket...`);
      const coverUrl = await uploadToSupabase('covers', asset.coverName, coverBuffer, 'image/jpeg');

      // 3. Insert into Database
      console.log(`  Inserting record into database...`);
      
      // Use fallback URL if upload failed but we want to show content anyway (for demo purposes)
      // In production, we would fail strictly.
      const finalMediaUrl = mediaUrl; 
      const finalCoverUrl = coverUrl;

      const { error: insertError } = await supabase.from('content_items').insert({
        title: asset.title,
        description: asset.description,
        type: asset.type,
        media_url: finalMediaUrl,
        cover_url: finalCoverUrl,
        is_live: false, // Default to false for uploaded content
        play_count: Math.floor(Math.random() * 1000)
      });

      if (insertError) {
        console.error(`  Error inserting record: ${insertError.message}`);
      } else {
        console.log(`  Success!`);
      }

    } catch (err: any) {
      console.error(`  Failed to upload to storage for ${asset.title}:`, err.message);
      
      // Fallback: Insert with original URLs so user sees content even if storage setup failed
      console.log(`  Attempting fallback insert with remote URLs...`);
      const { error: fallbackError } = await supabase.from('content_items').insert({
        title: asset.title,
        description: asset.description,
        type: asset.type,
        media_url: asset.sourceUrl,
        cover_url: asset.coverUrl,
        is_live: false,
        play_count: Math.floor(Math.random() * 1000)
      });
      
      if (fallbackError) {
         console.error(`  Fallback insert failed: ${fallbackError.message}`);
      } else {
         console.log(`  Fallback insert success! Content is live (using remote URLs).`);
      }
    }
  }

  console.log('Seeding completed.');
}

seed().catch(console.error);
