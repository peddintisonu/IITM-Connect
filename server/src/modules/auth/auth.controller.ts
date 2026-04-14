import { Request, Response } from "express";
import { UAParser } from "ua-parser-js";
import {
    accessCookieOptions,
    refreshCookieOptions,
} from "../../shared/constants/auth.constants";
import { ApiError } from "../../shared/utils/ApiError";
import { ApiResponse } from "../../shared/utils/ApiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { IStudent } from "../student/student.model";
import {
    generateTokens,
    logoutAll as logoutAllSessions,
    logoutOne,
    refreshAccessToken,
} from "./auth.service";

const clearAuthCookies = (res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
};

export const googleCallback = asyncHandler(
    async (req: Request, res: Response) => {
        const student = req.user as IStudent;
        if (!student) throw new ApiError(401, "Authentication failed");

        const parser = new UAParser(req.headers["user-agent"]);
        const result = parser.getResult();
        const deviceInfo = `${result.browser.name} on ${result.os.name}`;

        const { accessToken, refreshToken } = await generateTokens(
            student,
            deviceInfo
        );

        res.cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", refreshToken, refreshCookieOptions)
            .redirect("/");
    }
);

export const refreshToken = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies.refreshToken;
        if (!token) throw new ApiError(401, "No refresh token provided");

        const { accessToken, refreshToken: newRefreshToken } =
            await refreshAccessToken(token);

        res.cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
            .json(new ApiResponse(200, null, "Token refreshed successfully"));
    }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new ApiError(401, "No refresh token provided");

    await logoutOne(token);
    clearAuthCookies(res);

    res.json(new ApiResponse(200, null, "Logged out successfully"));
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const student = req.user as IStudent;

    await logoutAllSessions(student._id.toString());
    await student.incrementTokenVersion();
    clearAuthCookies(res);

    res.json(
        new ApiResponse(200, null, "Logged out of all devices successfully")
    );
});
