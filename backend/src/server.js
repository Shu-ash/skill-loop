import express from "express";

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app =
    express();

app.use(
    express.json()
);

app.get(
    "/api/health",
    (req, res) => {
        res.json({
            success: true,
            message:
                "Skill Loop API is running"
        });
    }
);

const startServer =
    async () => {
        await connectDB();

        app.listen(
            env.PORT,
            () => {
                console.log(
                    `Server running on port ${env.PORT}`
                );
            }
        );
    };

startServer();