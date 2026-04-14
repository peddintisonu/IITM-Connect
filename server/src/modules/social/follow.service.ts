// server/src/modules/social/follow.service.ts

import mongoose from "mongoose";
import { ApiError } from "../../shared/utils";
import Student from "../student/student.model";
import { Block } from "./block.model";
import { Follow } from "./follow.model";

export const sendFollowRequest = async (
    followerId: mongoose.Types.ObjectId,
    followingId: mongoose.Types.ObjectId,
    followingType: "student" | "org"
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

    let status: "pending" | "accepted" = "accepted";

    if (followingType === "student") {
        const targetStudent = await Student.findById(followingId);
        if (!targetStudent) {
            throw new ApiError(404, "Student not found");
        }
        if (targetStudent.accountType === "private") {
            status = "pending";
        }
    }

    const follow = await Follow.create({
        followerId,
        followingId,
        followingType,
        status,
        acceptedAt: status === "accepted" ? new Date() : undefined,
    });

    return follow;
};

export const acceptFollowRequest = async (
    studentId: mongoose.Types.ObjectId,
    followerId: mongoose.Types.ObjectId
) => {
    const follow = await Follow.findOneAndUpdate(
        { followerId, followingId: studentId, status: "pending" },
        { status: "accepted", acceptedAt: new Date() },
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
        status: "pending",
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

export const removeFollower = async (
    studentId: mongoose.Types.ObjectId,
    followerId: mongoose.Types.ObjectId
) => {
    const follow = await Follow.findOneAndDelete({
        followerId,
        followingId: studentId,
        status: "accepted",
    });

    if (!follow) {
        throw new ApiError(404, "Follower not found");
    }

    return follow;
};

export const getFollowers = async (studentId: mongoose.Types.ObjectId) => {
    const followers = await Follow.find({
        followingId: studentId,
        status: "accepted",
    }).populate("followerId", "fullName displayName profilePhoto username");

    return followers;
};

export const getFollowing = async (studentId: mongoose.Types.ObjectId) => {
    const following = await Follow.find({
        followerId: studentId,
        status: "accepted",
    }).populate("followingId", "fullName displayName profilePhoto username");

    return following;
};

export const getPendingRequests = async (
    studentId: mongoose.Types.ObjectId
) => {
    const requests = await Follow.find({
        followingId: studentId,
        status: "pending",
    }).populate("followerId", "fullName displayName profilePhoto username");

    return requests;
};
