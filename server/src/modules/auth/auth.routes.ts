import { Router } from "express";
import passport from "../../config/passport";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import {
    protectRoute,
    redirectIfAuthenticated,
    requireAuth,
} from "../../shared/middleware/auth.middleware";
import { ApiResponse } from "../../shared/utils";
import {
    getSessions,
    googleCallback,
    logout,
    logoutAll,
    refreshToken,
    revokeSession,
} from "./auth.controller";
import { authRouteMessages } from "./auth.messages";

const router = Router();

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    redirectIfAuthenticated,
    passport.authenticate("google", {
        failureRedirect: "/api/v1/auth/failure",
        session: false,
    }),
    googleCallback
);

router.get("/failure", (req, res) => {
    res.status(HTTP_STATUS.UNAUTHORIZED).json(
        new ApiResponse(
            HTTP_STATUS.UNAUTHORIZED,
            null,
            authRouteMessages.authenticationFailed
        )
    );
});

// FIXME: intentionally using GET to refresh tokens from browser, but should ideally be POST since it modifies state (refreshes tokens and updates session info)
router.get("/refresh", refreshToken);

router.get("/logout", protectRoute, requireAuth, logout);
router.post("/logout-all", protectRoute, requireAuth, logoutAll);

router.get("/sessions", protectRoute, requireAuth, getSessions);
router.post(
    "/sessions/:sessionId/logout",
    protectRoute,
    requireAuth,
    revokeSession
);

export default router;
