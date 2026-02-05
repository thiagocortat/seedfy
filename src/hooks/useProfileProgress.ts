import { useQuery, useQueryClient } from '@tanstack/react-query';
import { profileProgressService } from '../services/profileProgressService';
import { useUserStore } from '../store/useUserStore';

export const useProfileProgress = () => {
  const user = useUserStore(state => state.profile);
  const queryClient = useQueryClient();

  const { data: progress, isLoading, error, refetch } = useQuery({
    queryKey: ['profileProgress', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('No user');
      return profileProgressService.getProfileProgress(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache (PRD requirement)
  });

  const invalidateProgress = () => {
    queryClient.invalidateQueries({ queryKey: ['profileProgress', user?.id] });
  };

  return {
    progress,
    isLoading,
    error,
    refetch,
    invalidateProgress
  };
};
