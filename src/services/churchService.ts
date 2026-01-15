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
  }
};
