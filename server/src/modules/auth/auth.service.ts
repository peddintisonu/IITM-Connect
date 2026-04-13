import crypto from "crypto";
import jwt from "jsonwebtoken";

import { ENV } from "../../config/env";
import { tokenExpiry } from "../../shared/constants/auth.constants";
import { ApiError } from "../../shared/utils";
import Student, { IStudent } from "../student/student.model";
import Session from "./session.model";

export const generateTokens = async (
    student: IStudent,
    deviceInfo?: string
) => {
    const session = new Session({
        userId: student._id,
        deviceInfo: deviceInfo || "Unknown Device",
        expiresAt: new Date(Date.now() + tokenExpiry.refreshToken * 1000),
    });

    const payload = {
        studentId: student._id,
        tokenVersion: student.tokenVersion,
        sessionId: session._id,
    };

    const accessToken = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: tokenExpiry.accessToken,
    });

    const refreshToken = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: tokenExpiry.refreshToken,
    });

    session.refreshToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    await session.save();

    return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
    try {
        const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET) as {
            studentId: string;
            tokenVersion: number;
            sessionId: string;
        };

        const session = await Session.findById(decoded.sessionId);
        if (!session) {
            throw new ApiError(401, "Session expired, please login again");
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        if (session.refreshToken !== hashedToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        await session.deleteOne();

        const student = await Student.findById(decoded.studentId);
        if (!student) {
            throw new ApiError(401, "Student not found");
        }

        if (decoded.tokenVersion !== student.tokenVersion) {
            throw new ApiError(401, "Token invalidated, please login again");
        }

        return await generateTokens(student);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(401, "Invalid refresh token");
    }
};

export const logoutOne = async (refreshToken: string) => {
    try {
        const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET) as {
            sessionId: string;
        };

        const session = await Session.findByIdAndDelete(decoded.sessionId);
        if (!session) {
            throw new ApiError(400, "Session not found");
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, "Invalid refresh token");
    }
};

export const logoutAll = async (studentId: string) => {
    await Session.deleteMany({ userId: studentId });
};
