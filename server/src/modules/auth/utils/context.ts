// server/src/modules/auth/utils/context.ts

import { Request } from "express";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

import { defaultSessionValues } from "../auth.constants";

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
