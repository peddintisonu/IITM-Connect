import { decodeAccessToken, endSession } from "../../modules/auth/auth.utils";
import Session from "../../modules/auth/session.model";
import Student from "../../modules/student/student.model";
import { authErrorMessages } from "../constants/auth.constants";
import { ApiError, asyncHandler } from "../utils";

export const protectRoute = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) throw new ApiError(401, authErrorMessages.noAccessToken);

    const decoded = decodeAccessToken(accessToken);

    const [student, session] = await Promise.all([
        Student.findById(decoded.studentId).select("-__v"),
        Session.findById(decoded.sessionId),
    ]);

    if (!student) throw new ApiError(401, authErrorMessages.studentNotFound);
    if (!session) throw new ApiError(401, authErrorMessages.sessionExpired);
    if (session.endedAt)
        throw new ApiError(401, authErrorMessages.sessionEnded);
    if (session.revoked)
        throw new ApiError(401, authErrorMessages.sessionRevoked);
    if (session.expiresAt <= new Date()) {
        await endSession(session._id.toString(), "expired", new Date());
        throw new ApiError(401, authErrorMessages.sessionExpired);
    }

    if (decoded.tokenVersion !== student.tokenVersion) {
        throw new ApiError(401, authErrorMessages.tokenInvalidated);
    }

    // Update lastAccessedAt for the session
    session.lastAccessedAt = new Date();
    await session.save();

    req.user = student;
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

        if (!student) return next();
        if (!session) return next();
        if (session.endedAt) return next();
        if (session.revoked) return next();
        if (session.expiresAt <= new Date()) return next();
        if (decoded.tokenVersion !== student.tokenVersion) return next();

        return res.redirect("/");
    } catch {
        return next();
    }
});

export const requireAuth = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, authErrorMessages.unauthorized);
    }
    next();
});
