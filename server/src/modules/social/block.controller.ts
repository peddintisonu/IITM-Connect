// blockStudent   → calls blockStudent service
// unblockStudent → calls unblockStudent service
// getBlockList   → calls getBlockList service

import mongoose from "mongoose";
import { ApiResponse, asyncHandler } from "../../shared/utils";
import { blockStudent, getBlockList, unblockStudent } from "./block.service";

export const blockController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const blockerId = req.user._id;
    const blockedId = new mongoose.Types.ObjectId(
        req.params.blockedId as string
    );

    const block = await blockStudent(blockerId, blockedId);

    res.json(new ApiResponse(200, block, "Student blocked successfully"));
});

export const unblockController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }

    const blockerId = req.user._id;
    const blockedId = new mongoose.Types.ObjectId(
        req.params.blockedId as string
    );

    const unblock = await unblockStudent(blockerId, blockedId);

    res.json(new ApiResponse(200, unblock, "Student unblocked successfully"));
});

export const getBlockListController = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }
    const blockerId = req.user._id;
    const blocks = await getBlockList(blockerId);
    res.json(new ApiResponse(200, blocks, "Block list retrieved successfully"));
});
