// server/src/shared/middleware/auth.middleware.ts

import { authErrorMessages } from "../../modules/auth/auth.messages";
import Session from "../../modules/auth/session.model";
import {
    decodeAccessToken,
    ensureSessionExists,
    ensureStudentExistsForAuth,
    validateActiveSession,
    validateAuthTokenVersion,
} from "../../modules/auth/utils/index";
import Student from "../../modules/students/student.model";
import { HTTP_STATUS } from "../constants/http-status.constants";
import { ApiError, asyncHandler } from "../utils";

export const protectRoute = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            authErrorMessages.noAccessToken
        );
    }

    const decoded = decodeAccessToken(accessToken);

    const [student, session] = await Promise.all([
        Student.findById(decoded.studentId).select("-__v"),
        Session.findById(decoded.sessionId),
    ]);

    const authStudent = ensureStudentExistsForAuth(student);
    const authSession = ensureSessionExists(
        session,
        authErrorMessages.sessionExpired
    );
    await validateActiveSession(authSession, {
        checkRevoked: true,
        endExpiredSession: true,
    });

    validateAuthTokenVersion(decoded.tokenVersion, authStudent.tokenVersion);

    // TODO: MongoDb bottleneck - update last 5 min accessed sessions or so
    // no need to be precise can be approximate
    // Update lastAccessedAt for the session
    authSession.lastAccessedAt = new Date();
    await authSession.save();

    req.user = authStudent;
    next();
});

export const redirectIfAuthenticated = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return next();

    try {
        const decoded = decodeAccessToken(accessToken);

        const [student, session] = await Promise.all([
            Student.findById(decoded.studentId),
            Session.findById(decoded.sessionId),
        ]);

        const authStudent = ensureStudentExistsForAuth(student);
        const authSession = ensureSessionExists(session);
        await validateActiveSession(authSession, {
            checkRevoked: true,
        });
        validateAuthTokenVersion(
            decoded.tokenVersion,
            authStudent.tokenVersion
        );

        return res.redirect("/");
    } catch {
        return next();
    }
});
