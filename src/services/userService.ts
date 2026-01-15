import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  churchId?: string | null;
  interests: string[];
  createdAt: string;
  onboardingCompleted: boolean;
  emailVerified?: boolean;
}

export const userService = {
  async getUser(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      photoUrl: data.photo_url,
      churchId: data.church_id,
      interests: data.interests || [],
      createdAt: data.created_at,
      onboardingCompleted: data.onboarding_completed,
      emailVerified: data.email_verified,
    };
  },

  async createUser(userId: string, email: string) {
    const newUser = {
      id: userId,
      email,
      name: '',
      interests: [],
      created_at: new Date().toISOString(),
      onboarding_completed: false,
      email_verified: false,
      church_id: null,
    };

    const { error } = await supabase
      .from('users')
      .insert(newUser);

    if (error) throw error;

    return {
      id: userId,
      email,
      name: '',
      interests: [],
      createdAt: newUser.created_at,
      onboardingCompleted: false,
      emailVerified: false,
      churchId: null,
    };
  },

  async updateUser(userId: string, data: Partial<UserProfile>) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.photoUrl !== undefined) updateData.photo_url = data.photoUrl;
    if (data.churchId !== undefined) updateData.church_id = data.churchId;
    if (data.interests !== undefined) updateData.interests = data.interests;
    if (data.onboardingCompleted !== undefined) updateData.onboarding_completed = data.onboardingCompleted;
    if (data.emailVerified !== undefined) updateData.email_verified = data.emailVerified;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;
  }
};
