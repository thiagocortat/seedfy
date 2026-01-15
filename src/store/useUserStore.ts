import { create } from 'zustand';
import { userService, UserProfile } from '../services/userService';

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,
  fetchProfile: async (userId: string) => {
    set({ isLoading: true });
    try {
      const profile = await userService.getUser(userId);
      set({ profile });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  updateProfile: async (userId: string, data: Partial<UserProfile>) => {
    try {
      await userService.updateUser(userId, data);
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  clearProfile: () => set({ profile: null }),
}));
