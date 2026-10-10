export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
};

export const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Resource already exists"
        });
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation failed"
        });
    }

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : error.message
    });
};