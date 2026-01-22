import { groupService } from '../../services/groupService';
import { supabase } from '../../services/supabase';

// Mock Supabase client
jest.mock('../../services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

describe('groupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a group successfully', async () => {
    const mockGroup = {
      id: 'group-1',
      name: 'Test Group',
      image_url: 'http://test.com/img.jpg',
      created_by: 'user-1',
      created_at: '2026-01-01',
    };

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'groups') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockGroup, error: null }),
        };
      }
      if (table === 'group_members' || table === 'group_activity') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return { select: jest.fn() };
    });

    const result = await groupService.createGroup('user-1', 'Test Group', 'http://test.com/img.jpg');

    expect(result).toEqual({
      id: 'group-1',
      name: 'Test Group',
      imageUrl: 'http://test.com/img.jpg',
      createdBy: 'user-1',
      createdAt: '2026-01-01',
    });
  });

  it('should throw error if group creation fails', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert Error' } }),
    });

    await expect(
      groupService.createGroup('user-1', 'Fail Group')
    ).rejects.toThrow('Failed to create group: Insert Error');
  });
});
