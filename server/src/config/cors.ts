import { type CorsOptions } from "cors";
import { ENV } from "./env";
import { CORS_CONSTANTS } from "../shared/constants/cors.constants";

const parsedCorsOrigins = ENV.CORS_ORIGINS.split(
    CORS_CONSTANTS.ORIGINS_DELIMITER
)
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins =
    parsedCorsOrigins.length > 0
        ? parsedCorsOrigins
        : [CORS_CONSTANTS.LOCAL_DEV_ORIGIN];

export const corsOptions: CorsOptions = {
    origin: allowedOrigins,
    credentials: true,
};
