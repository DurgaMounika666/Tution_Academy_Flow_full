/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/academy_flow",
  jwtSecret: (process.env.JWT_SECRET || "your_super_secret_jwt_key") as string,
  jwtExpire: (process.env.JWT_EXPIRE || "1h") as string,
  jwtRefreshSecret: (process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key") as string,
  jwtRefreshExpire: (process.env.JWT_REFRESH_EXPIRE || "7d") as string,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  adminEmail: process.env.ADMIN_EMAIL || "admin@academyflow.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin@123",
};
