import { supabase } from './supabase';

export interface JourneyTemplate {
  id: string;
  title: string;
  descriptionShort: string;
  descriptionLong?: string;
  coverImageUrl?: string;
  tags: string[];
  durationsSupported: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyChapter {
  id: string;
  journeyId: string;
  dayIndex: number;
  title: string;
  narrative: string;
  focus: string;
  practice: string;
  reflectionPrompt: string;
  prayer?: string;
  verseReference?: string;
  verseText?: string;
  createdAt: string;
  updatedAt: string;
}

export const journeyService = {
  async getActiveJourneys(): Promise<JourneyTemplate[]> {
    const { data, error } = await supabase
      .from('journey_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(mapJourneyFromSupabase);
  },

  async getJourneyById(id: string): Promise<JourneyTemplate | null> {
    const { data, error } = await supabase
      .from('journey_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return mapJourneyFromSupabase(data);
  },

  async getChapter(journeyId: string, dayIndex: number): Promise<JourneyChapter | null> {
    const { data, error } = await supabase
      .from('journey_chapter_templates')
      .select('*')
      .eq('journey_id', journeyId)
      .eq('day_index', dayIndex)
      .single();

    if (error) {
      // If code is PGRST116, it means no rows returned (which is valid if chapter doesn't exist)
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return mapChapterFromSupabase(data);
  },

  async getChapters(journeyId: string, limitDay?: number): Promise<JourneyChapter[]> {
    let query = supabase
      .from('journey_chapter_templates')
      .select('day_index, title, id, journey_id') // Fetch minimal data for trail list if needed, or all if needed. Let's fetch essential info.
      // Wait, PRD says TrailTab needs: day_index, title. 
      // But let's just select * for simplicity for now, or optimize.
      .select('*')
      .eq('journey_id', journeyId)
      .order('day_index', { ascending: true });

    if (limitDay) {
      query = query.lte('day_index', limitDay);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(mapChapterFromSupabase);
  }
};

// Helpers to map snake_case to camelCase
const mapJourneyFromSupabase = (data: any): JourneyTemplate => ({
  id: data.id,
  title: data.title,
  descriptionShort: data.description_short,
  descriptionLong: data.description_long,
  coverImageUrl: data.cover_image_url,
  tags: data.tags || [],
  durationsSupported: data.durations_supported || [],
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapChapterFromSupabase = (data: any): JourneyChapter => ({
  id: data.id,
  journeyId: data.journey_id,
  dayIndex: data.day_index,
  title: data.title,
  narrative: data.narrative,
  focus: data.focus,
  practice: data.practice,
  reflectionPrompt: data.reflection_prompt,
  prayer: data.prayer,
  verseReference: data.verse_reference,
  verseText: data.verse_text,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});
