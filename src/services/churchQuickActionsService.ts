import { supabase } from './supabase';

export interface QuickAction {
  id: string;
  church_id: string;
  type: string; // donate, events, website, whatsapp, youtube, instagram
  label: string;
  url: string;
  sort_order: number;
  is_enabled: boolean;
  open_mode: 'in_app' | 'external';
}

export const churchQuickActionsService = {
  async getQuickActions(churchId: string): Promise<QuickAction[]> {
    const { data, error } = await supabase
      .from('church_quick_actions')
      .select('*')
      .eq('church_id', churchId)
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching quick actions:', error);
      throw error;
    }

    return data || [];
  }
};
