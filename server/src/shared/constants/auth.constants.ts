import { ENV } from "../../config/env";

export const tokenExpiry = {
    accessToken: 15 * 60, // 15 minutes in seconds
    refreshToken: 7 * 24 * 60 * 60, // 7 days in seconds
};

export const cookieOptions = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict" as const,
};

export const accessCookieOptions = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
};

export const refreshCookieOptions = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};
