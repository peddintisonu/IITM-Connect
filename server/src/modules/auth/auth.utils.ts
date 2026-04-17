import { Request } from "express";
import geoip from "geoip-lite";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";

import { ENV } from "../../config/env";
import {
    authErrorMessages,
    defaultSessionValues,
    sessionLifetime,
} from "../../shared/constants/auth.constants";
import { ApiError } from "../../shared/utils";
import Session from "./session.model";

export interface SessionLocation {
    ip?: string;
    city?: string;
    country?: string;
}

export interface SessionContext {
    deviceInfo: string;
    userAgent: string;
    currentLocation: SessionLocation;
}

export interface SessionTokenPayload {
    studentId: string;
    tokenVersion: number;
    sessionId: string;
}

export interface ExistingSessionContextSource {
    deviceInfo?: string;
    userAgent?: string;
    initialLocation?: SessionLocation;
    currentLocation?: SessionLocation;
}

const normalizeIp = (value: string) => value.replace(/^::ffff:/, "").trim();

const isLocalOrPrivateIp = (ipAddress: string) => {
    return (
        ipAddress === "127.0.0.1" ||
        ipAddress === "::1" ||
        ipAddress === "localhost" ||
        /^10\./.test(ipAddress) ||
        /^192\.168\./.test(ipAddress) ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(ipAddress)
    );
};

const getClientIp = (req: Request) => {
    const forwardedFor = req.headers["x-forwarded-for"]
        ?.toString()
        .split(",")[0];
    const ipAddress =
        forwardedFor ||
        req.ip ||
        req.socket.remoteAddress ||
        defaultSessionValues.ipAddress;
    return normalizeIp(ipAddress);
};

const lookupLocation = (ipAddress: string): SessionLocation => {
    if (
        !ipAddress ||
        ipAddress === defaultSessionValues.ipAddress ||
        isLocalOrPrivateIp(ipAddress)
    ) {
        return {
            ip: ipAddress || defaultSessionValues.ipAddress,
            city: defaultSessionValues.city,
            country: defaultSessionValues.country,
        };
    }

    const geo = geoip.lookup(ipAddress);
    if (!geo) {
        return {
            ip: ipAddress,
            city: defaultSessionValues.city,
            country: defaultSessionValues.country,
        };
    }

    return {
        ip: ipAddress,
        city: geo.city || undefined,
        country: geo.country || undefined,
    };
};

const decodeToken = (token: string, secret: string, tokenName: string) => {
    try {
        return jwt.verify(token, secret) as SessionTokenPayload;
    } catch {
        throw new ApiError(
            401,
            tokenName === "access"
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

export const buildDeleteAt = (endedAt: Date) =>
    new Date(endedAt.getTime() + sessionLifetime.retentionMs);

export const endSession = async (
    sessionId: string,
    reason: "logout" | "expired" | "revoked",
    endedAt = new Date()
) => {
    await Session.updateOne(
        { _id: sessionId, endedAt: { $exists: false } },
        {
            $set: {
                endedAt,
                endReason: reason,
                deletesAt: buildDeleteAt(endedAt),
                revoked: reason === "revoked",
                lastAccessedAt: endedAt,
            },
            $unset: {
                refreshToken: "",
                previousRefreshToken: "",
                graceExpiresAt: "",
            },
        }
    );
};

export const buildSessionContext = (req: Request): SessionContext => {
    const userAgent =
        req.headers["user-agent"]?.toString() || defaultSessionValues.userAgent;
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browserName = result.browser.name || defaultSessionValues.browserName;
    const osName = result.os.name || defaultSessionValues.osName;
    const deviceInfo = `${browserName} on ${osName}`;

    const ipAddress = getClientIp(req);
    const currentLocation = lookupLocation(ipAddress);

    return {
        deviceInfo,
        userAgent,
        currentLocation,
    };
};

export const buildSessionContextFromExistingSession = (
    session: ExistingSessionContextSource | null | undefined,
    req: Request
): SessionContext => {
    const requestContext = buildSessionContext(req);

    if (!session) {
        return requestContext;
    }

    const currentLocation =
        session.currentLocation ??
        session.initialLocation ??
        requestContext.currentLocation;

    return {
        deviceInfo: session.deviceInfo || requestContext.deviceInfo,
        userAgent: session.userAgent || requestContext.userAgent,
        currentLocation,
    };
};
