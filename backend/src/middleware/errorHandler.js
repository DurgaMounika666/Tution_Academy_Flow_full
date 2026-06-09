/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const errorHandler = (error, req, res, next) => {
  logger.error("Error:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: error.message,
    });
  }

  if (error.name === "MongoError" && error.code === 11000) {
    return res.status(400).json({
      error: "Duplicate field error",
      message: "This record already exists",
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
    message: error.message || "Something went wrong",
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
};

module.exports = {
  errorHandler,
  notFound,
};
