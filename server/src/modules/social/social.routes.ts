// server/src/modules/social/social.routes.ts

import { Router } from "express";
import {
    protectRoute,
    requireOnboardingComplete,
} from "../../shared/middleware/auth.middleware";
import {
    blockController,
    getBlockListController,
    unblockController,
} from "./block/block.controller";
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
} from "./follow/follow.controller";

const router = Router();

router.use(protectRoute, requireOnboardingComplete);

// block routes
router.post("/block/:blockedId", blockController);
router.delete("/block/:blockedId", unblockController);
router.get("/block", getBlockListController);

// follow routes
router.post("/follow/:followingId", sendFollowRequestController);
router.delete(
    "/follow/:followingId/request",
    cancelSentFollowRequestController
);
router.delete("/follow/:followingId", unfollowController);
router.post("/follow/:followerId/accept", acceptFollowRequestController);
router.post("/follow/:followerId/reject", rejectFollowRequestController);
router.delete("/follow/:followerId/remove", removeFollowerController);
router.get("/follow/followers", getFollowersController);
router.get("/follow/following", getFollowingController);
router.get("/follow/requests", getPendingRequestsController);
router.get("/follow/requests/sent", getSentPendingRequestsController);

router.get("/relationship/:studentId", getRelationshipController);

export default router;
