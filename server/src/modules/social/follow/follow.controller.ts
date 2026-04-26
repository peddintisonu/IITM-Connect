// server/src/modules/social/follow/follow.controller.ts

import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import {
    ApiError,
    ApiResponse,
    asyncHandler,
    toObjectId,
    validateAndParse,
} from "../../../shared/utils";
import {
    SocialListPaginationInput,
    socialListPaginationSchema,
} from "../../../validations/social.validation";
import { FOLLOW_TYPE } from "../social.constants";
import { socialErrorMessages, socialRouteMessages } from "../socialMessages";
import {
    acceptFollowRequest,
    cancelSentFollowRequest,
    getFollowers,
    getFollowing,
    getPendingRequests,
    getRelationshipState,
    getSentPendingRequests,
    rejectFollowRequest,
    removeFollower,
    sendFollowRequest,
    unfollow,
} from "./follow.service";

export const sendFollowRequestController = asyncHandler(async (req, res) => {
    const { followingType } = req.body;
    if (
        followingType !== FOLLOW_TYPE.STUDENT &&
        followingType !== FOLLOW_TYPE.ORG
    ) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            socialErrorMessages.followingTypeInvalid
        );
    }

    const followerId = req.user!._id;
    const followingId = toObjectId(req.params.followingId);

    const follow = await sendFollowRequest(
        followerId,
        followingId,
        followingType
    );
    res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            follow,
            socialRouteMessages.followRequestSent
        )
    );
});

export const acceptFollowRequestController = asyncHandler(async (req, res) => {
    const studentId = req.user!._id;
    const followerId = toObjectId(req.params.followerId);

    const follow = await acceptFollowRequest(studentId, followerId);
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            follow,
            socialRouteMessages.followRequestAccepted
        )
    );
});

export const rejectFollowRequestController = asyncHandler(async (req, res) => {
    const studentId = req.user!._id;
    const followerId = toObjectId(req.params.followerId);

    const follow = await rejectFollowRequest(studentId, followerId);
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            follow,
            socialRouteMessages.followRequestRejected
        )
    );
});

export const unfollowController = asyncHandler(async (req, res) => {
    const followerId = req.user!._id;
    const followingId = toObjectId(req.params.followingId);

    const follow = await unfollow(followerId, followingId);
    res.json(
        new ApiResponse(HTTP_STATUS.OK, follow, socialRouteMessages.unfollowed)
    );
});

export const cancelSentFollowRequestController = asyncHandler(
    async (req, res) => {
        const followerId = req.user!._id;
        const followingId = toObjectId(req.params.followingId);

        const follow = await cancelSentFollowRequest(followerId, followingId);
        res.json(
            new ApiResponse(
                HTTP_STATUS.OK,
                follow,
                socialRouteMessages.followRequestCanceled
            )
        );
    }
);

export const removeFollowerController = asyncHandler(async (req, res) => {
    const studentId = req.user!._id;
    const followerId = toObjectId(req.params.followerId);

    const follow = await removeFollower(studentId, followerId);
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            follow,
            socialRouteMessages.followerRemoved
        )
    );
});

export const getFollowersController = asyncHandler(async (req, res) => {
    const data: SocialListPaginationInput = validateAndParse(
        socialListPaginationSchema,
        req.query
    );
    const followers = await getFollowers(req.user!._id, data);
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            followers,
            socialRouteMessages.followersFetched
        )
    );
});

export const getFollowingController = asyncHandler(async (req, res) => {
    const data: SocialListPaginationInput = validateAndParse(
        socialListPaginationSchema,
        req.query
    );
    const following = await getFollowing(req.user!._id, data);
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            following,
            socialRouteMessages.followingFetched
        )
    );
});

export const getPendingRequestsController = asyncHandler(async (req, res) => {
    const data: SocialListPaginationInput = validateAndParse(
        socialListPaginationSchema,
        req.query
    );
    const requests = await getPendingRequests(req.user!._id, data);
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            requests,
            socialRouteMessages.pendingRequestsFetched
        )
    );
});

export const getSentPendingRequestsController = asyncHandler(
    async (req, res) => {
        const data: SocialListPaginationInput = validateAndParse(
            socialListPaginationSchema,
            req.query
        );
        const requests = await getSentPendingRequests(req.user!._id, data);
        res.json(
            new ApiResponse(
                HTTP_STATUS.OK,
                requests,
                socialRouteMessages.sentPendingRequestsFetched
            )
        );
    }
);

export const getRelationshipController = asyncHandler(async (req, res) => {
    const viewerId = req.user!._id;
    const targetId = toObjectId(req.params.studentId);

    const relationship = await getRelationshipState(viewerId, targetId);

    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            relationship,
            socialRouteMessages.relationshipFetched
        )
    );
});
