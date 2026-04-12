import { Request, Response } from "express";
import { UAParser } from "ua-parser-js";
import {
    accessCookieOptions,
    refreshCookieOptions,
} from "../../shared/constants/auth.constants";
import { ApiResponse } from "../../shared/utils";
import { ApiError } from "../../shared/utils/ApiError";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { IStudent } from "../student/student.model";
import { generateTokens, refreshAccessToken } from "./auth.service";
import Session from "./session.model";

export const googleCallback = asyncHandler(
    async (req: Request, res: Response) => {
        const student = req.user as IStudent;

        if (!student) {
            throw new ApiError(401, "Authentication failed");
        }

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

export const getCurrentUser = asyncHandler(
    async (req: Request, res: Response) => {
        const student = req.user as IStudent;
        if (!student) {
            throw new ApiError(401, "Unauthorized");
        }

        res.json(
            new ApiResponse(200, student, "Current user retrieved successfully")
        );
    }
);

export const refreshToken = asyncHandler(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new ApiError(401, "No refresh token provided");
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await refreshAccessToken(refreshToken);
        res.cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken },
                    "Access token refreshed successfully"
                )
            );
    }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const session = await Session.findOneAndDelete({ refreshToken });

    if (!session) {
        throw new ApiError(400, "Invalid refresh token provided");
    }

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.json(new ApiResponse(200, null, "Logged out successfully"));
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const student = req.user as IStudent;

    await Session.deleteMany({ userId: student._id });
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    await student.incrementTokenVersion();
    res.json(
        new ApiResponse(200, null, "Logged out of all devices successfully")
    );
});
