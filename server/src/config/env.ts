import dotenv from "dotenv";
import z from "zod";

dotenv.config({ quiet: true });

const schema = z.object({
    PORT: z.string().default("5000"),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    MONGODB_URI: z.string(),
    DB_NAME: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_URL: z.string(),
    ACCESS_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
    CORS_ORIGINS: z.string().default("http://localhost:5173"),
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    console.error(parsed.error.format());
    process.exit(1);
}

export const ENV = parsed.data;
