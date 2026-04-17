// server/src/modules/auth/utils/token.ts

import jwt from "jsonwebtoken";

import { ENV } from "../../../config/env";
import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import { ApiError } from "../../../shared/utils";

import { authErrorMessages } from "../auth.messages";

export interface SessionTokenPayload {
    studentId: string;
    tokenVersion: number;
    sessionId: string;
}

const decodeToken = (token: string, secret: string, tokenName: string) => {
    try {
        return jwt.verify(token, secret) as SessionTokenPayload;
    } catch {
        const isAccessToken = tokenName === "access";
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            isAccessToken
                ? authErrorMessages.invalidAccessToken
                : authErrorMessages.invalidRefreshToken
        );
    }
};

export const decodeAccessToken = (accessToken: string) =>
    decodeToken(accessToken, ENV.ACCESS_TOKEN_SECRET, "access");

export const decodeRefreshToken = (refreshToken: string) =>
    decodeToken(refreshToken, ENV.REFRESH_TOKEN_SECRET, "refresh");

export const getSessionIdFromAccessToken = (accessToken: string) =>
    decodeAccessToken(accessToken).sessionId;

export const getSessionIdFromRefreshToken = (refreshToken: string) =>
    decodeRefreshToken(refreshToken).sessionId;
