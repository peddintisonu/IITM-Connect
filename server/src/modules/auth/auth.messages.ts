import { HTTP_STATUS } from "../../shared/constants/http-status.constants";

export const authErrorMessages = {
    noAccessToken: "No access token provided",
    noRefreshToken: "No refresh token provided",
    invalidAccessToken: "Invalid access token",
    invalidRefreshToken: "Invalid refresh token",
    sessionNotFound: "Session not found",
    sessionExpired: "Session expired, please login again",
    sessionEnded: "Session ended, please login again",
    sessionRevoked: "Session revoked, please login again",
    tokenInvalidated: "Token invalidated, please login again",
    studentNotFound: "Student not found",
    unauthorized: "Unauthorized",
    authenticationFailed: "Authentication failed",
};

export const authRouteMessages = {
    authenticationFailed: "Authentication failed — smail accounts only",
    tokenRefreshed: "Token refreshed successfully",
    loggedOut: "Logged out successfully",
    loggedOutAll: "Logged out of all devices except this one successfully",
    sessionRevoked: "Session revoked successfully",
    sessionsFetched: "Sessions fetched successfully",
};

export const AUTH_ERROR_CODE = {
    NO_ACCESS_TOKEN: "AUTH_NO_ACCESS_TOKEN",
    NO_REFRESH_TOKEN: "AUTH_NO_REFRESH_TOKEN",
    INVALID_ACCESS_TOKEN: "AUTH_INVALID_ACCESS_TOKEN",
    INVALID_REFRESH_TOKEN: "AUTH_INVALID_REFRESH_TOKEN",
    SESSION_NOT_FOUND: "AUTH_SESSION_NOT_FOUND",
    SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
    SESSION_ENDED: "AUTH_SESSION_ENDED",
    SESSION_REVOKED: "AUTH_SESSION_REVOKED",
    TOKEN_INVALIDATED: "AUTH_TOKEN_INVALIDATED",
    STUDENT_NOT_FOUND: "AUTH_STUDENT_NOT_FOUND",
    UNAUTHORIZED: "AUTH_UNAUTHORIZED",
    AUTHENTICATION_FAILED: "AUTH_AUTHENTICATION_FAILED",
} as const;

export type AuthErrorCode =
    (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE];

export const AUTH_ERROR_STATUS: Record<AuthErrorCode, number> = {
    [AUTH_ERROR_CODE.NO_ACCESS_TOKEN]: HTTP_STATUS.UNAUTHORIZED,
    [AUTH_ERROR_CODE.NO_REFRESH_TOKEN]: HTTP_STATUS.UNAUTHORIZED,
    [AUTH_ERROR_CODE.INVALID_ACCESS_TOKEN]: HTTP_STATUS.UNAUTHORIZED,
    [AUTH_ERROR_CODE.INVALID_REFRESH_TOKEN]: HTTP_STATUS.UNAUTHORIZED,
    [AUTH_ERROR_CODE.SESSION_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
    [AUTH_ERROR_CODE.SESSION_EXPIRED]: HTTP_STATUS.UNAUTHORIZED,
    [AUTH_ERROR_CODE.SESSION_ENDED]: HTTP_STATUS.UNAUTHORIZED,
    [AUTH_ERROR_CODE.SESSION_REVOKED]: HTTP_STATUS.UNAUTHORIZED,
    [AUTH_ERROR_CODE.TOKEN_INVALIDATED]: HTTP_STATUS.UNAUTHORIZED,
    [AUTH_ERROR_CODE.STUDENT_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
    [AUTH_ERROR_CODE.UNAUTHORIZED]: HTTP_STATUS.UNAUTHORIZED,
    [AUTH_ERROR_CODE.AUTHENTICATION_FAILED]: HTTP_STATUS.UNAUTHORIZED,
};
