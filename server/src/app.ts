import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { corsOptions } from "./config/cors";
import passport from "./config/passport";

import authRoutes from "./modules/auth/auth.routes";
import masterDataRoutes from "./modules/core/masterData.routes";
import organizationRequestRoutes from "./modules/organizations/requests/request.routes";
import porAssignmentRoutes from "./modules/pors/assignments/assignment.routes";
import tenureRoutes from "./modules/pors/tenures/tenure.routes";
import socialRoutes from "./modules/social/social.routes";
import studentRoutes from "./modules/students/student.routes";

import { swaggerOptions } from "./config/swagger";
import { protectRoute } from "./shared/middleware/auth.middleware";
import errorHandler from "./shared/middleware/errorHandler";

const app = express();
const specs = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(cors(corsOptrions));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());
app.get("/", protectRoute, (req, res) => {
    res.send("Welcome to IITMConnect API");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/master-data", masterDataRoutes);
app.use("/api/v1/organizations", organizationRequestRoutes);
app.use("/api/v1/pors", porAssignmentRoutes);
app.use("/api/v1/pors", tenureRoutes);
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
