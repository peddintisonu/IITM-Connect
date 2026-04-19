// server/src/modules/auth/utils/session.ts

import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import { ApiError, ensureStudentExists } from "../../../shared/utils";
import { IStudent } from "../../students/student.model";

import { sessionLifetime } from "../auth.constants";
import { authErrorMessages } from "../auth.messages";
import Session from "../session.model";

interface SessionStateLike {
    _id?: unknown;
    id?: string;
    expiresAt: Date;
    endedAt?: Date;
    revoked?: boolean;
}

export const ensureSessionExists = <T>(
    session: T,
    message = authErrorMessages.sessionExpired,
    statusCode: number = HTTP_STATUS.UNAUTHORIZED
): NonNullable<T> => {
    if (!session) {
        throw new ApiError(statusCode, message);
    }
    return session as NonNullable<T>;
};

export const ensureAuthStudentExists = (
    student: IStudent | null | undefined,
    statusCode = HTTP_STATUS.UNAUTHORIZED
): IStudent => {
    return ensureStudentExists(
        student,
        statusCode,
        authErrorMessages.studentNotFound
    ) as IStudent;
};

const getSessionIdentifier = (session: SessionStateLike) =>
    session.id ||
    (typeof session._id === "string" ? session._id : String(session._id || ""));

export const validateActiveSession = async (
    session: SessionStateLike,
    options: {
        checkRevoked?: boolean;
        endExpiredSession?: boolean;
    } = {}
) => {
    if (session.endedAt) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            authErrorMessages.sessionEnded
        );
    }

    if (options.checkRevoked && session.revoked) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            authErrorMessages.sessionRevoked
        );
    }

    if (session.expiresAt <= new Date()) {
        if (options.endExpiredSession) {
            const sessionId = getSessionIdentifier(session);
            if (sessionId) {
                await endSession(sessionId, "expired", new Date());
            }
        }

        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            authErrorMessages.sessionExpired
        );
    }
};

export const validateAuthTokenVersion = (
    tokenVersion: number,
    studentTokenVersion: number
) => {
    if (tokenVersion !== studentTokenVersion) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            authErrorMessages.tokenInvalidated
        );
    }
};

export const buildDeleteAt = (endedAt: Date) =>
    new Date(endedAt.getTime() + sessionLifetime.retentionMs);

export const endSession = async (
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
