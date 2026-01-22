import { create } from 'zustand';
import { userService, UserProfile } from '../services/userService';
import { supabase } from '../services/supabase';

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: false,
  fetchProfile: async (userId: string) => {
    set({ isLoading: true });
    try {
      let profile = await userService.getUser(userId);
      
      // Auto-repair: If user exists in Auth but not in public table, create them
      if (!profile) {
        console.log('User profile missing in public table. Attempting auto-repair...');
        try {
           // We need email to create user, but fetchProfile only gets ID. 
           // In a real scenario we'd fetch user email from auth session first.
           // For now, we try to fetch session to get email.
           const { data: { session } } = await supabase.auth.getSession();
           const email = session?.user?.email;
           
           if (email && session?.user?.id === userId) {
             profile = await userService.createUser(userId, email);
             console.log('Auto-repair successful:', profile);
           } else {
             console.warn('Cannot auto-repair: Email not found in session.');
           }
        } catch (repairError) {
           console.error('Auto-repair failed:', repairError);
        }
      }

      set({ profile });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  updateProfile: async (userId: string, data: Partial<UserProfile>) => {
    try {
      // 1. Optimistic update: Update local state immediately to reflect changes in UI
      const currentProfile = get().profile;
      
      // Create a base profile if current is null to ensure navigation works
      const baseProfile: UserProfile = currentProfile || {
        id: userId,
        email: '',
        name: '',
        interests: [],
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
        emailVerified: false,
        churchId: null
      };

      const updatedProfile = { ...baseProfile, ...data };
      
      set({
        profile: updatedProfile
      });

      // 2. Perform the actual update in Supabase
      await userService.updateUser(userId, data);
      
      // 3. Fetch fresh data to ensure consistency (silently)
      try {
        const freshProfile = await userService.getUser(userId);
        if (freshProfile) {
           set({ profile: freshProfile });
        }
      } catch (err) {
        console.error('Error refreshing profile after update:', err);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // We don't revert here to prevent UI flip-flopping, 
      // but in a strict environment we might want to.
      throw error;
    }
  },
  clearProfile: () => set({ profile: null }),
}));
