import { supabase } from './supabase';

export interface Group {
  id: string;
  name: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface GroupActivity {
  id: string;
  groupId: string;
  type: 'joined' | 'completed_challenge' | 'new_challenge' | 'challenge_completed';
  message: string;
  createdAt: string;
}

export const groupService = {
  async createGroup(userId: string, name: string, imageUrl?: string): Promise<Group> {
    const groupData = {
      name,
      image_url: imageUrl,
      created_by: userId,
      created_at: new Date().toISOString(),
    };

    // 1. Create Group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert(groupData)
      .select()
      .single();

    if (groupError) throw groupError;

    // 2. Add Creator as Member
    const memberData = {
      group_id: group.id,
      user_id: userId,
      role: 'owner',
      joined_at: new Date().toISOString(),
    };

    await supabase.from('group_members').insert(memberData);
      
    // 3. Log Activity
    const activityData = {
      group_id: group.id,
      type: 'joined',
      message: 'Group created',
      created_at: new Date().toISOString(),
    };

    await supabase.from('group_activity').insert(activityData);

    return {
      id: group.id,
      name: group.name,
      imageUrl: group.image_url,
      createdBy: group.created_by,
      createdAt: group.created_at,
    };
  },

  async getUserGroups(userId: string): Promise<Group[]> {
    // 1. Get memberships
    const { data: memberships, error: memError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (memError || !memberships || memberships.length === 0) return [];

    const groupIds = memberships.map(m => m.group_id);

    // 2. Get groups
    const { data: groups, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds);

    if (groupError || !groups) return [];

    return groups.map(group => ({
      id: group.id,
      name: group.name,
      imageUrl: group.image_url,
      createdBy: group.created_by,
      createdAt: group.created_at,
    }));
  },

  async getGroupActivity(groupId: string): Promise<GroupActivity[]> {
    const { data, error } = await supabase
      .from('group_activity')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];

    return data.map(activity => ({
      id: activity.id,
      groupId: activity.group_id,
      type: activity.type,
      message: activity.message,
      createdAt: activity.created_at,
    }));
  }
};
