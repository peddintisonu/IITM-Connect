import mongoose from "mongoose";
import { Block } from "../block.model";

/**
 * Checks if a bidirectional block exists between two users.
 * Centralizes the block-check query to a single point.
 * Used by both student and social modules to prevent duplication.
 */
export const isBlockedBetween = async (
    userId1: mongoose.Types.ObjectId,
    userId2: mongoose.Types.ObjectId
) => {
    return Block.findOne({
        $or: [
            { blockerId: userId1, blockedId: userId2 },
            { blockerId: userId2, blockedId: userId1 },
        ],
    });
};

/**
 * Checks if a bidirectional block exists and returns blocking details.
 * Useful for API responses that need to know which direction the block is.
 */
export const getBlockStatus = async (
    userId1: mongoose.Types.ObjectId,
    userId2: mongoose.Types.ObjectId
) => {
    const block = await Block.findOne({
        $or: [
            { blockerId: userId1, blockedId: userId2 },
            { blockerId: userId2, blockedId: userId1 },
        ],
    });

    return {
        isBlocked: !!block,
        block,
    };
};
