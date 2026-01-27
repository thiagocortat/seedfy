import { supabase } from './supabase';

export interface Group {
  id: string;
  name: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  discoverable: boolean;
  joinPolicy: 'request_to_join' | 'invite_only';
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface GroupMemberProfile {
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  name: string;
  photoUrl: string | null;
}

export interface GroupActivity {
  id: string;
  groupId: string;
  type: 'joined' | 'completed_challenge' | 'new_challenge' | 'challenge_completed';
  message: string;
  createdAt: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName?: string;
  inviterName?: string;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface GroupJoinRequest {
  id: string;
  groupId: string;
  groupName?: string;
  requesterUserId: string;
  requesterName?: string;
  requesterPhotoUrl?: string;
  status: 'pending' | 'approved' | 'denied' | 'canceled';
  createdAt: string;
}

export const groupService = {
  async searchUserByEmail(email: string): Promise<UserSearchResult | null> {
    const { data, error } = await supabase.rpc('search_user_by_email', {
      search_email: email,
    });

    if (error) {
      console.error('Error searching user:', error);
      throw error;
    }

    if (!data || data.length === 0) return null;

    return {
      id: data[0].id,
      displayName: data[0].display_name,
      avatarUrl: data[0].avatar_url,
    };
  },

  async inviteUser(groupId: string, userId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('group_invitations').insert({
      group_id: groupId,
      invited_user_id: userId,
      inviter_user_id: user.id,
      status: 'pending',
    });

    if (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  },

  async getMyInvitations(): Promise<GroupInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('group_invitations')
      .select(`
        id,
        status,
        created_at,
        group:groups(id, name),
        inviter:users!inviter_user_id(name)
      `)
      .eq('invited_user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }

    return data.map((invite: any) => ({
      id: invite.id,
      groupId: invite.group?.id,
      groupName: invite.group?.name,
      inviterName: invite.inviter?.name,
      status: invite.status,
      createdAt: invite.created_at,
    }));
  },

  async respondToInvite(inviteId: string, accept: boolean): Promise<void> {
    if (accept) {
      const { error } = await supabase.rpc('accept_group_invitation', {
        p_invite_id: inviteId,
      });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'declined', responded_at: new Date().toISOString() })
        .eq('id', inviteId);
      if (error) throw error;
    }
  },

  async createGroup(
    userId: string, 
    name: string, 
    imageUrl?: string,
    discoverable: boolean = false,
    joinPolicy: 'request_to_join' | 'invite_only' = 'invite_only'
  ): Promise<Group> {
    const groupData = {
      name,
      image_url: imageUrl,
      created_by: userId,
      created_at: new Date().toISOString(),
      discoverable,
      join_policy: joinPolicy,
    };

    // 1. Create Group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert(groupData)
      .select()
      .single();

    if (groupError) {
      console.error('Error creating group:', groupError);
      throw new Error(`Failed to create group: ${groupError.message}`);
    }

    // 2. Add Creator as Member
    const memberData = {
      group_id: group.id,
      user_id: userId,
      role: 'owner',
      joined_at: new Date().toISOString(),
    };

    const { error: memberError } = await supabase.from('group_members').insert(memberData);
    if (memberError) {
       // Ideally rollback group creation, but for now log it.
       console.error('Error adding creator to group:', memberError);
       throw new Error(`Group created but failed to add member: ${memberError.message}`);
    }
      
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
      discoverable: group.discoverable,
      joinPolicy: group.join_policy,
    };
  },

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.discoverable !== undefined) dbUpdates.discoverable = updates.discoverable;
    if (updates.joinPolicy !== undefined) dbUpdates.join_policy = updates.joinPolicy;

    const { error } = await supabase
      .from('groups')
      .update(dbUpdates)
      .eq('id', groupId);

    if (error) {
      console.error('Error updating group:', error);
      throw error;
    }
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
      discoverable: group.discoverable,
      joinPolicy: group.join_policy,
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
  },

  async getGroupMembers(groupId: string): Promise<GroupMemberProfile[]> {
    const { data, error } = await supabase.rpc('get_group_members', {
      p_group_id: groupId,
    });

    if (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }

    if (!data) return [];

    return data.map((member: any) => ({
      userId: member.member_user_id,
      role: member.member_role,
      joinedAt: member.member_joined_at,
      name: member.member_name,
      photoUrl: member.member_photo_url,
    }));
  },

  // --- Feature 2: Discovery & Requests ---

  async searchGroups(query: string): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('discoverable', true)
      .eq('join_policy', 'request_to_join')
      .ilike('name', `%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching groups:', error);
      throw error;
    }

    return (data || []).map(group => ({
      id: group.id,
      name: group.name,
      imageUrl: group.image_url,
      createdBy: group.created_by,
      createdAt: group.created_at,
      discoverable: group.discoverable,
      joinPolicy: group.join_policy,
    }));
  },

  async requestToJoinGroup(groupId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('group_join_requests').insert({
      group_id: groupId,
      requester_user_id: user.id,
      status: 'pending',
    });

    if (error) {
      console.error('Error requesting to join group:', error);
      throw error;
    }
  },

  async getMyJoinRequests(): Promise<GroupJoinRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('group_join_requests')
      .select(`
        id,
        group_id,
        status,
        created_at,
        group:groups(name)
      `)
      .eq('requester_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my join requests:', error);
      throw error;
    }

    return (data || []).map((req: any) => ({
      id: req.id,
      groupId: req.group_id,
      groupName: req.group?.name,
      requesterUserId: user.id,
      status: req.status,
      createdAt: req.created_at,
    }));
  },

  async cancelJoinRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('group_join_requests')
      .update({ status: 'canceled' })
      .eq('id', requestId);

    if (error) {
      console.error('Error canceling join request:', error);
      throw error;
    }
  },

  async getGroupJoinRequests(groupId: string): Promise<GroupJoinRequest[]> {
    const { data, error } = await supabase
      .from('group_join_requests')
      .select(`
        id,
        group_id,
        requester_user_id,
        status,
        created_at,
        requester:users!group_join_requests_requester_user_id_fkey(name, photo_url)
      `)
      .eq('group_id', groupId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching group join requests:', error);
      throw error;
    }

    return (data || []).map((req: any) => ({
      id: req.id,
      groupId: req.group_id,
      requesterUserId: req.requester_user_id,
      requesterName: req.requester?.name,
      requesterPhotoUrl: req.requester?.photo_url,
      status: req.status,
      createdAt: req.created_at,
    }));
  },

  async resolveJoinRequest(requestId: string, action: 'approved' | 'denied'): Promise<void> {
    const { error } = await supabase.rpc('resolve_join_request', {
      request_id: requestId,
      action: action,
    });

    if (error) {
      console.error(`Error resolving request (${action}):`, error);
      throw error;
    }
  }
};
