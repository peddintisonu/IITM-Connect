import jwt from "jsonwebtoken";

import { ENV } from "../../config/env";
import { tokenExpiry } from "../../shared/constants/auth.constants";
import { ApiError } from "../../shared/utils";
import Session from "../student/session.model";
import Student, { IStudent } from "../student/student.model";

export const generateTokens = async (
    student: IStudent,
    deviceInfo?: string
) => {
    const payload = {
        studentId: student._id,
        tokenVersion: student.tokenVersion,
    };
    const accessToken = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: tokenExpiry.accessToken,
    });

    const refreshToken = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: tokenExpiry.refreshToken,
    });

    const newSession = new Session({
        userId: student._id,
        refreshToken,
        deviceInfo: deviceInfo || "Unknown Device",
        expiresAt: new Date(Date.now() + tokenExpiry.refreshToken * 1000),
    });

    await newSession.save();

    return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
    try {
        const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET) as {
            studentId: string;
        };

        const session = await Session.findOne({ refreshToken });
        if (!session) {
            throw new ApiError(401, "Session not found, please login again");
        }

        await session.deleteOne(); // Invalidate the old refresh token

        const student = await Student.findById(decoded.studentId);
        if (!student) {
            throw new ApiError(401, "Student not found, please login again");
        }
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await generateTokens(student);
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(401, "Invalid refresh token");
    }
};
