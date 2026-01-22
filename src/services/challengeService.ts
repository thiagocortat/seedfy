import { supabase } from './supabase';

export type ChallengeType = 'reading' | 'meditation' | 'fasting' | 'communion';

export interface Challenge {
  id: string;
  groupId: string;
  createdBy: string;
  type: ChallengeType;
  title: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'canceled';
  createdAt: string;
}

export interface ChallengeParticipant {
  challengeId: string;
  userId: string;
  status: 'active' | 'quit' | 'completed';
  joinedAt: string;
  progress: number; // Count of completed days
}

export interface DailyCheckin {
  challengeId: string;
  userId: string;
  dateKey: string;
  completedAt: string;
}

export const challengeService = {
  async createChallenge(
    userId: string, 
    groupId: string, 
    type: ChallengeType, 
    title: string, 
    durationDays: number,
    startDate: Date
  ): Promise<Challenge> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    const challengeData = {
      group_id: groupId,
      created_by: userId,
      type,
      title,
      duration_days: durationDays,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
    };

    // 1. Create Challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert(challengeData)
      .select()
      .single();

    if (challengeError) {
      console.error('Error creating challenge:', challengeError);
      throw new Error(`Failed to create challenge: ${challengeError.message}`);
    }

    // 2. Add Creator as Participant
    const participantData = {
      challenge_id: challenge.id,
      user_id: userId,
      status: 'active',
      joined_at: new Date().toISOString(),
      progress: 0,
    };

    const { error: participantError } = await supabase
      .from('challenge_participants')
      .insert(participantData);

    if (participantError) {
      // Rollback challenge creation if possible, or just log error
      console.error('Error adding participant:', participantError);
    }

    // 3. Log Activity
    const activityData = {
      group_id: groupId,
      type: 'new_challenge',
      message: `New challenge: ${title}`,
      created_at: new Date().toISOString(),
    };

    await supabase.from('group_activity').insert(activityData);

    return {
      id: challenge.id,
      groupId: challenge.group_id,
      createdBy: challenge.created_by,
      type: challenge.type,
      title: challenge.title,
      durationDays: challenge.duration_days,
      startDate: challenge.start_date,
      endDate: challenge.end_date,
      status: challenge.status,
      createdAt: challenge.created_at,
    };
  },

  async joinChallenge(userId: string, challengeId: string) {
    const { data: existing } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();
    
    if (existing) return; // Already joined

    await supabase.from('challenge_participants').insert({
      challenge_id: challengeId,
      user_id: userId,
      status: 'active',
      joined_at: new Date().toISOString(),
      progress: 0,
    });
  },

  async getUserChallenges(userId: string): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        challenge:challenges (
          id,
          group_id,
          created_by,
          type,
          title,
          duration_days,
          start_date,
          end_date,
          status,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.challenge.id,
      groupId: item.challenge.group_id,
      createdBy: item.challenge.created_by,
      type: item.challenge.type,
      title: item.challenge.title,
      durationDays: item.challenge.duration_days,
      startDate: item.challenge.start_date,
      endDate: item.challenge.end_date,
      status: item.challenge.status,
      createdAt: item.challenge.created_at,
    }));
  },

  async checkIn(userId: string, challengeId: string) {
    const dateKey = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .eq('date_key', dateKey)
      .single();

    if (existing) return; // Already checked in

    // Insert check-in
    const { error: checkInError } = await supabase
      .from('daily_checkins')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        date_key: dateKey,
        completed_at: new Date().toISOString(),
      });

    if (checkInError) throw checkInError;

    // Update participant progress
    // We can use an RPC function or just increment manually. 
    // For simplicity: get current progress and increment.
    // Better: RPC "increment_progress"
    
    // For now, let's just increment in client logic or simple update
    const { data: participant } = await supabase
      .from('challenge_participants')
      .select('progress')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();

    if (participant) {
      await supabase
        .from('challenge_participants')
        .update({ progress: (participant.progress || 0) + 1 })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);
    }
  },

  async getDailyProgress(challengeId: string): Promise<number> {
    const dateKey = new Date().toISOString().split('T')[0];
    
    const { count, error } = await supabase
      .from('daily_checkins')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeId)
      .eq('date_key', dateKey);

    if (error) throw error;
    return count || 0;
  },

  async getUserCheckIns(userId: string, challengeId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('date_key')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(d => d.date_key);
  }
};
