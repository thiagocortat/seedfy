import { supabase } from './supabase';

export interface Church {
  id: string;
  name: string;
  logoUrl?: string;
  city: string;
  state: string;
}

export const churchService = {
  async getChurches(): Promise<Church[]> {
    const { data, error } = await supabase
      .from('churches')
      .select('*');

    if (error || !data) return [];

    return data.map((church: any) => ({
      id: church.id,
      name: church.name,
      logoUrl: church.logo_url,
      city: church.city,
      state: church.state,
    }));
  },

  async getChurch(churchId: string): Promise<Church | null> {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .eq('id', churchId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url,
      city: data.city,
      state: data.state,
    };
  },

  async getUpdates(churchId: string) {
    // In a real app, this would query a 'church_updates' table.
    // For now, we mock it based on ID to show dynamic behavior
    // You can add a table later.
    
    // Simulating delay
    await new Promise(r => setTimeout(r, 500));

    const commonUpdates = [
      { id: '1', title: 'Sunday Service', date: '2 days ago', icon: 'megaphone', color: '#4F46E5', content: 'Join us this Sunday as we continue our series on Community. Services at 9am and 11am.' },
    ];

    if (churchId) {
       // Add specific updates for demonstration
       return [
         ...commonUpdates,
         { id: '2', title: 'Youth Night', date: '5 days ago', icon: 'calendar', color: '#F59E0B', content: 'Friday night hangouts for all youth! Pizza and games starting at 7pm.' }
       ];
    }
    return commonUpdates;
  }
};
