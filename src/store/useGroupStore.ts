import { create } from 'zustand';
import { groupService, Group, GroupActivity, GroupMemberProfile, GroupInvitation, UserSearchResult } from '../services/groupService';

interface GroupState {
  groups: Group[];
  activeGroup: Group | null;
  activity: GroupActivity[];
  members: GroupMemberProfile[];
  invitations: GroupInvitation[];
  searchResult: UserSearchResult | null;
  isLoading: boolean;
  fetchUserGroups: (userId: string) => Promise<void>;
  createGroup: (userId: string, name: string) => Promise<void>;
  fetchGroupActivity: (groupId: string) => Promise<void>;
  fetchGroupMembers: (groupId: string) => Promise<void>;
  setActiveGroup: (group: Group | null) => void;
  fetchInvitations: () => Promise<void>;
  searchUser: (email: string) => Promise<void>;
  clearSearch: () => void;
  inviteUser: (groupId: string, userId: string) => Promise<void>;
  respondToInvitation: (inviteId: string, accept: boolean) => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroup: null,
  activity: [],
  members: [],
  invitations: [],
  searchResult: null,
  isLoading: false,
  fetchUserGroups: async (userId: string) => {
    set({ isLoading: true });
    try {
      const groups = await groupService.getUserGroups(userId);
      set({ groups });
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  createGroup: async (userId: string, name: string) => {
    set({ isLoading: true });
    try {
      const newGroup = await groupService.createGroup(userId, name);
      set(state => ({ groups: [...state.groups, newGroup] }));
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  fetchGroupActivity: async (groupId: string) => {
    try {
      const activity = await groupService.getGroupActivity(groupId);
      set({ activity });
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  },
  fetchGroupMembers: async (groupId: string) => {
    try {
      const members = await groupService.getGroupMembers(groupId);
      set({ members });
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  },
  setActiveGroup: (group) => set({ activeGroup: group }),
  fetchInvitations: async () => {
    set({ isLoading: true });
    try {
      const invitations = await groupService.getMyInvitations();
      set({ invitations });
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  searchUser: async (email: string) => {
    set({ isLoading: true, searchResult: null });
    try {
      const result = await groupService.searchUserByEmail(email);
      set({ searchResult: result });
    } catch (error) {
      console.error('Error searching user:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  clearSearch: () => set({ searchResult: null }),
  inviteUser: async (groupId: string, userId: string) => {
    set({ isLoading: true });
    try {
      await groupService.inviteUser(groupId, userId);
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  respondToInvitation: async (inviteId: string, accept: boolean) => {
    set({ isLoading: true });
    try {
      await groupService.respondToInvite(inviteId, accept);
      set(state => ({
        invitations: state.invitations.filter(i => i.id !== inviteId)
      }));
    } catch (error) {
      console.error('Error responding to invitation:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
