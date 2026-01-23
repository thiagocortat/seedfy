import { supabase } from './supabase';

export interface ChurchPost {
  id: string;
  title: string;
  excerpt?: string; // snippet do body
  body?: string;
  image_url?: string;
  link_url?: string;
  pinned: boolean;
  published_at: string;
  church_id: string;
}

export const churchPostsRepository = {
  async getRecentChurchPosts(churchId: string, limit = 3): Promise<ChurchPost[]> {
    const { data, error } = await supabase
      .from('church_posts')
      .select('id, title, excerpt, image_url, link_url, pinned, published_at, church_id')
      .eq('church_id', churchId)
      .eq('status', 'published')
      .order('pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent church posts:', error);
      throw error;
    }

    return data || [];
  },

  async getChurchPostsPaged(churchId: string, from: number, to: number): Promise<ChurchPost[]> {
    const { data, error } = await supabase
      .from('church_posts')
      .select('id, title, excerpt, body, image_url, link_url, pinned, published_at, church_id')
      .eq('church_id', churchId)
      .eq('status', 'published')
      .order('pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching paged church posts:', error);
      throw error;
    }

    return data || [];
  },

  async getPostDetail(postId: string): Promise<ChurchPost | null> {
    const { data, error } = await supabase
      .from('church_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post detail:', error);
      throw error;
    }

    return data;
  }
};
