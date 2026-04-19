// server/src/modules/auth/utils/index.ts

export {
    buildSessionContext,
    buildSessionContextFromExistingSession,
    type ExistingSessionContextSource,
    type SessionContext,
    type SessionLocation,
} from "./context";
export { clearAuthCookies, setAuthCookies } from "./cookie";
export {
    buildDeleteAt,
    endSession,
    ensureAuthStudentExists,
    ensureSessionExists,
    validateActiveSession,
    validateAuthTokenVersion,
} from "./session";
export {
    decodeAccessToken,
    decodeRefreshToken,
    getSessionIdFromAccessToken,
    getSessionIdFromRefreshToken,
    type SessionTokenPayload,
} from "./token";
