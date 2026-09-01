import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum([
            "development",
            "test",
            "production"
        ])
        .default("development"),

    PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(5000),

    MONGO_URI: z
        .string()
        .min(1),

    JWT_ACCESS_SECRET: z
        .string()
        .min(32),

    JWT_REFRESH_SECRET: z
        .string()
        .min(32),

    JWT_ACCESS_EXPIRES:
        z.string().default("30d"),

    JWT_REFRESH_EXPIRES:
        z.string().default("90d"),

    CLIENT_URL:
        z.string().url(),

    COOKIE_SECURE:
        z
            .enum(["true", "false"])
            .default("false")
            .transform(
                (value) => value === "true"
            )
});

const result =
    envSchema.safeParse(
        process.env
    );

if (!result.success) {
    console.error(
        "Invalid environment configuration:"
    );

    console.error(
        result.error.flatten()
            .fieldErrors
    );

    process.exit(1);
}

export const env =
    result.data;