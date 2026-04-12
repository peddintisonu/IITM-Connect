import cookieParser from "cookie-parser";
import express from "express";
import passport from "./config/passport";

import authRoutes from "./modules/auth/auth.routes";
import errorHandler from "./shared/middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1/auth", authRoutes);

app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok", message: "IITMConnect server is running" });
});

app.use(errorHandler);

export default app;
