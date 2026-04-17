import { ENV } from "../../config/env";

export const tokenExpiry = {
    accessToken: 15 * 60,
    refreshToken: 7 * 24 * 60 * 60,
};

export const sessionLifetime = {
    retentionDays: 30,
    retentionMs: 30 * 24 * 60 * 60 * 1000,
    gracePeriodMs: 5 * 60 * 1000,
};

export const defaultSessionValues = {
    deviceInfo: "Unknown Device",
    browserName: "Unknown Browser",
    osName: "Unknown OS",
    userAgent: "unknown",
    ipAddress: "unknown",
    city: "Unknown City",
    country: "Unknown Country",
};

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

export const accessCookieOptions = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 15 * 60 * 1000,
    path: "/",
};

export const refreshCookieOptions = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
};

export const cookieOptions = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "lax" as const,
};
