import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { churchPostsRepository, ChurchPost } from '../../../services/churchPostsRepository';

export const useChurchPostsPreview = (churchId?: string | null) => {
  return useQuery({
    queryKey: ['churchPostsPreview', churchId],
    queryFn: () => churchPostsRepository.getRecentChurchPosts(churchId!),
    enabled: !!churchId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

export const useChurchPostsList = (churchId?: string | null, pageSize = 10) => {
  return useInfiniteQuery({
    queryKey: ['churchPostsList', churchId],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;
      return churchPostsRepository.getChurchPostsPaged(churchId!, from, to);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length;
    },
    enabled: !!churchId,
    initialPageParam: 0,
  });
};

export const usePostDetail = (postId: string) => {
  return useQuery({
    queryKey: ['postDetail', postId],
    queryFn: () => churchPostsRepository.getPostDetail(postId),
    enabled: !!postId,
  });
};
