import { api } from './api';
import type { IRelationship, IFollowListItem, IBlock, IBlockDetail } from '../types/social.types';

export const socialService = {
  // --- Follow ---
  sendFollowRequest: async (followingId: string) => {
    const res = await api.post(`/api/v1/social/follow/${followingId}`, { followingType: 'Student' });
    return res.data.data;
  },

  cancelFollowRequest: async (followingId: string) => {
    const res = await api.delete(`/api/v1/social/follow/${followingId}/request`);
    return res.data.data;
  },

  unfollow: async (followingId: string) => {
    const res = await api.delete(`/api/v1/social/follow/${followingId}`);
    return res.data.data;
  },

  acceptFollowRequest: async (followerId: string) => {
    const res = await api.post(`/api/v1/social/follow/${followerId}/accept`);
    return res.data.data;
  },

  rejectFollowRequest: async (followerId: string) => {
    const res = await api.post(`/api/v1/social/follow/${followerId}/reject`);
    return res.data.data;
  },

  removeFollower: async (followerId: string) => {
    const res = await api.delete(`/api/v1/social/follow/${followerId}/remove`);
    return res.data.data;
  },

  getFollowers: async (): Promise<IFollowListItem[]> => {
    const res = await api.get('/api/v1/social/follow/followers');
    return res.data.data.map((item: any) => ({
      ...item.followerId,
      relationshipId: item._id
    }));
  },

  getFollowing: async (): Promise<IFollowListItem[]> => {
    const res = await api.get('/api/v1/social/follow/following');
    return res.data.data.map((item: any) => ({
      ...item.followingId,
      relationshipId: item._id
    }));
  },

  getPendingRequests: async (): Promise<IFollowListItem[]> => {
    const res = await api.get('/api/v1/social/follow/requests');
    return res.data.data.map((item: any) => ({
      ...item.followerId,
      relationshipId: item._id
    }));
  },

  getSentRequests: async (): Promise<IFollowListItem[]> => {
    const res = await api.get('/api/v1/social/follow/requests/sent');
    return res.data.data.map((item: any) => ({
      ...item.followingId,
      relationshipId: item._id
    }));
  },

  getRelationship: async (studentId: string): Promise<IRelationship> => {
    const res = await api.get(`/api/v1/social/relationship/${studentId}`);
    return res.data.data;
  },

  // --- Block ---
  blockUser: async (blockedId: string): Promise<IBlock> => {
    const res = await api.post(`/api/v1/social/block/${blockedId}`);
    return res.data.data;
  },

  unblockUser: async (blockedId: string) => {
    const res = await api.delete(`/api/v1/social/block/${blockedId}`);
    return res.data.data;
  },

  getBlockList: async (): Promise<IBlockDetail[]> => {
    const res = await api.get('/api/v1/social/block');
    return res.data.data;
  },
};
