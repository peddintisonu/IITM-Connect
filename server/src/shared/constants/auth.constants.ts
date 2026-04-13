import { ENV } from "../../config/env";

export const tokenExpiry = {
    accessToken: 15 * 60,
    refreshToken: 7 * 24 * 60 * 60,
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
