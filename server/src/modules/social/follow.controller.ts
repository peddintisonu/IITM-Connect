// server/src/modules/social/follow.controller.ts

import { FOLLOW_TYPE } from "../../shared/constants/social.constants";
import {
    ApiError,
    ApiResponse,
    asyncHandler,
    toObjectId,
} from "../../shared/utils";
import {
    acceptFollowRequest,
    cancelSentFollowRequest,
    getFollowers,
    getFollowing,
    getPendingRequests,
    getRelationshipState,
    getSentPendingRequests,
    rejectFollowRequest,
    removeFollower,
    sendFollowRequest,
    unfollow,
} from "./follow.service";

export const sendFollowRequestController = asyncHandler(async (req, res) => {
    const { followingType } = req.body;
    if (
        followingType !== FOLLOW_TYPE.STUDENT &&
        followingType !== FOLLOW_TYPE.ORG
    ) {
        throw new ApiError(400, "followingType must be either Student or Org");
    }

    const followerId = req.user!._id;
    const followingId = toObjectId(req.params.followingId);

    const follow = await sendFollowRequest(
        followerId,
        followingId,
        followingType
    );
    res.status(201).json(new ApiResponse(201, follow, "Follow request sent"));
});

export const acceptFollowRequestController = asyncHandler(async (req, res) => {
    const studentId = req.user!._id;
    const followerId = toObjectId(req.params.followerId);

    const follow = await acceptFollowRequest(studentId, followerId);
    res.json(new ApiResponse(200, follow, "Follow request accepted"));
});

export const rejectFollowRequestController = asyncHandler(async (req, res) => {
    const studentId = req.user!._id;
    const followerId = toObjectId(req.params.followerId);

    const follow = await rejectFollowRequest(studentId, followerId);
    res.json(new ApiResponse(200, follow, "Follow request rejected"));
});

export const unfollowController = asyncHandler(async (req, res) => {
    const followerId = req.user!._id;
    const followingId = toObjectId(req.params.followingId);

    const follow = await unfollow(followerId, followingId);
    res.json(new ApiResponse(200, follow, "Unfollowed successfully"));
});

export const cancelSentFollowRequestController = asyncHandler(
    async (req, res) => {
        const followerId = req.user!._id;
        const followingId = toObjectId(req.params.followingId);

        const follow = await cancelSentFollowRequest(followerId, followingId);
        res.json(
            new ApiResponse(200, follow, "Pending follow request canceled")
        );
    }
);

export const removeFollowerController = asyncHandler(async (req, res) => {
    const studentId = req.user!._id;
    const followerId = toObjectId(req.params.followerId);

    const follow = await removeFollower(studentId, followerId);
    res.json(new ApiResponse(200, follow, "Follower removed successfully"));
});

export const getFollowersController = asyncHandler(async (req, res) => {
    const followers = await getFollowers(req.user!._id);
    res.json(
        new ApiResponse(200, followers, "Followers retrieved successfully")
    );
});

export const getFollowingController = asyncHandler(async (req, res) => {
    const following = await getFollowing(req.user!._id);
    res.json(
        new ApiResponse(200, following, "Following retrieved successfully")
    );
});

export const getPendingRequestsController = asyncHandler(async (req, res) => {
    const requests = await getPendingRequests(req.user!._id);
    res.json(
        new ApiResponse(
            200,
            requests,
            "Pending requests retrieved successfully"
        )
    );
});

export const getSentPendingRequestsController = asyncHandler(
    async (req, res) => {
        const requests = await getSentPendingRequests(req.user!._id);
        res.json(
            new ApiResponse(
                200,
                requests,
                "Sent pending requests retrieved successfully"
            )
        );
    }
);

export const getRelationshipController = asyncHandler(async (req, res) => {
    const viewerId = req.user!._id;
    const targetId = toObjectId(req.params.studentId);

    const relationship = await getRelationshipState(viewerId, targetId);

    res.json(
        new ApiResponse(
            200,
            relationship,
            "Relationship retrieved successfully"
        )
    );
});
