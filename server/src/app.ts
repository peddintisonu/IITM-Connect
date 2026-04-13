import cookieParser from "cookie-parser";
import express from "express";
import passport from "./config/passport";

import authRoutes from "./modules/auth/auth.routes";
import socialRoutes from "./modules/social/social.routes";
import studentRoutes from "./modules/student/student.routes";

import { protectRoute } from "./shared/middleware/auth.middleware";
import errorHandler from "./shared/middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get("/", protectRoute, (req, res) => {
    res.send("Welcome to IITMConnect API");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/social", socialRoutes);

app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok", message: "IITMConnect server is running" });
});

app.use(errorHandler);

export default app;
