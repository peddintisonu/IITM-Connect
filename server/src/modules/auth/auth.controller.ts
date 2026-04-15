import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import { ENV } from "../../config/env";
import {
    accessCookieOptions,
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
} from "./auth.service";
import Session from "./session.model";

const clearAuthCookies = (res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
};

export const googleCallback = asyncHandler(
    async (req: Request, res: Response) => {
        const student = req.user as IStudent;
        if (!student) throw new ApiError(401, "Authentication failed");

        const parser = new UAParser(req.headers["user-agent"]);
        const result = parser.getResult();
        const deviceInfo = `${result.browser.name} on ${result.os.name}`;

        const ipAddress =
            req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
            req.socket.remoteAddress ||
            "unknown";
        const userAgent = req.headers["user-agent"] || "unknown";
        const { accessToken, refreshToken } = await generateTokens(
            student,
            deviceInfo,
            ipAddress,
            userAgent
        );

        res.cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", refreshToken, refreshCookieOptions)
            .redirect("/");
    }
);

export const refreshToken = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies.refreshToken;
        if (!token) throw new ApiError(401, "No refresh token provided");

        const { accessToken, refreshToken: newRefreshToken } =
            await refreshAccessToken(token);

        res.cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
            .json(new ApiResponse(200, null, "Token refreshed successfully"));
    }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new ApiError(401, "No refresh token provided");

    await logoutOne(token);
    clearAuthCookies(res);

    res.json(new ApiResponse(200, null, "Logged out successfully"));
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const student = req.user! as IStudent;
    // Get current sessionId from JWT (set by protectRoute)
    const accessToken = req.cookies.accessToken;
    const currentSessionId: string | undefined = accessToken
        ? (
              jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET) as {
                  sessionId: string;
              }
          ).sessionId
        : undefined;

    await logoutAllSessions(student._id.toString(), currentSessionId);
    await student.incrementTokenVersion();

    const currentSession = currentSessionId
        ? await Session.findById(currentSessionId)
        : null;

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateTokens(
            student,
            currentSession?.deviceInfo || "Unknown Device",
            currentSession?.ipAddress || req.ip,
            currentSession?.userAgent || req.headers["user-agent"] || "unknown"
        );

    res.cookie("accessToken", newAccessToken, accessCookieOptions).cookie(
        "refreshToken",
        newRefreshToken,
        refreshCookieOptions
    );
    // Set cookies for current session
    res.cookie("accessToken", newAccessToken, accessCookieOptions).cookie(
        "refreshToken",
        newRefreshToken,
        refreshCookieOptions
    );
    res.json(
        new ApiResponse(
            200,
            null,
            "Logged out of all devices except this one successfully"
        )
    );
});

// List all sessions for the current user
export const getSessions = asyncHandler(async (req: Request, res: Response) => {
    const student = req.user! as IStudent;
    const accessToken = req.cookies.accessToken;
    const currentSessionId: string | undefined = accessToken
        ? (
              jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET) as {
                  sessionId: string;
              }
          ).sessionId
        : undefined;
    const result = await listSessionsForUser(
        student._id.toString(),
        currentSessionId
    );
    res.json(new ApiResponse(200, result, "Sessions fetched successfully"));
});

// Revoke (logout) a specific session for the current user
export const revokeSession = asyncHandler(
    async (req: Request, res: Response) => {
        const student = req.user! as IStudent;
        const sessionId = Array.isArray(req.params.sessionId)
            ? req.params.sessionId[0]
            : req.params.sessionId;
        await revokeSessionService(student._id.toString(), sessionId);

        res.json(new ApiResponse(200, null, "Session revoked successfully"));
    }
);
