/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from "mongoose";
import winston from "winston";
import { config } from "./env";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

export const connectDB = async () => {
  try {
    const mongoUri = config.mongoUri;
    const isAtlas = mongoUri.includes("mongodb+srv") || mongoUri.includes("mongodb.net");

    logger.info(`🔌 Connecting to MongoDB (${isAtlas ? "Atlas Cloud" : "Local"})...`);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const { host, port, name } = mongoose.connection;
    logger.info(`✅ MongoDB Connected Successfully`);
    logger.info(`   Host: ${host}${port ? ":" + port : ""}`);
    logger.info(`   Database: ${name}`);
    logger.info(`   Mode: ${isAtlas ? "☁️  Remote (Atlas Cloud)" : "💻 Local"}`);

    // Connection event listeners for monitoring
    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("✅ MongoDB reconnected successfully");
    });
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default mongoose;
