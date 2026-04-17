import crypto from "crypto";
import jwt from "jsonwebtoken";

import { ENV } from "../../config/env";
import { tokenExpiry } from "../../shared/constants/auth.constants";
import { ApiError } from "../../shared/utils";
import Student, { IStudent } from "../student/student.model";
import type { SessionContext } from "./auth.utils";
import Session from "./session.model";

const SESSION_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const buildDeleteAt = (endedAt: Date) =>
    new Date(endedAt.getTime() + SESSION_RETENTION_MS);

const finalizeSessionEnd = async (
    sessionId: string,
    reason: "logout" | "expired" | "revoked",
    endedAt = new Date()
) => {
    await Session.updateOne(
        { _id: sessionId, endedAt: { $exists: false } },
        {
            $set: {
                endedAt,
                endReason: reason,
                deletesAt: buildDeleteAt(endedAt),
                revoked: reason === "revoked",
                lastAccessedAt: endedAt,
            },
            $unset: {
                refreshToken: "",
                previousRefreshToken: "",
                graceExpiresAt: "",
            },
        }
    );
};

export const generateTokens = async (
    student: IStudent,
    sessionContext?: SessionContext
) => {
    const currentLocation = sessionContext?.currentLocation;

    const session = new Session({
        userId: student._id,
        deviceInfo: sessionContext?.deviceInfo || "Unknown Device",
        expiresAt: new Date(Date.now() + tokenExpiry.refreshToken * 1000),
        currentLocation,
        initialLocation: currentLocation,
        userAgent: sessionContext?.userAgent,
        lastAccessedAt: new Date(),
    });

    const payload = {
        studentId: student._id,
        tokenVersion: student.tokenVersion,
        sessionId: session._id,
    };

    const accessToken = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: tokenExpiry.accessToken,
    });

    const refreshToken = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: tokenExpiry.refreshToken,
    });

    session.refreshToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    await session.save();

    return { accessToken, refreshToken };
};

export const refreshAccessToken = async (
    refreshToken: string,
    sessionContext?: SessionContext
) => {
    try {
        const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET) as {
            studentId: string;
            tokenVersion: number;
            sessionId: string;
        };

        const session = await Session.findById(decoded.sessionId);
        if (!session) {
            throw new ApiError(401, "Session expired, please login again");
        }
        if (session.endedAt) {
            throw new ApiError(401, "Session ended, please login again");
        }
        if (session.revoked) {
            throw new ApiError(401, "Session revoked, please login again");
        }
        if (session.expiresAt <= new Date()) {
            await finalizeSessionEnd(session.id, "expired", new Date());
            throw new ApiError(401, "Session expired, please login again");
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const isCurrentRefreshToken = session.refreshToken === hashedToken;
        const isPreviousRefreshTokenInGraceWindow =
            session.previousRefreshToken === hashedToken &&
            !!session.graceExpiresAt &&
            session.graceExpiresAt > new Date();

        if (!isCurrentRefreshToken && !isPreviousRefreshTokenInGraceWindow) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const student = await Student.findById(decoded.studentId);
        if (!student) {
            throw new ApiError(401, "Student not found");
        }

        if (decoded.tokenVersion !== student.tokenVersion) {
            throw new ApiError(401, "Token invalidated, please login again");
        }

        if (sessionContext) {
            session.deviceInfo =
                sessionContext.deviceInfo ?? session.deviceInfo;
            session.userAgent = sessionContext.userAgent ?? session.userAgent;
            session.currentLocation = sessionContext.currentLocation;
            session.lastAccessedAt = new Date();
        }

        const payload = {
            studentId: student._id,
            tokenVersion: student.tokenVersion,
            sessionId: session._id,
        };

        const accessToken = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
            expiresIn: tokenExpiry.accessToken,
        });

        const newRefreshToken = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
            expiresIn: tokenExpiry.refreshToken,
        });

        session.previousRefreshToken = session.refreshToken;
        session.refreshToken = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");
        session.rotatedAt = new Date();
        session.expiresAt = new Date(
            Date.now() + tokenExpiry.refreshToken * 1000
        );
        session.graceExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await session.save();

        return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(401, "Invalid refresh token");
    }
};

export const logoutOne = async (refreshToken: string) => {
    try {
        const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET) as {
            sessionId: string;
        };

        const session = await Session.findById(decoded.sessionId);
        if (!session) {
            throw new ApiError(400, "Session not found");
        }
        await finalizeSessionEnd(session.id, "logout", new Date());
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, "Invalid refresh token");
    }
};

export const logoutAll = async (
    studentId: string,
    currentSessionId?: string
) => {
    // Revoke all sessions except the current one
    const filter: Record<string, unknown> = {
        userId: studentId,
        endedAt: { $exists: false },
    };
    if (currentSessionId) {
        filter._id = { $ne: currentSessionId };
    }
    const now = new Date();
    await Session.updateMany(filter, {
        $set: {
            revoked: true,
            endedAt: now,
            endReason: "revoked",
            deletesAt: buildDeleteAt(now),
            lastAccessedAt: now,
        },
        $unset: {
            refreshToken: "",
            previousRefreshToken: "",
            graceExpiresAt: "",
        },
    });
};

// List all sessions for a user, most recent first
export const listSessionsForUser = async (
    userId: string,
    currentSessionId?: string
) => {
    const sessions = await Session.find({ userId })
        .sort({ lastAccessedAt: -1, createdAt: -1 })
        .select(
            "_id deviceInfo initialLocation currentLocation userAgent lastAccessedAt createdAt expiresAt revoked endedAt endReason"
        )
        .lean();
    return { sessions, currentSessionId };
};

// Revoke (logout) a specific session for a user
export const revokeSession = async (userId: string, sessionId: string) => {
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) throw new ApiError(404, "Session not found");
    if (session.endedAt || session.revoked) return;
    await finalizeSessionEnd(session.id, "revoked", new Date());
};

// TODO: Implement audit logging for authentication events (login, logout, refresh, session revoke, etc.)
