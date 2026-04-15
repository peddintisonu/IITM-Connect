// server/src/modules/social/block.controller.ts

import { ApiResponse, asyncHandler, toObjectId } from "../../shared/utils";
import { blockStudent, getBlockList, unblockStudent } from "./block.service";

export const blockController = asyncHandler(async (req, res) => {
    const blockerId = req.user!._id;
    const blockedId = toObjectId(req.params.blockedId);

    const block = await blockStudent(blockerId, blockedId);

    res.json(new ApiResponse(200, block, "Student blocked successfully"));
});

export const unblockController = asyncHandler(async (req, res) => {
    const blockerId = req.user!._id;
    const blockedId = toObjectId(req.params.blockedId);

    const unblock = await unblockStudent(blockerId, blockedId);

    res.json(new ApiResponse(200, unblock, "Student unblocked successfully"));
});

export const getBlockListController = asyncHandler(async (req, res) => {
    const blockerId = req.user!._id;
    const blocks = await getBlockList(blockerId);
    res.json(new ApiResponse(200, blocks, "Block list retrieved successfully"));
});
