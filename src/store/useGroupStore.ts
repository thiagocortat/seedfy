import { create } from 'zustand';
import { groupService, Group, GroupActivity, GroupMemberProfile } from '../services/groupService';

interface GroupState {
  groups: Group[];
  activeGroup: Group | null;
  activity: GroupActivity[];
  members: GroupMemberProfile[];
  isLoading: boolean;
  fetchUserGroups: (userId: string) => Promise<void>;
  createGroup: (userId: string, name: string) => Promise<void>;
  fetchGroupActivity: (groupId: string) => Promise<void>;
  fetchGroupMembers: (groupId: string) => Promise<void>;
  setActiveGroup: (group: Group | null) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroup: null,
  activity: [],
  members: [],
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
}));
