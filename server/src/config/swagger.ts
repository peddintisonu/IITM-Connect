import { Options } from "swagger-jsdoc";

export const swaggerOptions: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "CampusOS API",
            version: "1.0.0",
            description: "Unified campus platform for IIT Madras",
            contact: {
                name: "IITM Connect Team",
            },
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1",
                description: "Development server",
            },
        ],
    },
    // This tells Swagger where to look for your @swagger comments
    apis: [
        "./src/modules/**/*.ts", // This picks up .model.ts and .swagger.ts
        "./src/shared/docs/base.swagger.ts", // Base schemas and security schemes
    ],
};
