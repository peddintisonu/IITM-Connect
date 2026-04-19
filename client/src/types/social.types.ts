// Types aligned with server/src/modules/social/{follow,block}.model.ts

export type FollowStatus = 'pending' | 'accepted' | 'rejected';
export type FollowType = 'Student' | 'Org';

export interface IFollow {
  _id: string;
  followerId: string;
  followingId: string;
  followingType: FollowType;
  status: FollowStatus;
  createdAt: string;
  acceptedAt?: string;
}

export interface IBlock {
  _id: string;
  blockerId: string;
  blockedId: string | IFollowListItem;
  createdAt: string;
}

export interface IBlockDetail extends Omit<IBlock, 'blockedId'> {
  blockedId: IFollowListItem;
}

// The shape returned by GET /social/relationship/:studentId (aligned with follow.swagger.ts)
export interface IRelationship {
  targetId: string;
  isSelf: boolean;
  followingStatus: 'none' | 'pending' | 'accepted' | 'rejected';
  followsMe: boolean;
  blockedByMe: boolean;
  blockedMe: boolean;
  canViewProfile: boolean;
  canFollow: boolean;
}

// Follower/Following list items come back as populated student refs
export interface IFollowListItem {
  _id: string;
  displayName?: string;
  username?: string;
  profilePhoto?: string;
  fullName: string;
  accountType?: 'public' | 'private';
}
