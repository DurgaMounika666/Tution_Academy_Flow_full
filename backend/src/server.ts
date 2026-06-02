/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { AddressInfo } from "net";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/database";
import { config } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { User } from "./models/User";

// Routes
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import feeRoutes from "./routes/feeRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";

const app: Express = express();

// Middleware
app.use(helmet());
const allowedOrigins = new Set([
  config.frontendUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (Postman/cURL) and known frontend origins.
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req, res) => {
  res.json({
    name: "Academy Flow Backend API",
    status: "running",
    health: "/health",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/attendance", attendanceRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const printStartupBanner = (port: number) => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🎓 Academy Flow Backend Server                     ║
║                                                              ║
║  Server running on: http://localhost:${port}             
║  Environment: ${config.nodeEnv}
║  MongoDB: Connected ✅                                        
║                                                              ║
║  API Documentation:                                          ║
║  • POST   /api/auth/register-parent                          ║
║  • POST   /api/auth/login-student                            ║
║  • POST   /api/auth/login-parent                             ║
║  • POST   /api/auth/login-tutor                              ║
║  • POST   /api/auth/login-admin                              ║
║  • GET    /api/students/:studentId                           ║
║  • POST   /api/fees                                          ║
║  • GET    /api/attendance/:studentId                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
};

const listenWithPortFallback = (initialPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const tryPort = (portToTry: number) => {
      const server = app
        .listen(portToTry, () => {
          const addressInfo = server.address() as AddressInfo | null;
          resolve(addressInfo?.port ?? portToTry);
        })
        .on("error", (error: NodeJS.ErrnoException) => {
          if (error.code === "EADDRINUSE") {
            console.warn(`Port ${portToTry} is busy. Retrying on ${portToTry + 1}...`);
            tryPort(portToTry + 1);
            return;
          }
          reject(error);
        });
    };

    tryPort(initialPort);
  });
};

const seedDemoAuthUsers = async () => {
  const demoUsers = [
    { email: "parent@example.com", password: "password", role: "parent" as const },
    { email: "anitha@academyflow.com", password: "password", role: "tutor" as const },
    { email: "narayana@academyflow.com", password: "password", role: "tutor" as const },
    { email: "elena.vance@academyflow.com", password: "password", role: "tutor" as const },
    { email: "julian.thorne@academyflow.com", password: "password", role: "tutor" as const },
  ];

  for (const demoUser of demoUsers) {
    const existing = await User.findOne({ email: demoUser.email, role: demoUser.role });
    if (existing) {
      continue;
    }

    const hashedPassword = await bcrypt.hash(demoUser.password, 10);
    await User.create({
      email: demoUser.email,
      password: hashedPassword,
      role: demoUser.role,
    });
    console.log(`Seeded demo ${demoUser.role} account: ${demoUser.email}`);
  }
};

// Connect to MongoDB and Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDemoAuthUsers();
    const activePort = await listenWithPortFallback(config.port);
    printStartupBanner(activePort);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
