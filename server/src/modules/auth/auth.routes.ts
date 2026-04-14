import { Router } from "express";
import passport from "../../config/passport";
import {
    protectRoute,
    redirectIfAuthenticated,
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
    res.status(401).json(
        new ApiResponse(
            401,
            null,
            "Authentication failed — smail accounts only"
        )
    );
});

// FIXME: Temporary get for these all for testing in browser, will change to post later when we have a frontend to test with
router.get("/refresh", refreshToken);

router.get("/logout", protectRoute, logout);
router.get("/logout-all", protectRoute, logoutAll);

router.get("/sessions", protectRoute, getSessions);
router.post("/sessions/:sessionId/logout", protectRoute, revokeSession);

export default router;
