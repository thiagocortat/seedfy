import { create } from 'zustand';
import { contentService, ContentItem } from '../services/contentService';

interface ContentState {
  items: ContentItem[];
  featured: ContentItem[];
  isLoading: boolean;
  fetchContent: () => Promise<void>;
}

export const useContentStore = create<ContentState>((set) => ({
  items: [],
  featured: [],
  isLoading: false,
  fetchContent: async () => {
    set({ isLoading: true });
    try {
      const items = await contentService.getContentItems();
      const featured = await contentService.getFeaturedContent();
      set({ items, featured });
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
