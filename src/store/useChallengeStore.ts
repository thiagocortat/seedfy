import { create } from 'zustand';
import { challengeService, Challenge } from '../services/challengeService';

interface ChallengeState {
  challenges: Challenge[];
  isLoading: boolean;
  fetchUserChallenges: (userId: string) => Promise<void>;
  createChallenge: (userId: string, groupId: string, type: any, title: string, duration: number, startDate: Date, journeyId?: string) => Promise<Challenge>;
  checkIn: (userId: string, challengeId: string) => Promise<void>;
  quitChallenge: (userId: string, challengeId: string) => Promise<void>;
  rejoinChallenge: (userId: string, challengeId: string) => Promise<void>;
  getDailyProgress: (challengeId: string) => Promise<number>;
  getUserCheckIns: (userId: string, challengeId: string) => Promise<string[]>;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  challenges: [],
  isLoading: false,
  fetchUserChallenges: async (userId: string) => {
    set({ isLoading: true });
    try {
      const challenges = await challengeService.getUserChallenges(userId);
      set({ challenges });
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  createChallenge: async (userId, groupId, type, title, duration, startDate, journeyId) => {
    set({ isLoading: true });
    try {
      const newChallenge = await challengeService.createChallenge(userId, groupId, type, title, duration, startDate, journeyId);
      set(state => ({ challenges: [newChallenge, ...state.challenges] }));
      return newChallenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  checkIn: async (userId, challengeId) => {
    try {
      await challengeService.checkIn(userId, challengeId);
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  },
  quitChallenge: async (userId, challengeId) => {
    set({ isLoading: true });
    try {
      await challengeService.quitChallenge(userId, challengeId);
      set(state => ({
        challenges: state.challenges.map(c => 
          c.id === challengeId ? { ...c, participantStatus: 'quit' } : c
        )
      }));
    } catch (error) {
      console.error('Error quitting challenge:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  rejoinChallenge: async (userId, challengeId) => {
    set({ isLoading: true });
    try {
      await challengeService.rejoinChallenge(userId, challengeId);
      set(state => ({
        challenges: state.challenges.map(c => 
          c.id === challengeId ? { ...c, participantStatus: 'active' } : c
        )
      }));
    } catch (error) {
      console.error('Error rejoining challenge:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  getDailyProgress: async (challengeId) => {
    try {
      return await challengeService.getDailyProgress(challengeId);
    } catch (error) {
      console.error('Error getting progress:', error);
      return 0;
    }
  },
  getUserCheckIns: async (userId, challengeId) => {
    try {
      return await challengeService.getUserCheckIns(userId, challengeId);
    } catch (error) {
      console.error('Error getting user check-ins:', error);
      return [];
    }
  }
}));
