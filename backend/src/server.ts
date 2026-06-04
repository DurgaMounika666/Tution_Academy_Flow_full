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
import { Student } from "./models/Student";
import { BookingController } from "./controllers/BookingController";

// Routes
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import studentRoutes from "./routes/studentRoutes";
import feeRoutes from "./routes/feeRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";

const app: Express = express();

// Middleware
app.use(helmet());
const allowedOrigins = new Set([
  config.frontendUrl,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
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
app.post("/api/bookings/demo", BookingController.createDemoBooking);
app.use("/api/bookings", bookingRoutes);
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
    { email: "alex@example.com", password: "password", role: "student" as const },
    { email: "leo@example.com", password: "password", role: "student" as const },
    { email: "aditya@example.com", password: "password", role: "student" as const },
  ];

  for (const demoUser of demoUsers) {
    let existing = await User.findOne({ email: demoUser.email, role: demoUser.role });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);
      existing = await User.create({
        email: demoUser.email,
        password: hashedPassword,
        role: demoUser.role,
      });
      console.log(`Seeded demo ${demoUser.role} account: ${demoUser.email}`);
    }
  }

  const demoStudents = [
    {
      studentId: "ST-101",
      email: "alex@example.com",
      name: "Alex Johnson",
      grade: "9th Class",
      parentEmail: "parent@example.com",
      section: "Section A",
      learningSubjects: ["Mathematics", "Physics"],
      attendanceRate: 94,
      presentCount: 31,
      absentCount: 2
    },
    {
      studentId: "ST-102",
      email: "leo@example.com",
      name: "Leo Henderson",
      grade: "9th Class",
      parentEmail: "parent@example.com",
      section: "Section A",
      learningSubjects: ["Mathematics", "Computer Science"],
      attendanceRate: 97,
      presentCount: 33,
      absentCount: 1
    },
    {
      studentId: "ST-103",
      email: "aditya@example.com",
      name: "Aditya Varma",
      grade: "10th Class",
      parentEmail: "parent@example.com",
      section: "Section B",
      learningSubjects: ["Mathematics", "Physics", "Chemistry"],
      attendanceRate: 95,
      presentCount: 38,
      absentCount: 2
    }
  ];

  for (const ds of demoStudents) {
    const existingStudent = await Student.findOne({ studentId: ds.studentId });
    if (!existingStudent) {
      const user = await User.findOne({ email: ds.email, role: "student" });
      if (user) {
        await Student.create({
          studentId: ds.studentId,
          userId: user._id,
          name: ds.name,
          grade: ds.grade,
          section: ds.section,
          parentEmail: ds.parentEmail,
          learningSubjects: ds.learningSubjects,
          attendanceRate: ds.attendanceRate,
          presentCount: ds.presentCount,
          absentCount: ds.absentCount,
          assignedTutorIds: ["T-201"]
        });
        console.log(`Seeded demo Student profile: ${ds.name} (${ds.studentId})`);
      }
    }
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
