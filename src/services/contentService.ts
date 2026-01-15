import { supabase } from './supabase';

export interface ContentItem {
  id: string;
  type: 'podcast' | 'video' | 'music';
  title: string;
  description: string;
  coverUrl: string;
  mediaUrl: string;
  isLive?: boolean;
  createdAt: string;
  playCount: number;
}

export const contentService = {
  async getContentItems(limitCount = 20): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      coverUrl: item.cover_url,
      mediaUrl: item.media_url,
      isLive: item.is_live,
      createdAt: item.created_at,
      playCount: item.play_count,
    }));
  },

  async getFeaturedContent(): Promise<ContentItem[]> {
    // For MVP, just get latest. Real app would have 'isFeatured' flag.
    return this.getContentItems(5);
  }
};
