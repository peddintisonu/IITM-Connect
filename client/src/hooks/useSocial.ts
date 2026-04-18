import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialService } from '../services/social.service';

// --- Queries ---

export const useRelationshipQuery = (studentId: string) => {
  return useQuery({
    queryKey: ['socialRelationship', studentId],
    queryFn: () => socialService.getRelationship(studentId),
    enabled: !!studentId,
  });
};

export const useFollowersQuery = () => {
  return useQuery({
    queryKey: ['socialFollowers'],
    queryFn: () => socialService.getFollowers(),
  });
};

export const useFollowingQuery = () => {
  return useQuery({
    queryKey: ['socialFollowing'],
    queryFn: () => socialService.getFollowing(),
  });
};

export const usePendingRequestsQuery = () => {
  return useQuery({
    queryKey: ['socialPendingRequests'],
    queryFn: () => socialService.getPendingRequests(),
  });
};

export const useSentRequestsQuery = () => {
  return useQuery({
    queryKey: ['socialSentRequests'],
    queryFn: () => socialService.getSentRequests(),
  });
};

export const useBlockListQuery = () => {
  return useQuery({
    queryKey: ['socialBlockList'],
    queryFn: () => socialService.getBlockList(),
  });
};

// --- Mutations ---

const useSocialInvalidation = () => {
  const queryClient = useQueryClient();
  return (targetId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['socialFollowers'] });
    queryClient.invalidateQueries({ queryKey: ['socialFollowing'] });
    queryClient.invalidateQueries({ queryKey: ['socialPendingRequests'] });
    queryClient.invalidateQueries({ queryKey: ['socialSentRequests'] });
    if (targetId) {
      queryClient.invalidateQueries({ queryKey: ['socialRelationship', targetId] });
    }
  };
};

export const useFollowMutation = () => {
  const invalidate = useSocialInvalidation();
  return useMutation({
    mutationFn: (followingId: string) => socialService.sendFollowRequest(followingId),
    onSuccess: (_, followingId) => invalidate(followingId),
  });
};

export const useCancelFollowMutation = () => {
  const invalidate = useSocialInvalidation();
  return useMutation({
    mutationFn: (followingId: string) => socialService.cancelFollowRequest(followingId),
    onSuccess: (_, followingId) => invalidate(followingId),
  });
};

export const useUnfollowMutation = () => {
  const invalidate = useSocialInvalidation();
  return useMutation({
    mutationFn: (followingId: string) => socialService.unfollow(followingId),
    onSuccess: (_, followingId) => invalidate(followingId),
  });
};

export const useAcceptFollowMutation = () => {
  const invalidate = useSocialInvalidation();
  return useMutation({
    mutationFn: (followerId: string) => socialService.acceptFollowRequest(followerId),
    onSuccess: (_, followerId) => invalidate(followerId),
  });
};

export const useRejectFollowMutation = () => {
  const invalidate = useSocialInvalidation();
  return useMutation({
    mutationFn: (followerId: string) => socialService.rejectFollowRequest(followerId),
    onSuccess: (_, followerId) => invalidate(followerId),
  });
};

export const useRemoveFollowerMutation = () => {
  const invalidate = useSocialInvalidation();
  return useMutation({
    mutationFn: (followerId: string) => socialService.removeFollower(followerId),
    onSuccess: (_, followerId) => invalidate(followerId),
  });
};

export const useBlockMutation = () => {
  const invalidate = useSocialInvalidation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockedId: string) => socialService.blockUser(blockedId),
    onSuccess: (_, blockedId) => {
      invalidate(blockedId);
      queryClient.invalidateQueries({ queryKey: ['socialBlockList'] });
    },
  });
};

export const useUnblockMutation = () => {
  const invalidate = useSocialInvalidation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockedId: string) => socialService.unblockUser(blockedId),
    onSuccess: (_, blockedId) => {
      invalidate(blockedId);
      queryClient.invalidateQueries({ queryKey: ['socialBlockList'] });
    },
  });
};
