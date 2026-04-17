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
