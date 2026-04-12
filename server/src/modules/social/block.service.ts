// blockStudent(blockerId, blockedId)
//   → can't block yourself
//   → check if already blocked
//   → create Block document

// unblockStudent(blockerId, blockedId)
//   → check if block exists
//   → delete Block document
//   → also delete any existing follow between them

// getBlockList(blockerId)
//   → return all students this person has blocked

import mongoose from "mongoose";
import { ApiError } from "../../shared/utils";
import { Block } from "./block.model";
import { Follow } from "./follow.model";

export const blockStudent = async (
    blockerId: mongoose.Types.ObjectId,
    blockedId: mongoose.Types.ObjectId
) => {
    if (blockerId.equals(blockedId)) {
        throw new ApiError(400, "You cannot block yourself");
    }

    const existingBlock = await Block.findOne({
        blockerId,
        blockedId,
    });

    if (existingBlock) {
        throw new ApiError(400, "You have already blocked this student");
    }

    await Follow.deleteMany({
        $or: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
        ],
    });

    const block = await Block.create({
        blockerId,
        blockedId,
    });

    return block;
};

export const unblockStudent = async (
    blockerId: mongoose.Types.ObjectId,
    blockedId: mongoose.Types.ObjectId
) => {
    const block = await Block.findOneAndDelete({
        blockerId,
        blockedId,
    });

    if (!block) {
        throw new ApiError(404, "Block not found");
    }

    return block;
};

export const getBlockList = async (blockerId: mongoose.Types.ObjectId) => {
    const blocks = await Block.find({ blockerId }).populate(
        "blockedId",
        "fullName profilePhoto username"
    );
    return blocks;
};
