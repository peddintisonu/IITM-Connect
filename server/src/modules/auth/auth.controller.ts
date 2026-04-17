import { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import { ApiError } from "../../shared/utils/ApiError";
import { ApiResponse } from "../../shared/utils/ApiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { IStudent } from "../students/student.model";
import { authErrorMessages, authRouteMessages } from "./auth.messages";
import {
    generateTokens,
    listSessionsForUser,
    logoutAll as logoutAllSessions,
    logoutOne,
    refreshAccessToken,
    revokeSession as revokeSessionService,
    rotateExistingSessionTokens,
} from "./auth.service";
import {
    buildSessionContext,
    buildSessionContextFromExistingSession,
    clearAuthCookies,
    ensureSessionExists,
    getSessionIdFromAccessToken,
    setAuthCookies,
    type SessionContext,
} from "./auth.utils";
import Session from "./session.model";

export const googleCallback = asyncHandler(
    async (req: Request, res: Response) => {
        const student = req.user as IStudent;
        if (!student) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                authErrorMessages.unauthorized
            );
        }

        const sessionContext = buildSessionContext(req);
        const { accessToken, refreshToken } = await generateTokens(
            student,
            sessionContext
        );

        setAuthCookies(res, accessToken, refreshToken).redirect("/");
    }
);

export const refreshToken = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies.refreshToken;
        if (!token) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                authErrorMessages.noRefreshToken
            );
        }

        const sessionContext = buildSessionContext(req);

        const { accessToken, refreshToken: newRefreshToken } =
            await refreshAccessToken(token, sessionContext);

        setAuthCookies(res, accessToken, newRefreshToken).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                null,
                authRouteMessages.tokenRefreshed
            )
        );
    }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            authErrorMessages.noRefreshToken
        );
    }

    await logoutOne(token);
    clearAuthCookies(res);

    res.json(
        new ApiResponse(HTTP_STATUS.OK, null, authRouteMessages.loggedOut)
    );
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const student = req.user! as IStudent;
    const accessToken = req.cookies.accessToken;
    const currentSessionId = accessToken
        ? getSessionIdFromAccessToken(accessToken)
        : undefined;

    await logoutAllSessions(student._id.toString(), currentSessionId);
    await student.incrementTokenVersion();

    const currentSession = ensureSessionExists(
        currentSessionId ? await Session.findById(currentSessionId) : null,
        authErrorMessages.sessionExpired
    );

    const currentSessionContext: SessionContext =
        buildSessionContextFromExistingSession(currentSession, req);

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await rotateExistingSessionTokens(
            currentSession,
            student,
            currentSessionContext
        );

    setAuthCookies(res, newAccessToken, newRefreshToken);
    res.json(
        new ApiResponse(HTTP_STATUS.OK, null, authRouteMessages.loggedOutAll)
    );
});

// List all sessions for the current user
export const getSessions = asyncHandler(async (req: Request, res: Response) => {
    const student = req.user! as IStudent;
    const accessToken = req.cookies.accessToken;
    const currentSessionId = accessToken
        ? getSessionIdFromAccessToken(accessToken)
        : undefined;
    const result = await listSessionsForUser(
        student._id.toString(),
        currentSessionId
    );
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            result,
            authRouteMessages.sessionsFetched
        )
    );
});

// Revoke (logout) a specific session for the current user
export const revokeSession = asyncHandler(
    async (req: Request, res: Response) => {
        const student = req.user! as IStudent;
        const sessionId = Array.isArray(req.params.sessionId)
            ? req.params.sessionId[0]
            : req.params.sessionId;
        await revokeSessionService(student._id.toString(), sessionId);

        res.json(
            new ApiResponse(
                HTTP_STATUS.OK,
                null,
                authRouteMessages.sessionRevoked
            )
        );
    }
);
