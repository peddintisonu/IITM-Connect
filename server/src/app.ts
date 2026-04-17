import cookieParser from "cookie-parser";
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import passport from "./config/passport";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import socialRoutes from "./modules/social/social.routes";
import studentRoutes from "./modules/student/student.routes";

import { swaggerOptions } from "./config/swagger";
import { protectRoute } from "./shared/middleware/auth.middleware";
import errorHandler from "./shared/middleware/errorHandler";

const app = express();
const specs = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());
app.get("/", protectRoute, (req, res) => {
    res.send("Welcome to IITMConnect API");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/social", socialRoutes);
app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok", message: "IITMConnect server is running" });
});
app.get("/api-docs.json", (req, res) => {
    res.json(specs);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(errorHandler);

export default app;
