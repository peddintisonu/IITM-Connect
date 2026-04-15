// server/src/modules/social/follow.service.ts

import mongoose from "mongoose";
import {
    FOLLOW_STATUS,
    FOLLOW_TYPE,
} from "../../shared/constants/social.constants";
import { ApiError } from "../../shared/utils";
import Student from "../student/student.model";
import { Block } from "./block.model";
import { Follow } from "./follow.model";

export const sendFollowRequest = async (
    followerId: mongoose.Types.ObjectId,
    followingId: mongoose.Types.ObjectId,
    followingType: "Student" | "Org"
) => {
    if (followerId.equals(followingId)) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const isBlocked = await Block.findOne({
        $or: [
            { blockerId: followerId, blockedId: followingId },
            { blockerId: followingId, blockedId: followerId },
        ],
    });

    if (isBlocked) {
        throw new ApiError(403, "Unable to follow this user");
    }

    const existingFollow = await Follow.findOne({ followerId, followingId });
    if (existingFollow) {
        throw new ApiError(400, "Already following or request pending");
    }

    let status: typeof FOLLOW_STATUS.ACCEPTED | typeof FOLLOW_STATUS.PENDING =
        FOLLOW_STATUS.ACCEPTED;

    if (followingType === FOLLOW_TYPE.STUDENT) {
        const targetStudent = await Student.findById(followingId);
        if (!targetStudent) {
            throw new ApiError(404, "Student not found");
        }
        if (targetStudent.accountType === "private") {
            status = FOLLOW_STATUS.PENDING;
        }
    }

    const follow = await Follow.create({
        followerId,
        followingId,
        followingType,
        status,
        acceptedAt: status === FOLLOW_STATUS.ACCEPTED ? new Date() : undefined,
    });

    return follow;
};

export const acceptFollowRequest = async (
    studentId: mongoose.Types.ObjectId,
    followerId: mongoose.Types.ObjectId
) => {
    const follow = await Follow.findOneAndUpdate(
        { followerId, followingId: studentId, status: FOLLOW_STATUS.PENDING },
        { status: FOLLOW_STATUS.ACCEPTED, acceptedAt: new Date() },
        { returnDocument: "after" }
    );

    if (!follow) {
        throw new ApiError(404, "Follow request not found");
    }

    return follow;
};

export const rejectFollowRequest = async (
    studentId: mongoose.Types.ObjectId,
    followerId: mongoose.Types.ObjectId
) => {
    const follow = await Follow.findOneAndDelete({
        followerId,
        followingId: studentId,
        status: FOLLOW_STATUS.PENDING,
    });

    if (!follow) {
        throw new ApiError(404, "Follow request not found");
    }

    return follow;
};

export const unfollow = async (
    followerId: mongoose.Types.ObjectId,
    followingId: mongoose.Types.ObjectId
) => {
    const follow = await Follow.findOneAndDelete({ followerId, followingId });

    if (!follow) {
        throw new ApiError(404, "Follow not found");
    }

    return follow;
};

export const cancelSentFollowRequest = async (
    followerId: mongoose.Types.ObjectId,
    followingId: mongoose.Types.ObjectId
) => {
    const follow = await Follow.findOneAndDelete({
        followerId,
        followingId,
        status: FOLLOW_STATUS.PENDING,
    });

    if (!follow) {
        throw new ApiError(404, "Pending follow request not found");
    }

    return follow;
};

export const removeFollower = async (
    studentId: mongoose.Types.ObjectId,
    followerId: mongoose.Types.ObjectId
) => {
    const follow = await Follow.findOneAndDelete({
        followerId,
        followingId: studentId,
        status: FOLLOW_STATUS.ACCEPTED,
    });

    if (!follow) {
        throw new ApiError(404, "Follower not found");
    }

    return follow;
};

export const getFollowers = async (studentId: mongoose.Types.ObjectId) => {
    const followers = await Follow.find({
        followingId: studentId,
        status: FOLLOW_STATUS.ACCEPTED,
    }).populate("followerId", "fullName displayName profilePhoto username");

    return followers;
};

export const getFollowing = async (studentId: mongoose.Types.ObjectId) => {
    const following = await Follow.find({
        followerId: studentId,
        status: FOLLOW_STATUS.ACCEPTED,
    }).populate("followingId", "fullName displayName profilePhoto username");

    return following;
};

export const getPendingRequests = async (
    studentId: mongoose.Types.ObjectId
) => {
    const requests = await Follow.find({
        followingId: studentId,
        status: FOLLOW_STATUS.PENDING,
    }).populate("followerId", "fullName displayName profilePhoto username");

    return requests;
};

export const getSentPendingRequests = async (
    studentId: mongoose.Types.ObjectId
) => {
    const requests = await Follow.find({
        followerId: studentId,
        status: FOLLOW_STATUS.PENDING,
    }).populate("followingId", "fullName displayName profilePhoto username");

    return requests;
};

export const getRelationshipState = async (
    viewerId: mongoose.Types.ObjectId,
    targetId: mongoose.Types.ObjectId
) => {
    if (viewerId.equals(targetId)) {
        return {
            targetId: targetId.toString(),
            isSelf: true,
            followingStatus: "none" as const,
            followsMe: false,
            blockedByMe: false,
            blockedMe: false,
            canViewProfile: true,
            canFollow: false,
        };
    }

    const [
        targetStudent,
        blockRecords,
        outgoingFollow,
        incomingAcceptedFollow,
    ] = await Promise.all([
        Student.findById(targetId).select("_id status isOnboarded"),
        Block.find({
            $or: [
                { blockerId: viewerId, blockedId: targetId },
                { blockerId: targetId, blockedId: viewerId },
            ],
        }).select("blockerId blockedId"),
        Follow.findOne({
            followerId: viewerId,
            followingId: targetId,
            followingType: "Student",
        }).select("status"),
        Follow.findOne({
            followerId: targetId,
            followingId: viewerId,
            followingType: "Student",
            status: "accepted",
        }).select("_id"),
    ]);

    if (
        !targetStudent ||
        !targetStudent.isOnboarded ||
        targetStudent.status !== "active"
    ) {
        throw new ApiError(404, "Student not found");
    }

    const blockedByMe = blockRecords.some((record) =>
        record.blockerId.equals(viewerId)
    );
    const blockedMe = blockRecords.some((record) =>
        record.blockerId.equals(targetId)
    );

    const followingStatus = outgoingFollow?.status ?? "none";
    const followsMe = !!incomingAcceptedFollow;
    const canViewProfile = !blockedByMe && !blockedMe;
    const canFollow =
        !blockedByMe &&
        !blockedMe &&
        followingStatus !== "accepted" &&
        followingStatus !== "pending";

    return {
        targetId: targetId.toString(),
        isSelf: false,
        followingStatus,
        followsMe,
        blockedByMe,
        blockedMe,
        canViewProfile,
        canFollow,
    };
};
