export const notFound = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (error, req, res, next) => {
  console.error(error);
  const statusCode = error.statusCode || res.statusCode || 500;
  const message =
    statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : error.message || "Something went wrong";

  res.status(statusCode >= 400 ? statusCode : 500).json({
    message,
  });
};
