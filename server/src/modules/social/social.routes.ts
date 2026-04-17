// server/src/modules/social/social.routes.ts

import { Router } from "express";
import { protectRoute } from "../../shared/middleware/auth.middleware";
import {
    blockController,
    getBlockListController,
    unblockController,
} from "./block.controller";
import {
    acceptFollowRequestController,
    cancelSentFollowRequestController,
    getFollowersController,
    getFollowingController,
    getPendingRequestsController,
    getRelationshipController,
    getSentPendingRequestsController,
    rejectFollowRequestController,
    removeFollowerController,
    sendFollowRequestController,
    unfollowController,
} from "./follow.controller";

const router = Router();

// block routes
router.post("/block/:blockedId", protectRoute, blockController);
router.delete("/block/:blockedId", protectRoute, unblockController);
router.get("/block", protectRoute, getBlockListController);

// follow routes
router.post("/follow/:followingId", protectRoute, sendFollowRequestController);
router.delete(
    "/follow/:followingId/request",
    protectRoute,
    cancelSentFollowRequestController
);
router.delete("/follow/:followingId", protectRoute, unfollowController);
router.post(
    "/follow/:followerId/accept",
    protectRoute,
    acceptFollowRequestController
);
router.post(
    "/follow/:followerId/reject",
    protectRoute,
    rejectFollowRequestController
);
router.delete(
    "/follow/:followerId/remove",
    protectRoute,
    removeFollowerController
);
router.get("/follow/followers", protectRoute, getFollowersController);
router.get("/follow/following", protectRoute, getFollowingController);
router.get("/follow/requests", protectRoute, getPendingRequestsController);
router.get(
    "/follow/requests/sent",
    protectRoute,
    getSentPendingRequestsController
);

router.get("/relationship/:studentId", protectRoute, getRelationshipController);

export default router;

// TODO: add limit and pagination to followers/following endpoints, and also add endpoint to get mutual followers between two users
