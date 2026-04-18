// server/src/modules/social/follow.service.ts

import mongoose from "mongoose";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import { ApiError, ensureStudentExists } from "../../shared/utils";
import { STUDENT_STATUS } from "../students/student.constants";
import Student from "../students/student.model";
import { Block } from "./block.model";
import { Follow } from "./follow.model";
import { isBlockedBetween } from "./relationships.utils";
import { FOLLOW_STATUS, FOLLOW_TYPE } from "./social.constants";
import { socialErrorMessages } from "./socialMessages";

export const sendFollowRequest = async (
    followerId: mongoose.Types.ObjectId,
    followingId: mongoose.Types.ObjectId,
    followingType: "Student" | "Org"
) => {
    if (followerId.equals(followingId)) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            socialErrorMessages.cannotFollowSelf
        );
    }

    const isBlocked = await isBlockedBetween(followerId, followingId);

    if (isBlocked) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            socialErrorMessages.unableToFollowUser
        );
    }

    const existingFollow = await Follow.findOne({ followerId, followingId });
    if (existingFollow) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            socialErrorMessages.alreadyFollowingOrPending
        );
    }

    let status: typeof FOLLOW_STATUS.ACCEPTED | typeof FOLLOW_STATUS.PENDING =
        FOLLOW_STATUS.ACCEPTED;

    if (followingType === FOLLOW_TYPE.STUDENT) {
        const targetStudent = await Student.findById(followingId).select(
            "_id accountType status isOnboarded"
        );
        const validStudent = ensureStudentExists(targetStudent);

        if (
            !validStudent.isOnboarded ||
            validStudent.status !== STUDENT_STATUS.ACTIVE
        ) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                socialErrorMessages.studentNotFound
            );
        }

        if (validStudent.accountType === "private") {
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
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            socialErrorMessages.followRequestNotFound
        );
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
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            socialErrorMessages.followRequestNotFound
        );
    }

    return follow;
};

export const unfollow = async (
    followerId: mongoose.Types.ObjectId,
    followingId: mongoose.Types.ObjectId
) => {
    const follow = await Follow.findOneAndDelete({ followerId, followingId });

    if (!follow) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            socialErrorMessages.followNotFound
        );
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
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            socialErrorMessages.pendingFollowRequestNotFound
        );
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
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            socialErrorMessages.followerNotFound
        );
    }

    return follow;
};

// TODO: add cursor pagination (limit, cursor) for followers list and return { items, nextCursor, hasMore }
export const getFollowers = async (studentId: mongoose.Types.ObjectId) => {
    const followers = await Follow.find({
        followingId: studentId,
        status: FOLLOW_STATUS.ACCEPTED,
    }).populate("followerId", "fullName displayName profilePhoto username");

    return followers;
};

// TODO: add cursor pagination (limit, cursor) for following list and return { items, nextCursor, hasMore }
export const getFollowing = async (studentId: mongoose.Types.ObjectId) => {
    const following = await Follow.find({
        followerId: studentId,
        status: FOLLOW_STATUS.ACCEPTED,
    }).populate("followingId", "fullName displayName profilePhoto username");

    return following;
};

// TODO: add cursor pagination (limit, cursor) for incoming follow requests and return { items, nextCursor, hasMore }
export const getPendingRequests = async (
    studentId: mongoose.Types.ObjectId
) => {
    const requests = await Follow.find({
        followingId: studentId,
        status: FOLLOW_STATUS.PENDING,
    }).populate("followerId", "fullName displayName profilePhoto username");

    return requests;
};

// TODO: add cursor pagination (limit, cursor) for sent follow requests and return { items, nextCursor, hasMore }
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
        }).select("blockerId"),
        Follow.findOne({
            followerId: viewerId,
            followingId: targetId,
            followingType: "Student",
        }).select("status"),
        Follow.findOne({
            followerId: targetId,
            followingId: viewerId,
            followingType: "Student",
            status: FOLLOW_STATUS.ACCEPTED,
        }).select("_id"),
    ]);

    if (
        !targetStudent ||
        !targetStudent.isOnboarded ||
        targetStudent.status !== STUDENT_STATUS.ACTIVE
    ) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            socialErrorMessages.studentNotFound
        );
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
        followingStatus !== FOLLOW_STATUS.ACCEPTED &&
        followingStatus !== FOLLOW_STATUS.PENDING;

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
