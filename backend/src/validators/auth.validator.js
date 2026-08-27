import { z } from "zod";

const email = z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) =>
        value.toLowerCase()
    );

const password = z
    .string()
    .min(8)
    .max(128);

export const registerSchema = z.object({
    body: z.object({
        firstName: z
            .string()
            .trim()
            .min(1)
            .max(50),

        lastName: z
            .string()
            .trim()
            .min(1)
            .max(50),

        email,

        password,

        termsAccepted: z.literal(true)
    }),

    params: z.object({}),

    query: z.object({})
});

export const loginSchema = z.object({
    body: z.object({
        email,

        password: z
            .string()
            .min(1)
            .max(128)
    }),

    params: z.object({}),

    query: z.object({})
});