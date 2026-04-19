import mongoose from "mongoose";

export interface SocialListCursorPayload {
    createdAt: string;
    id: string;
}

export interface PaginatedListResult<T> {
    items: T[];
    nextCursor: string | null;
    hasMore: boolean;
}

export const encodeSocialListCursor = (payload: SocialListCursorPayload) => {
    const raw = JSON.stringify(payload);
    return Buffer.from(raw, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
};

export const decodeSocialListCursor = (cursor: string) => {
    const normalized = cursor.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "="
    );

    return JSON.parse(
        Buffer.from(padded, "base64").toString("utf8")
    ) as SocialListCursorPayload;
};

export const parseSocialListCursor = (cursor: string) => {
    const parsed = decodeSocialListCursor(cursor);
    const createdAt = new Date(parsed.createdAt);

    if (
        !parsed ||
        typeof parsed.createdAt !== "string" ||
        Number.isNaN(createdAt.getTime()) ||
        typeof parsed.id !== "string" ||
        !mongoose.isValidObjectId(parsed.id)
    ) {
        throw new Error("Invalid cursor shape");
    }

    return {
        createdAt,
        id: new mongoose.Types.ObjectId(parsed.id),
    };
};
