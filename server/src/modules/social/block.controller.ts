// server/src/modules/social/block.controller.ts

import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import { ApiResponse, asyncHandler, toObjectId } from "../../shared/utils";
import { blockStudent, getBlockList, unblockStudent } from "./block.service";
import { socialRouteMessages } from "./socialMessages";

export const blockController = asyncHandler(async (req, res) => {
    const blockerId = req.user!._id;
    const blockedId = toObjectId(req.params.blockedId);

    const block = await blockStudent(blockerId, blockedId);

    res.json(
        new ApiResponse(HTTP_STATUS.OK, block, socialRouteMessages.blockCreated)
    );
});

export const unblockController = asyncHandler(async (req, res) => {
    const blockerId = req.user!._id;
    const blockedId = toObjectId(req.params.blockedId);

    const unblock = await unblockStudent(blockerId, blockedId);

    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            unblock,
            socialRouteMessages.blockRemoved
        )
    );
});

export const getBlockListController = asyncHandler(async (req, res) => {
    const blockerId = req.user!._id;
    const blocks = await getBlockList(blockerId);
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            blocks,
            socialRouteMessages.blockListFetched
        )
    );
});
