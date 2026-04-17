import crypto from "crypto";
import jwt from "jsonwebtoken";

import { ENV } from "../../config/env";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import { ApiError } from "../../shared/utils";
import Student, { IStudent } from "../students/student.model";
import {
    defaultSessionValues,
    sessionLifetime,
    tokenExpiry,
} from "./auth.constants";
import { authErrorMessages } from "./auth.messages";
import Session from "./session.model";
import {
    decodeRefreshToken,
    endSession,
    ensureSessionExists,
    ensureStudentExistsForAuth,
    type SessionContext,
    validateActiveSession,
    validateAuthTokenVersion,
} from "./utils/index";

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

    const session = ensureSessionExists(
        await Session.findById(decoded.sessionId),
        authErrorMessages.sessionExpired
    );
    await validateActiveSession(session, {
        endExpiredSession: true,
    });

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
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            authErrorMessages.invalidRefreshToken
        );
    }

    const student = ensureStudentExistsForAuth(
        await Student.findById(decoded.studentId)
    );

    validateAuthTokenVersion(decoded.tokenVersion, student.tokenVersion);

    return rotateExistingSessionTokens(session, student, sessionContext);
};

export const logoutOne = async (refreshToken: string) => {
    const decoded = decodeRefreshToken(refreshToken);

    const session = ensureSessionExists(
        await Session.findById(decoded.sessionId),
        authErrorMessages.sessionNotFound,
        HTTP_STATUS.NOT_FOUND
    );
    await endSession(session.id, "logout", new Date());
};

// TODO: Add transaction support for logoutAll and revokeSession to ensure atomicity and consistency of session state changes
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
    const session = ensureSessionExists(
        await Session.findOne({ _id: sessionId, userId }),
        authErrorMessages.sessionNotFound,
        HTTP_STATUS.NOT_FOUND
    );
    if (session.endedAt || session.revoked) return;
    await endSession(session.id, "revoked", new Date());
};

// TODO: Implement audit logging for authentication events (login, logout, refresh, session revoke, etc.)
