// server/src/modules/auth/utils/cookie.ts

import { Response } from "express";

import { accessCookieOptions, refreshCookieOptions } from "../auth.constants";

export const setAuthCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string
) =>
    res
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions);

export const clearAuthCookies = (res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
};
