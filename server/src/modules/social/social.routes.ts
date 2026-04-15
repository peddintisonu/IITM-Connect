// server/src/modules/social/social.routes.ts

import { Router } from "express";
import {
    protectRoute,
    requireAuth,
} from "../../shared/middleware/auth.middleware";
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
router.post("/block/:blockedId", protectRoute, requireAuth, blockController);
router.delete(
    "/block/:blockedId",
    protectRoute,
    requireAuth,
    unblockController
);
router.get("/block", protectRoute, requireAuth, getBlockListController);

// follow routes
router.post(
    "/follow/:followingId",
    protectRoute,
    requireAuth,
    sendFollowRequestController
);
router.delete(
    "/follow/:followingId/request",
    protectRoute,
    requireAuth,
    cancelSentFollowRequestController
);
router.delete(
    "/follow/:followingId",
    protectRoute,
    requireAuth,
    unfollowController
);
router.post(
    "/follow/:followerId/accept",
    protectRoute,
    requireAuth,
    acceptFollowRequestController
);
router.post(
    "/follow/:followerId/reject",
    protectRoute,
    requireAuth,
    rejectFollowRequestController
);
router.delete(
    "/follow/:followerId/remove",
    protectRoute,
    requireAuth,
    removeFollowerController
);
router.get(
    "/follow/followers",
    protectRoute,
    requireAuth,
    getFollowersController
);
router.get(
    "/follow/following",
    protectRoute,
    requireAuth,
    getFollowingController
);
router.get(
    "/follow/requests",
    protectRoute,
    requireAuth,
    getPendingRequestsController
);
router.get(
    "/follow/requests/sent",
    protectRoute,
    requireAuth,
    getSentPendingRequestsController
);

router.get(
    "/relationship/:studentId",
    protectRoute,
    requireAuth,
    getRelationshipController
);

export default router;
