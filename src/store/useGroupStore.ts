import { create } from 'zustand';
import { groupService, Group, GroupActivity, GroupMemberProfile, GroupInvitation, UserSearchResult, GroupJoinRequest } from '../services/groupService';

interface GroupState {
  groups: Group[];
  activeGroup: Group | null;
  activity: GroupActivity[];
  members: GroupMemberProfile[];
  invitations: GroupInvitation[];
  searchResult: UserSearchResult | null;
  // Feature 2:
  searchedGroups: Group[];
  myJoinRequests: GroupJoinRequest[];
  pendingJoinRequests: GroupJoinRequest[]; // Requests for groups I own
  isLoading: boolean;

  fetchUserGroups: (userId: string) => Promise<void>;
  createGroup: (userId: string, name: string, discoverable?: boolean, joinPolicy?: 'request_to_join' | 'invite_only') => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  fetchGroupActivity: (groupId: string) => Promise<void>;
  fetchGroupMembers: (groupId: string) => Promise<void>;
  setActiveGroup: (group: Group | null) => void;
  fetchInvitations: () => Promise<void>;
  searchUser: (email: string) => Promise<void>;
  clearSearch: () => void;
  inviteUser: (groupId: string, userId: string) => Promise<void>;
  respondToInvitation: (inviteId: string, accept: boolean) => Promise<void>;
  
  // Feature 2:
  searchGroups: (query: string) => Promise<void>;
  clearGroupSearch: () => void;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  fetchMyJoinRequests: () => Promise<void>;
  cancelJoinRequest: (requestId: string) => Promise<void>;
  fetchGroupJoinRequests: (groupId: string) => Promise<void>;
  resolveJoinRequest: (requestId: string, action: 'approved' | 'denied') => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroup: null,
  activity: [],
  members: [],
  invitations: [],
  searchResult: null,
  searchedGroups: [],
  myJoinRequests: [],
  pendingJoinRequests: [],
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

  createGroup: async (userId: string, name: string, discoverable?: boolean, joinPolicy?: 'request_to_join' | 'invite_only') => {
    set({ isLoading: true });
    try {
      const newGroup = await groupService.createGroup(userId, name, undefined, discoverable, joinPolicy);
      set(state => ({ groups: [...state.groups, newGroup] }));
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateGroup: async (groupId: string, updates: Partial<Group>) => {
    set({ isLoading: true });
    try {
      await groupService.updateGroup(groupId, updates);
      set(state => ({
        groups: state.groups.map(g => g.id === groupId ? { ...g, ...updates } : g),
        activeGroup: state.activeGroup?.id === groupId ? { ...state.activeGroup, ...updates } : state.activeGroup
      }));
    } catch (error) {
      console.error('Error updating group:', error);
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

  // --- Feature 2 ---

  searchGroups: async (query: string) => {
    set({ isLoading: true });
    try {
      const groups = await groupService.searchGroups(query);
      set({ searchedGroups: groups });
    } catch (error) {
      console.error('Error searching groups:', error);
      set({ searchedGroups: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  clearGroupSearch: () => set({ searchedGroups: [] }),

  requestToJoinGroup: async (groupId: string) => {
    set({ isLoading: true });
    try {
      await groupService.requestToJoinGroup(groupId);
      await get().fetchMyJoinRequests(); // Refresh requests
    } catch (error) {
      console.error('Error requesting to join group:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyJoinRequests: async () => {
    // Don't set global loading here to avoid flicker on silent refresh
    try {
      const requests = await groupService.getMyJoinRequests();
      set({ myJoinRequests: requests });
    } catch (error) {
      console.error('Error fetching my join requests:', error);
    }
  },

  cancelJoinRequest: async (requestId: string) => {
    set({ isLoading: true });
    try {
      await groupService.cancelJoinRequest(requestId);
      set(state => ({
        myJoinRequests: state.myJoinRequests.map(r => r.id === requestId ? { ...r, status: 'canceled' } : r)
      }));
    } catch (error) {
      console.error('Error canceling request:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroupJoinRequests: async (groupId: string) => {
    try {
      const requests = await groupService.getGroupJoinRequests(groupId);
      set({ pendingJoinRequests: requests });
    } catch (error) {
      console.error('Error fetching group join requests:', error);
    }
  },

  resolveJoinRequest: async (requestId: string, action: 'approved' | 'denied') => {
    set({ isLoading: true });
    try {
      await groupService.resolveJoinRequest(requestId, action);
      // Remove from pending list
      set(state => ({
        pendingJoinRequests: state.pendingJoinRequests.filter(r => r.id !== requestId)
      }));
    } catch (error) {
      console.error('Error resolving request:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));
