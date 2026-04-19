import { api } from './api';
import type { IRelationship, IFollowListItem, IBlock, IBlockDetail, IPaginatedResponse } from '../types/social.types';

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

  getFollowers: async (cursor?: string, limit = 20): Promise<IPaginatedResponse<IFollowListItem>> => {
    const res = await api.get(`/api/v1/social/follow/followers?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`);
    const { items, nextCursor, hasMore } = res.data.data;
    return {
      items: items.map((item: any) => ({
        ...item.followerId,
        relationshipId: item._id
      })),
      nextCursor,
      hasMore
    };
  },

  getFollowing: async (cursor?: string, limit = 20): Promise<IPaginatedResponse<IFollowListItem>> => {
    const res = await api.get(`/api/v1/social/follow/following?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`);
    const { items, nextCursor, hasMore } = res.data.data;
    return {
      items: items.map((item: any) => ({
        ...item.followingId,
        relationshipId: item._id
      })),
      nextCursor,
      hasMore
    };
  },

  getPendingRequests: async (cursor?: string, limit = 20): Promise<IPaginatedResponse<IFollowListItem>> => {
    const res = await api.get(`/api/v1/social/follow/requests?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`);
    const { items, nextCursor, hasMore } = res.data.data;
    return {
      items: items.map((item: any) => ({
        ...item.followerId,
        relationshipId: item._id
      })),
      nextCursor,
      hasMore
    };
  },

  getSentRequests: async (cursor?: string, limit = 20): Promise<IPaginatedResponse<IFollowListItem>> => {
    const res = await api.get(`/api/v1/social/follow/requests/sent?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`);
    const { items, nextCursor, hasMore } = res.data.data;
    return {
      items: items.map((item: any) => ({
        ...item.followingId,
        relationshipId: item._id
      })),
      nextCursor,
      hasMore
    };
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
