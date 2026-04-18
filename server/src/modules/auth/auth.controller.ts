import { Request, Response } from "express";
import {
    accessCookieOptions,
    authErrorMessages,
    authRouteMessages,
    refreshCookieOptions,
} from "../../shared/constants/auth.constants";
import { ApiError } from "../../shared/utils/ApiError";
import { ApiResponse } from "../../shared/utils/ApiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { IStudent } from "../student/student.model";
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
    getSessionIdFromAccessToken,
    type SessionContext,
} from "./auth.utils";
import Session from "./session.model";

const clearAuthCookies = (res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
};

export const googleCallback = asyncHandler(
    async (req: Request, res: Response) => {
        const student = req.user as IStudent;
        if (!student) throw new ApiError(401, authErrorMessages.unauthorized);

        const sessionContext = buildSessionContext(req);
        const { accessToken, refreshToken } = await generateTokens(
            student,
            sessionContext
        );

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        res.cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", refreshToken, refreshCookieOptions)
            .redirect(frontendUrl);
    }
);

export const refreshToken = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies.refreshToken;
        if (!token) throw new ApiError(401, authErrorMessages.noRefreshToken);

        const sessionContext = buildSessionContext(req);

        const { accessToken, refreshToken: newRefreshToken } =
            await refreshAccessToken(token, sessionContext);

        res.cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
            .json(new ApiResponse(200, null, authRouteMessages.tokenRefreshed));
    }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new ApiError(401, authErrorMessages.noRefreshToken);

    await logoutOne(token);
    clearAuthCookies(res);

    res.json(new ApiResponse(200, null, authRouteMessages.loggedOut));
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const student = req.user! as IStudent;
    const accessToken = req.cookies.accessToken;
    const currentSessionId = accessToken
        ? getSessionIdFromAccessToken(accessToken)
        : undefined;

    await logoutAllSessions(student._id.toString(), currentSessionId);
    await student.incrementTokenVersion();

    const currentSession = currentSessionId
        ? await Session.findById(currentSessionId)
        : null;

    if (!currentSession) {
        throw new ApiError(401, authErrorMessages.sessionExpired);
    }

    const currentSessionContext: SessionContext =
        buildSessionContextFromExistingSession(currentSession, req);

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await rotateExistingSessionTokens(
            currentSession,
            student,
            currentSessionContext
        );

    // Set cookies for current session
    res.cookie("accessToken", newAccessToken, accessCookieOptions).cookie(
        "refreshToken",
        newRefreshToken,
        refreshCookieOptions
    );
    res.json(new ApiResponse(200, null, authRouteMessages.loggedOutAll));
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
    res.json(new ApiResponse(200, result, authRouteMessages.sessionsFetched));
});

// Revoke (logout) a specific session for the current user
export const revokeSession = asyncHandler(
    async (req: Request, res: Response) => {
        const student = req.user! as IStudent;
        const sessionId = Array.isArray(req.params.sessionId)
            ? req.params.sessionId[0]
            : req.params.sessionId;
        await revokeSessionService(student._id.toString(), sessionId);

        res.json(new ApiResponse(200, null, authRouteMessages.sessionRevoked));
    }
);
