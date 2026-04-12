// server/src/modules/social/follow.controller.ts

import mongoose from "mongoose";
import { ApiResponse, asyncHandler } from "../../shared/utils";
import {
    sendFollowRequest,
    acceptFollowRequest,
    rejectFollowRequest,
    unfollow,
    removeFollower,
    getFollowers,
    getFollowing,
    getPendingRequests,
} from "./follow.service";

export const sendFollowRequestController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const followerId = req.user._id;
    const followingId = new mongoose.Types.ObjectId(
        req.params.followingId as string
    );
    const { followingType } = req.body;

    const follow = await sendFollowRequest(
        followerId,
        followingId,
        followingType
    );
    res.status(201).json(new ApiResponse(201, follow, "Follow request sent"));
});

export const acceptFollowRequestController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const studentId = req.user._id;
    const followerId = new mongoose.Types.ObjectId(
        req.params.followerId as string
    );

    const follow = await acceptFollowRequest(studentId, followerId);
    res.json(new ApiResponse(200, follow, "Follow request accepted"));
});

export const rejectFollowRequestController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const studentId = req.user._id;
    const followerId = new mongoose.Types.ObjectId(
        req.params.followerId as string
    );

    const follow = await rejectFollowRequest(studentId, followerId);
    res.json(new ApiResponse(200, follow, "Follow request rejected"));
});

export const unfollowController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const followerId = req.user._id;
    const followingId = new mongoose.Types.ObjectId(
        req.params.followingId as string
    );

    const follow = await unfollow(followerId, followingId);
    res.json(new ApiResponse(200, follow, "Unfollowed successfully"));
});

export const removeFollowerController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const studentId = req.user._id;
    const followerId = new mongoose.Types.ObjectId(
        req.params.followerId as string
    );

    const follow = await removeFollower(studentId, followerId);
    res.json(new ApiResponse(200, follow, "Follower removed successfully"));
});

export const getFollowersController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const followers = await getFollowers(req.user._id);
    res.json(
        new ApiResponse(200, followers, "Followers retrieved successfully")
    );
});

export const getFollowingController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const following = await getFollowing(req.user._id);
    res.json(
        new ApiResponse(200, following, "Following retrieved successfully")
    );
});

export const getPendingRequestsController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const requests = await getPendingRequests(req.user._id);
    res.json(
        new ApiResponse(
            200,
            requests,
            "Pending requests retrieved successfully"
        )
    );
});
