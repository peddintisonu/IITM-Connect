import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import Student from "../../modules/student/student.model";
import { ApiError, asyncHandler } from "../utils";

export const protectRoute = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) throw new ApiError(401, "No access token provided");

    const decoded = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET) as {
        studentId: string;
        tokenVersion: number;
    };
    const student = await Student.findById(decoded.studentId).select(
        "-__v tokenVersion"
    );

    if (!student) throw new ApiError(401, "Student not found");

    if (decoded.tokenVersion !== student.tokenVersion) {
        throw new ApiError(401, "Token invalidated, please login again");
    }
    req.user = student;
    next();
});

export const redirectIfAuthenticated = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return next(); // not logged in, proceed

    try {
        jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET);
        return res.redirect("/"); // already logged in, send to dashboard
    } catch {
        next(); // token invalid/expired, proceed to login
    }
});
