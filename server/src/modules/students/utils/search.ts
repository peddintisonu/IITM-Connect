export interface StudentSearchCursorPayload {
    score: number;
    id: string;
    q: string;
}

export const normalizeStudentSearchQuery = (query: string) =>
    query.trim().toLowerCase().replace(/\s+/g, " ");

export const splitStudentSearchQuery = (query: string) =>
    normalizeStudentSearchQuery(query).split(" ").filter(Boolean);

export const buildStudentSearchInitials = (query: string) =>
    normalizeStudentSearchQuery(query).replace(/\s+/g, "");

export const encodeStudentSearchCursor = (
    payload: StudentSearchCursorPayload
) => {
    const raw = JSON.stringify(payload);
    return Buffer.from(raw, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
};

export const decodeStudentSearchCursor = (cursor: string) => {
    const normalized = cursor.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "="
    );

    return JSON.parse(
        Buffer.from(padded, "base64").toString("utf8")
    ) as StudentSearchCursorPayload;
};
