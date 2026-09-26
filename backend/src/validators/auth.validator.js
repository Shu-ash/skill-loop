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
    .min(6)
    .max(128);

export const registerSchema = z.object({
    body: z.object({
        firstName: z.string().trim().min(1).max(50).optional(),
        lastName: z.string().trim().min(1).max(50).optional(),
        name: z.string().trim().min(1).max(100).optional(),
        username: z.string().trim().min(2).max(50).optional(),
        email,
        password,
        termsAccepted: z.boolean().optional().default(true)
    }).passthrough(),
    params: z.any().optional(),
    query: z.any().optional()
});

export const loginSchema = z.object({
    body: z.object({
        email,
        password: z.string().min(1).max(128)
    }).passthrough(),
    params: z.any().optional(),
    query: z.any().optional()
});