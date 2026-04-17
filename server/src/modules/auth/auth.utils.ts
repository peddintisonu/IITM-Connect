import { Request } from "express";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

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

const normalizeIp = (value: string) => value.replace(/^::ffff:/, "").trim();

const getClientIp = (req: Request) => {
    const forwardedFor = req.headers["x-forwarded-for"]
        ?.toString()
        .split(",")[0];
    const ipAddress =
        forwardedFor || req.ip || req.socket.remoteAddress || "unknown";
    return normalizeIp(ipAddress);
};

const lookupLocation = (ipAddress: string): SessionLocation => {
    if (!ipAddress || ipAddress === "unknown") {
        return { ip: ipAddress };
    }

    const geo = geoip.lookup(ipAddress);
    if (!geo) {
        return { ip: ipAddress };
    }

    return {
        ip: ipAddress,
        city: geo.city || undefined,
        country: geo.country || undefined,
    };
};

export const buildSessionContext = (req: Request): SessionContext => {
    const userAgent = req.headers["user-agent"]?.toString() || "unknown";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browserName = result.browser.name || "Unknown Browser";
    const osName = result.os.name || "Unknown OS";
    const deviceInfo = `${browserName} on ${osName}`;

    const ipAddress = getClientIp(req);
    const currentLocation = lookupLocation(ipAddress);

    return {
        deviceInfo,
        userAgent,
        currentLocation,
    };
};
