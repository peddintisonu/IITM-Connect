import crypto from "crypto";
import jwt from "jsonwebtoken";

import { ENV } from "../../config/env";
import {
    authErrorMessages,
    defaultSessionValues,
    sessionLifetime,
    tokenExpiry,
} from "../../shared/constants/auth.constants";
import { ApiError } from "../../shared/utils";
import Student, { IStudent } from "../student/student.model";
import {
    decodeRefreshToken,
    endSession,
    type SessionContext,
} from "./auth.utils";
import Session from "./session.model";

const hashToken = (token: string) =>
    crypto.createHash("sha256").update(token).digest("hex");

const buildTokenPayload = (student: IStudent, sessionId: string) => ({
    studentId: student._id,
    tokenVersion: student.tokenVersion,
    sessionId,
});

const signTokenPair = (student: IStudent, sessionId: string) => {
    const payload = buildTokenPayload(student, sessionId);

    const accessToken = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: tokenExpiry.accessToken,
    });

    const refreshToken = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: tokenExpiry.refreshToken,
    });

    return { accessToken, refreshToken };
};

const setNewRefreshTokenState = (
    session: typeof Session.prototype,
    refreshToken: string
) => {
    session.previousRefreshToken = session.refreshToken;
    session.refreshToken = hashToken(refreshToken);
    session.rotatedAt = new Date();
    session.expiresAt = new Date(Date.now() + tokenExpiry.refreshToken * 1000);
    session.graceExpiresAt = new Date(
        Date.now() + sessionLifetime.gracePeriodMs
    );
};

export const rotateExistingSessionTokens = async (
    session: typeof Session.prototype,
    student: IStudent,
    sessionContext?: SessionContext
) => {
    if (sessionContext) {
        session.deviceInfo = sessionContext.deviceInfo ?? session.deviceInfo;
        session.userAgent = sessionContext.userAgent ?? session.userAgent;
        session.currentLocation = sessionContext.currentLocation;
        session.lastAccessedAt = new Date();
    }

    const { accessToken, refreshToken } = signTokenPair(student, session.id);
    setNewRefreshTokenState(session, refreshToken);

    await session.save();

    return { accessToken, refreshToken };
};

export const generateTokens = async (
    student: IStudent,
    sessionContext?: SessionContext
) => {
    const currentLocation = sessionContext?.currentLocation;

    const session = new Session({
        userId: student._id,
        deviceInfo:
            sessionContext?.deviceInfo || defaultSessionValues.deviceInfo,
        expiresAt: new Date(Date.now() + tokenExpiry.refreshToken * 1000),
        currentLocation,
        initialLocation: currentLocation,
        userAgent: sessionContext?.userAgent,
        lastAccessedAt: new Date(),
    });

    const tokenPair = signTokenPair(student, session.id);
    session.refreshToken = hashToken(tokenPair.refreshToken);

    await session.save();

    return tokenPair;
};

export const refreshAccessToken = async (
    refreshToken: string,
    sessionContext?: SessionContext
) => {
    const decoded = decodeRefreshToken(refreshToken);

    const session = await Session.findById(decoded.sessionId);
    if (!session) {
        throw new ApiError(401, authErrorMessages.sessionExpired);
    }
    if (session.endedAt) {
        throw new ApiError(401, authErrorMessages.sessionEnded);
    }

    const sessionExpired = session.expiresAt <= new Date();
    if (sessionExpired) {
        await endSession(session.id, "expired", new Date());
        throw new ApiError(401, authErrorMessages.sessionExpired);
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
        throw new ApiError(401, authErrorMessages.invalidRefreshToken);
    }

    const student = await Student.findById(decoded.studentId);
    if (!student) {
        throw new ApiError(401, authErrorMessages.studentNotFound);
    }

    if (decoded.tokenVersion !== student.tokenVersion) {
        throw new ApiError(401, authErrorMessages.tokenInvalidated);
    }

    return rotateExistingSessionTokens(session, student, sessionContext);
};

export const logoutOne = async (refreshToken: string) => {
    const decoded = decodeRefreshToken(refreshToken);

    const session = await Session.findById(decoded.sessionId);
    if (!session) {
        throw new ApiError(400, authErrorMessages.sessionNotFound);
    }
    await endSession(session.id, "logout", new Date());
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
            deletesAt: new Date(now.getTime() + sessionLifetime.retentionMs),
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
    if (!session) throw new ApiError(404, authErrorMessages.sessionNotFound);
    if (session.endedAt || session.revoked) return;
    await endSession(session.id, "revoked", new Date());
};

// TODO: Implement audit logging for authentication events (login, logout, refresh, session revoke, etc.)
