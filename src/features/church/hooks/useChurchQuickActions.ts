import { useQuery } from '@tanstack/react-query';
import { churchQuickActionsService, QuickAction } from '../../../services/churchQuickActionsService';

export const useChurchQuickActions = (churchId?: string | null) => {
  return useQuery({
    queryKey: ['churchQuickActions', churchId],
    queryFn: () => churchQuickActionsService.getQuickActions(churchId!),
    enabled: !!churchId,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};
