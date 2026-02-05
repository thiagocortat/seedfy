import { supabase } from './supabase';
import { calculateStreaks } from '../utils/streakCalculator';
import { ChallengeType } from './challengeService';

export interface Trophy {
  challengeId: string;
  title: string;
  type: ChallengeType | string;
  durationDays: number;
  completedAt: string;
}

export interface ProfileProgressDTO {
  activeDaysTotal: number;
  streakCurrent: number;
  streakBest: number;
  challengesCompletedTotal: number;
  trophiesPreview: Trophy[];
}

export const profileProgressService = {
  async getProfileProgress(userId: string): Promise<ProfileProgressDTO> {
    const [activeDaysData, checkinsData, completedChallengesData] = await Promise.all([
      // 1. Active Days Total
      // Note: Supabase count with distinct is not directly supported via simple JS client 'count' option in one go easily without RPC for distinct.
      // But we can fetch distinct date_keys and count them locally if dataset is not huge, or use a workaround.
      // For MVP/RN without backend changes: fetch all distinct date_keys (needed for streak anyway).
      this.getDistinctCheckinDates(userId),
      
      // 2. Distinct dates for streak (same as above)
      // optimizing: we can just use the result of 1.
      Promise.resolve(null), // Placeholder to keep structure if we split logic
      
      // 3. Completed Challenges
      this.getCompletedChallenges(userId)
    ]);

    const distinctDates = activeDaysData; // Reusing result 1
    const streaks = calculateStreaks(distinctDates);

    return {
      activeDaysTotal: distinctDates.length,
      streakCurrent: streaks.current,
      streakBest: streaks.best,
      challengesCompletedTotal: completedChallengesData.total,
      trophiesPreview: completedChallengesData.trophies.slice(0, 6)
    };
  },

  async getDistinctCheckinDates(userId: string): Promise<string[]> {
    // Fetch all date_keys for the user. 
    // Since we can't do "select distinct date_key" easily with just JS client .select('date_key', { head: false, count: null }) without duplicates if RLS policies are row based? 
    // Actually we can just fetch all and dedup in JS.
    // For scale, we'd want an RPC or a view. For MVP, fetch all date_keys (lightweight strings).
    
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('date_key')
      .eq('user_id', userId)
      .order('date_key', { ascending: false });

    if (error) {
      console.error('Error fetching distinct dates:', error);
      return [];
    }

    const dates = data.map(d => d.date_key);
    return [...new Set(dates)];
  },

  async getCompletedChallenges(userId: string): Promise<{ total: number; trophies: Trophy[] }> {
    // Priority: Status 'completed' in challenge_participants
    const { data: participants, error } = await supabase
      .from('challenge_participants')
      .select(`
        challenge_id,
        status,
        joined_at,
        challenge:challenges (
          id,
          title,
          type,
          duration_days,
          end_date
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching completed challenges:', error);
      return { total: 0, trophies: [] };
    }

    // Map to Trophy
    let trophies: Trophy[] = participants.map((p: any) => ({
      challengeId: p.challenge.id,
      title: p.challenge.title,
      type: p.challenge.type,
      durationDays: p.challenge.duration_days,
      completedAt: p.challenge.end_date || p.joined_at // Fallback date
    }));

    // Fallback logic (as per PRD 9.4)
    if (trophies.length === 0) {
      try {
        const fallbackTrophies = await this.getCompletedChallengesFallback(userId);
        if (fallbackTrophies.length > 0) {
          trophies = fallbackTrophies;
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }

    // Sort by completedAt desc
    trophies.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    return {
      total: trophies.length,
      trophies
    };
  },

  async getCompletedChallengesFallback(userId: string): Promise<Trophy[]> {
      // 1. Get all active or completed challenges for user
      const { data: participants, error: pError } = await supabase
          .from('challenge_participants')
          .select(`
              challenge_id,
              joined_at,
              challenge:challenges (
                  id, title, type, duration_days, end_date
              )
          `)
          .eq('user_id', userId);

      if (pError || !participants) return [];

      // 2. Get all checkins for this user (lightweight: just challenge_id and date_key)
      const { data: checkins, error: cError } = await supabase
          .from('daily_checkins')
          .select('challenge_id, date_key, completed_at')
          .eq('user_id', userId);
      
      if (cError || !checkins) return [];

      // 3. Group checkins by challenge_id
      const checkinsByChallenge: Record<string, Set<string>> = {};
      const lastCheckinByChallenge: Record<string, string> = {};

      checkins.forEach((c: any) => {
          if (!checkinsByChallenge[c.challenge_id]) {
              checkinsByChallenge[c.challenge_id] = new Set();
          }
          checkinsByChallenge[c.challenge_id].add(c.date_key);

          // Track last checkin for completedAt
          const currentMax = lastCheckinByChallenge[c.challenge_id];
          if (!currentMax || new Date(c.completed_at) > new Date(currentMax)) {
              lastCheckinByChallenge[c.challenge_id] = c.completed_at;
          }
      });

      // 4. Filter completed
      const trophies: Trophy[] = [];
      
      participants.forEach((p: any) => {
          const cId = p.challenge.id;
          const duration = p.challenge.duration_days;
          const distinctCount = checkinsByChallenge[cId]?.size || 0;

          if (distinctCount >= duration) {
              trophies.push({
                  challengeId: cId,
                  title: p.challenge.title,
                  type: p.challenge.type,
                  durationDays: duration,
                  completedAt: lastCheckinByChallenge[cId] || p.challenge.end_date || new Date().toISOString()
              });
          }
      });

      return trophies;
  },
  
  async getAllTrophies(userId: string): Promise<Trophy[]> {
      const { trophies } = await this.getCompletedChallenges(userId);
      return trophies;
  },

  async getTrophyDetail(userId: string, challengeId: string) {
      // Get challenge details and checkins
       const { data: challenge, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();
      
      if (error) throw error;
      
      // Get checkins
      const { data: checkins } = await supabase
      .from('daily_checkins')
      .select('date_key, completed_at')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .order('date_key', { ascending: true });
      
      return {
          challenge,
          checkins: checkins || []
      };
  }
};
