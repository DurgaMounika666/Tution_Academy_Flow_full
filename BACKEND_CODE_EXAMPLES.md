# Backend Folder Code Examples & Usage

## 📂 Detailed Folder Breakdown with Code

---

## 1. **`backend/src/config/`** - Configuration Files

### Purpose
Centralized setup for database connection and environment variables. Runs once when backend starts.

### Files

#### `database.ts`
```typescript
// What it does: Connects to MongoDB when server starts
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/academy_flow";
    await mongoose.connect(mongoUri);
    logger.info("✅ MongoDB Connected Successfully");
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

// Used by: server.ts (called on startup)
// Flow: server.ts → connectDB() → mongoose.connect() → MongoDB
```

#### `env.ts`
```typescript
// What it does: Load and export all environment variables
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/academy_flow",
  jwtSecret: process.env.JWT_SECRET || "your_super_secret_jwt_key",
  jwtExpire: process.env.JWT_EXPIRE || "1h",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  adminEmail: process.env.ADMIN_EMAIL || "admin@academyflow.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin@123",
};

// Used by: All services and controllers that need config
// Example in AuthService:
// jwt.sign({ userId, role }, config.jwtSecret)
```

**Frontend Connection:**
```env
# .env file (backend)
MONGODB_URI=mongodb://localhost:27017/academy_flow
JWT_SECRET=super_secret_key_change_me
FRONTEND_URL=http://localhost:5173
```

---

## 2. **`backend/src/models/`** - MongoDB Schemas

### Purpose
Define database structure, fields, types, and validation. These are blueprints for data.

### Example: Student Model

```typescript
// backend/src/models/Student.ts
import mongoose, { Schema, Document } from "mongoose";

// TypeScript Interface - defines structure
export interface IStudent extends Document {
  studentId: string;      // "ST-101"
  userId: mongoose.Types.ObjectId;
  name: string;           // "Abhilash"
  grade: string;          // "12th Class"
  parentEmail: string;
  assignedTutorIds: string[];  // ["T-201", "T-202"]
  learningSubjects: string[];  // ["Maths", "Physics"]
  attendanceRate: number; // 94
  presentCount: number;
  absentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB Schema
const StudentSchema = new Schema<IStudent>(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,  // Can't have two students with same ID
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",  // References User collection
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    parentEmail: {
      type: String,
      required: true,
    },
    assignedTutorIds: [String],  // Array of tutor IDs
    learningSubjects: [String],  // Array of subjects
    attendanceRate: {
      type: Number,
      default: 0,
    },
    // ... more fields
  },
  { timestamps: true }  // Auto-adds createdAt and updatedAt
);

export const Student = mongoose.model<IStudent>("Student", StudentSchema);

// HOW IT'S USED:
// When backend saves student data, it MUST match this schema
// Frontend sends data → Backend receives → Validates against schema → Saves to DB

// Example invalid data (would be rejected):
// ❌ { name: "John" }  - missing required fields
// ❌ { studentId: "ST-101", studentId: "ST-102" }  - duplicate ID
// ✅ { studentId: "ST-101", userId: "...", name: "John", grade: "12th" }
```

### All Models in Backend

| Model | Fields | Used For | Frontend Component |
|-------|--------|----------|-------------------|
| **User** | email, password, role | Authentication | LoginGateway |
| **Student** | studentId, name, grade, subjects, attendance | Student data | StudentDashboard, ParentDashboard |
| **Tutor** | tutorId, name, specialty, email, students[] | Tutor info | TutorDashboard, ParentDashboard |
| **Parent** | email, name, children[] | Parent profile | ParentDashboard |
| **FeePayment** | feeId, studentId, amount, status, dueDate | Fee tracking | ParentDashboard, AdminDashboard |
| **Assignment** | assignmentId, title, subject, dueDate | Course work | TutorDashboard, StudentDashboard |
| **Attendance** | studentId, date, status | Attendance tracking | StudentDashboard, TutorDashboard |
| **Result** | studentId, term, scores | Grades | StudentDashboard, AdminDashboard |

---

## 3. **`backend/src/middleware/`** - Request Processing

### Purpose
Intercept requests before they reach controllers, for validation and processing.

#### `auth.ts` - JWT Authentication

```typescript
// backend/src/middleware/auth.ts
import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface AuthenticatedRequest extends Request {
  userId?: string;      // Will be set by middleware
  role?: string;        // Will be set by middleware
}

// This middleware runs on EVERY protected route
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract token from header
    const token = req.headers.authorization?.split(" ")[1];
    //    "Bearer eyJhbGc..." → extract "eyJhbGc..."
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // 2. Verify token signature and expiry
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      role: string;
    };
    
    // 3. Attach userId and role to request
    req.userId = decoded.userId;
    req.role = decoded.role;

    // 4. Pass to next middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// USAGE IN ROUTES:
// router.get("/students/:id", authMiddleware, StudentController.getById)
// ├─ Request comes
// ├─ authMiddleware runs
// ├─ If token valid → sets req.userId, req.role → calls controller
// └─ If token invalid → returns 401 error

// FRONTEND FLOW:
// 1. User logs in → Gets token from backend
// 2. apiClient stores token in localStorage
// 3. Every API call includes token in header:
//    Authorization: Bearer eyJhbGc...
// 4. Backend middleware extracts and verifies token
// 5. If valid → Request proceeds
//    If invalid → Returns 401 → Frontend redirects to login
```

#### `errorHandler.ts` - Error Processing

```typescript
// backend/src/middleware/errorHandler.ts
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Catch ALL errors from controllers
  // Format them consistently
  // Return to frontend

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
    message: error.message,
  });
};

// FRONTEND RECEIVES:
// ✅ { error: "Validation Error", message: "Email is required" }
// ✅ { error: "Duplicate field error", message: "..." }
// ✅ Can then show user-friendly error message
```

---

## 4. **`backend/src/controllers/`** - Request Handlers

### Purpose
Receive HTTP requests, validate input, call services, return responses.

#### `AuthController.ts` - Login Handler

```typescript
// backend/src/controllers/AuthController.ts
export class AuthController {
  static async loginParent(req: Request, res: Response) {
    try {
      // 1. EXTRACT: Get data from request
      const { email, password } = req.body;
      // Frontend sends: { email: "parent@example.com", password: "password123" }

      // 2. VALIDATE: Check required fields
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email and password are required" 
        });
      }

      // 3. CALL SERVICE: Let service handle authentication
      const result = await AuthService.loginParent(email, password);
      // AuthService will:
      // ├─ Find user in database
      // ├─ Compare password hash
      // └─ Generate JWT token

      // 4. RETURN: Send response to frontend
      res.json({
        message: "Parent login successful",
        token: result.token,           // "eyJhbGc..."
        refreshToken: result.refreshToken,
        userId: result.userId,         // "507f1f77bcf86cd799439011"
      });
    } catch (error: any) {
      // If error occurs, send error response
      res.status(401).json({ error: error.message });
    }
  }
}

// FLOW:
// Frontend (LoginGateway.tsx)
//   ↓ POST /api/auth/login-parent
// authRoutes.ts (routes/authRoutes.ts)
//   ↓ Matches route, calls controller
// AuthController.loginParent()
//   ├─ Extract: email, password
//   ├─ Validate: Check not empty
//   └─ Call: AuthService.loginParent()
// AuthService (services/AuthService.ts)
//   ├─ Query: User.findOne({ email })
//   ├─ Compare: bcrypt.compare()
//   └─ Generate: jwt.sign()
// Response sent back → Frontend
```

#### `StudentController.ts` - Student Data Handler

```typescript
// backend/src/controllers/StudentController.ts
export class StudentController {
  // GET /api/students/:studentId
  static async getStudentById(req: AuthenticatedRequest, res: Response) {
    try {
      // 1. Extract studentId from URL
      const { studentId } = req.params;
      // URL: /api/students/ST-101
      // studentId = "ST-101"

      // 2. Call service to get student
      const student = await StudentService.getStudentById(studentId);

      // 3. Check if found
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // 4. Return student
      res.json(student);
      // Response: {
      //   _id: "...",
      //   studentId: "ST-101",
      //   name: "Abhilash",
      //   grade: "12th Class",
      //   parentEmail: "parent@example.com",
      //   attendanceRate: 94,
      //   ...
      // }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/students/:studentId/assign-tutor
  static async assignTutor(req: AuthenticatedRequest, res: Response) {
    try {
      // 1. Extract
      const { studentId } = req.params;
      const { tutorId } = req.body;
      // URL: /api/students/ST-101/assign-tutor
      // Body: { tutorId: "T-201" }

      // 2. Call service
      const student = await StudentService.assignTutor(studentId, tutorId);

      // 3. Return
      res.json({
        message: "Tutor assigned successfully",
        student: student,  // Updated student with tutor in assignedTutorIds
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

// FRONTEND USAGE:
// ParentDashboard.tsx (Enrollment Wizard - Step 3)
// └─ User selects tutor: "Dr. Anitha (T-201)"
// └─ Calls: apiClient.students.assignTutor("ST-101", "T-201")
// └─ POST /api/students/ST-101/assign-tutor
// └─ Body: { tutorId: "T-201" }
// └─ Backend runs above code
// └─ Returns updated student
// └─ Frontend displays confirmation
```

---

## 5. **`backend/src/services/`** - Business Logic

### Purpose
Reusable logic that can be called from multiple controllers or other services.

#### `AuthService.ts` - Authentication Logic

```typescript
// backend/src/services/AuthService.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
  // Hash password before saving
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
    // Original: "password123"
    // Hashed:   "$2b$10$N9qo8uLO..."
    // One-way! Can't reverse
  }

  // Compare password with hash
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
    // password: "password123"
    // hashedPassword: "$2b$10$N9qo8uLO..."
    // Returns: true if match, false if not
  }

  // Generate JWT token (given to user)
  static generateToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },  // Payload
      config.jwtSecret,  // Secret from env
      { expiresIn: config.jwtExpire }  // "1h"
    );
    // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    // Contains: userId, role, expiry
    // Signed with secret so can't be forged
  }

  // Verify token (check if valid)
  static verifyToken(token: string): { userId: string; role: string } {
    return jwt.verify(token, config.jwtSecret) as {
      userId: string;
      role: string;
    };
    // If token invalid/expired → throws error
    // If valid → returns decoded { userId, role }
  }

  // Login parent
  static async loginParent(email: string, password: string) {
    try {
      // 1. Find user
      const user = await User.findOne({ email }).select("+password");
      // select("+password") because password is hidden by default
      
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // 2. Compare password
      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );
      
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // 3. Generate tokens
      const token = this.generateToken(user._id.toString(), "parent");
      const refreshToken = this.generateRefreshToken(user._id.toString(), "parent");

      // 4. Return
      return { token, refreshToken, userId: user._id.toString() };
    } catch (error) {
      throw error;
    }
  }

  // Register parent
  static async registerParent(
    email: string,
    password: string,
    childName?: string,
    childGrade?: string
  ) {
    try {
      // 1. Check if already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // 2. Hash password
      const hashedPassword = await this.hashPassword(password);

      // 3. Create user
      const user = new User({
        email,
        password: hashedPassword,  // Store hashed, not plain text!
        role: "parent",
      });

      // 4. Save
      await user.save();

      // 5. Create student (if childName provided)
      if (childName && childGrade) {
        // Logic to create student and link to parent
      }

      // 6. Generate tokens
      const token = this.generateToken(user._id.toString(), "parent");
      
      return { token, userId: user._id.toString() };
    } catch (error) {
      throw error;
    }
  }
}

// FRONTEND FLOW:
// Hero.tsx or RegisterModal.tsx
// └─ User enters: email, password, childName, childGrade
// └─ apiClient.auth.registerParent(email, password, childName, childGrade)
// └─ POST /api/auth/register-parent
// └─ AuthController receives → calls AuthService.registerParent()
// └─ AuthService hashes password, creates user, returns token
// └─ Frontend stores token
// └─ Auto-login to ParentDashboard
```

#### `StudentService.ts` - Student Operations

```typescript
// backend/src/services/StudentService.ts
export class StudentService {
  // Get student by ID
  static async getStudentById(studentId: string) {
    return Student.findOne({ studentId });
    // Query: { studentId: "ST-101" }
    // Returns: { _id, studentId, name, grade, ... }
  }

  // Get all children of parent
  static async getStudentsByParent(parentEmail: string) {
    return Student.find({ parentEmail });
    // Query: { parentEmail: "parent@example.com" }
    // Returns: [{ studentId: "ST-101", ... }, { studentId: "ST-102", ... }]
  }

  // Create new student
  static async createStudent(
    studentId: string,
    userId: string,
    name: string,
    grade: string,
    parentEmail: string,
    section?: string
  ) {
    const student = new Student({
      studentId,
      userId,
      name,
      grade,
      section,
      parentEmail,
    });
    return student.save();
    // Saves to MongoDB
    // Returns: { _id, studentId, name, ... }
  }

  // Assign tutor to student
  static async assignTutor(studentId: string, tutorId: string) {
    const student = await Student.findOne({ studentId });
    if (student && !student.assignedTutorIds.includes(tutorId)) {
      student.assignedTutorIds.push(tutorId);
      return student.save();
    }
    return student;
    // Before: assignedTutorIds = ["T-201"]
    // After:  assignedTutorIds = ["T-201", "T-202"]
  }

  // Add subjects for student
  static async addLearningSubjects(
    studentId: string,
    subjects: string[]
  ) {
    return Student.findOneAndUpdate(
      { studentId },
      { learningSubjects: subjects },
      { new: true }  // Return updated doc
    );
    // Update: learningSubjects = ["Maths", "Physics"]
    // Returns: Updated student
  }

  // Update attendance rate
  static async updateAttendance(
    studentId: string,
    presentCount: number,
    absentCount: number
  ) {
    const total = presentCount + absentCount;
    const attendanceRate = total > 0 ? (presentCount / total) * 100 : 0;

    return Student.findOneAndUpdate(
      { studentId },
      {
        presentCount,
        absentCount,
        attendanceRate: Math.round(attendanceRate),
      },
      { new: true }
    );
    // Before: presentCount: 45, absentCount: 3
    // After:  presentCount: 45, absentCount: 3, attendanceRate: 94
  }
}

// FRONTEND USAGE:
// StudentDashboard.tsx
// └─ useEffect: apiClient.students.getById("ST-101")
// └─ GET /api/students/ST-101
// └─ StudentController → StudentService.getStudentById()
// └─ Returns student
// └─ Displays in UI: Name, Grade, Subjects, Attendance
```

#### `FeeService.ts` - Fee Management

```typescript
// backend/src/services/FeeService.ts
export class FeeService {
  // Create fee
  static async createFee(
    feeId: string,
    studentId: string,
    studentName: string,
    title: string,
    amount: number,
    dueDate: Date
  ) {
    const fee = new FeePayment({
      feeId,
      studentId,
      studentName,
      title,
      amount,
      dueDate,
      status: "Pending",
    });
    return fee.save();
  }

  // Get fees for student
  static async getFeesByStudent(studentId: string) {
    return FeePayment.find({ studentId });
    // Returns: [
    //   { feeId: "FP-501", amount: 5000, status: "Pending" },
    //   { feeId: "FP-502", amount: 3000, status: "Paid" }
    // ]
  }

  // Mark fee as paid
  static async updateFeePayment(
    feeId: string,
    transactionId: string,
    paymentMethod: string
  ) {
    return FeePayment.findOneAndUpdate(
      { feeId },
      {
        status: "Paid",
        transactionId,
        paymentMethod,
        paidDate: new Date(),
      },
      { new: true }
    );
    // Before: status: "Pending"
    // After:  status: "Paid", transactionId: "TXN-12345", paidDate: today
  }

  // Get all pending fees
  static async getPendingFees(studentId?: string) {
    const query = studentId
      ? { studentId, status: "Pending" }
      : { status: "Pending" };
    return FeePayment.find(query);
  }

  // Generate report
  static async generateFeeReport(month?: number, year?: number) {
    const query = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const fees = await FeePayment.find(query);
    const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paid = fees
      .filter((f) => f.status === "Paid")
      .reduce((sum, fee) => sum + fee.amount, 0);
    const pending = fees
      .filter((f) => f.status === "Pending")
      .reduce((sum, fee) => sum + fee.amount, 0);

    return { total, paid, pending, feeCount: fees.length };
    // Returns: { total: 10000, paid: 5000, pending: 5000, feeCount: 2 }
  }
}

// FRONTEND USAGE:
// ParentDashboard.tsx
// └─ useEffect: apiClient.fees.getByStudent("ST-101")
// └─ Displays: Table with pending fees
// └─ User clicks "Pay" → apiClient.fees.markAsPaid(feeId, txnId, method)
// └─ Backend marks as paid → Frontend updates UI
//
// AdminDashboard.tsx
// └─ apiClient.fees.getReport(6, 2026)
// └─ Displays: Fee report for June 2026
```

---

## 6. **`backend/src/routes/`** - API Endpoints

### Purpose
Map URLs to controllers. This is where frontend requests are routed.

#### `authRoutes.ts`

```typescript
// backend/src/routes/authRoutes.ts
import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();

// Public endpoints (no authentication required)

router.post("/register-parent", AuthController.registerParent);
// URL: POST /api/auth/register-parent
// Middleware: None
// Handler: AuthController.registerParent
// Frontend: RegisterModal.tsx
// Flow: User registers → Sends email, password → Backend creates user & student

router.post("/login-student", AuthController.loginStudent);
// URL: POST /api/auth/login-student
// Frontend: LoginGateway.tsx (Student tab)
// Flow: User enters student ID → Backend returns token

router.post("/login-parent", AuthController.loginParent);
// URL: POST /api/auth/login-parent
// Frontend: LoginGateway.tsx (Parent tab)
// Flow: User enters email, password → Backend validates → Returns token

router.post("/login-tutor", AuthController.loginTutor);
// URL: POST /api/auth/login-tutor
// Frontend: LoginGateway.tsx (Tutor tab)

router.post("/login-admin", AuthController.loginAdmin);
// URL: POST /api/auth/login-admin
// Frontend: LoginGateway.tsx (Admin tab)

router.post("/logout", AuthController.logout);
// URL: POST /api/auth/logout
// Frontend: All dashboards (Logout button)

export default router;

// HOW ROUTING WORKS:
// 1. Frontend: POST http://localhost:5000/api/auth/login-parent
// 2. Express matches: router.post("/login-parent", ...)
// 3. Calls: AuthController.loginParent(req, res)
// 4. Controller handles request
// 5. Response sent back to frontend
```

#### `studentRoutes.ts`

```typescript
// backend/src/routes/studentRoutes.ts
import { Router } from "express";
import { StudentController } from "../controllers/StudentController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All student routes require authentication

router.get("/:studentId", authMiddleware, StudentController.getStudentById);
// URL: GET /api/students/ST-101
// Middleware: authMiddleware (checks token)
// Handler: StudentController.getStudentById
// Frontend: StudentDashboard.tsx
// Flow: Load student data when component mounts

router.get(
  "/parent/:parentEmail",
  authMiddleware,
  StudentController.getStudentsByParent
);
// URL: GET /api/students/parent/parent@example.com
// Frontend: ParentDashboard.tsx
// Flow: Get all children of parent

router.post("/", authMiddleware, StudentController.createStudent);
// URL: POST /api/students
// Frontend: AdminDashboard.tsx
// Flow: Admin creates new student

router.put("/:studentId", authMiddleware, StudentController.updateStudent);
// URL: PUT /api/students/ST-101
// Frontend: AdminDashboard.tsx
// Flow: Update student info

router.post(
  "/:studentId/assign-tutor",
  authMiddleware,
  StudentController.assignTutor
);
// URL: POST /api/students/ST-101/assign-tutor
// Frontend: ParentDashboard.tsx (Enrollment Wizard)
// Flow: Parent assigns tutor during enrollment
// Body: { tutorId: "T-201" }

router.post(
  "/:studentId/learning-subjects",
  authMiddleware,
  StudentController.addLearningSubjects
);
// URL: POST /api/students/ST-101/learning-subjects
// Frontend: ParentDashboard.tsx (Enrollment Wizard)
// Flow: Parent selects subjects
// Body: { subjects: ["Maths", "Physics"] }

export default router;
```

#### `feeRoutes.ts`

```typescript
// backend/src/routes/feeRoutes.ts
import { Router } from "express";
import { FeeController } from "../controllers/FeeController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, FeeController.createFee);
// URL: POST /api/fees
// Frontend: AdminDashboard.tsx
// Flow: Admin creates fee record

router.get("/:studentId", authMiddleware, FeeController.getFeesByStudent);
// URL: GET /api/fees/ST-101
// Frontend: ParentDashboard.tsx
// Flow: Load pending fees for display

router.get("/fee/:feeId", authMiddleware, FeeController.getFeeById);
// URL: GET /api/fees/fee/FP-501
// Frontend: ParentDashboard.tsx
// Flow: Get specific fee details

router.put("/:feeId/payment", authMiddleware, FeeController.updateFeePayment);
// URL: PUT /api/fees/FP-501/payment
// Frontend: ParentDashboard.tsx (Pay Fee button)
// Flow: Mark fee as paid
// Body: { transactionId: "TXN-12345", paymentMethod: "Credit Card" }

router.get("/pending/all", authMiddleware, FeeController.getPendingFees);
// URL: GET /api/fees/pending/all
// Frontend: AdminDashboard.tsx
// Flow: Get all unpaid fees

router.get("/reports/monthly", authMiddleware, FeeController.getFeeReport);
// URL: GET /api/fees/reports/monthly?month=6&year=2026
// Frontend: AdminDashboard.tsx
// Flow: Generate fee report for month

export default router;
```

---

## 7. **`backend/server.ts`** - Main Entry Point

```typescript
// backend/src/server.ts
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/database";
import { config } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";

// Import all routes
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import feeRoutes from "./routes/feeRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";

const app: Express = express();

// Apply global middleware
app.use(helmet());  // Security headers
app.use(cors({
  origin: config.frontendUrl,  // Allow only frontend URL
  credentials: true,
}));
app.use(express.json());  // Parse JSON requests
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// Register routes
app.use("/api/auth", authRoutes);          // /api/auth/*
app.use("/api/students", studentRoutes);   // /api/students/*
app.use("/api/fees", feeRoutes);           // /api/fees/*
app.use("/api/attendance", attendanceRoutes);  // /api/attendance/*

// Error handling
app.use(notFound);  // 404 handler
app.use(errorHandler);  // Error handler

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Listen on port
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🎓 Academy Flow Backend Server                     ║
║                                                              ║
║  Server running on: http://localhost:${config.port}             
║  Environment: ${config.nodeEnv}
║  MongoDB: Connected ✅                                        
║                                                              ║
║  Available Routes:                                           ║
║  • POST   /api/auth/login-parent                             ║
║  • GET    /api/students/ST-101                               ║
║  • GET    /api/fees/ST-101                                   ║
║  • POST   /api/attendance/mark                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// STARTUP FLOW:
// 1. npm run dev
// 2. ts-node src/server.ts
// 3. Creates Express app
// 4. Applies middleware
// 5. connectDB() → Connects to MongoDB
// 6. Routes registered
// 7. Server listening on port 5000
// 8. Ready to accept requests from frontend
```

---

## 🔗 Complete Request-Response Cycle

### Example: Parent Views Fees

```
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND (ParentDashboard.tsx)                                      │
│                                                                     │
│ useEffect(() => {                                                  │
│   const fees = await apiClient.fees.getByStudent("ST-101");       │
│ }, []);                                                            │
│                                                                     │
│ ↓ Makes HTTP request                                               │
│   GET http://localhost:5000/api/fees/ST-101                       │
│   Headers: {                                                        │
│     "Authorization": "Bearer eyJhbGc...",                          │
│     "Content-Type": "application/json"                            │
│   }                                                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (Routes - feeRoutes.ts)                                    │
│                                                                     │
│ router.get("/:studentId", authMiddleware, FeeController...)       │
│                                                                     │
│ ✓ Matches: GET /api/fees/ST-101                                    │
│ ✓ studentId = "ST-101"                                             │
│ ✓ Applies: authMiddleware                                          │
│ ✓ Calls: FeeController.getFeesByStudent()                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (Middleware - auth.ts)                                     │
│                                                                     │
│ authMiddleware(req, res, next) {                                   │
│   ✓ Extract token from "Authorization: Bearer ..."               │
│   ✓ jwt.verify(token, JWT_SECRET)                                │
│   ✓ req.userId = decoded.userId                                  │
│   ✓ req.role = decoded.role                                      │
│   ✓ next() → Pass to controller                                  │
│ }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (Controller - FeeController.ts)                            │
│                                                                     │
│ static async getFeesByStudent(req, res) {                         │
│   const { studentId } = req.params;  // "ST-101"                 │
│   const fees = await FeeService.getFeesByStudent(studentId);     │
│   res.json(fees);                                                 │
│ }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (Service - FeeService.ts)                                  │
│                                                                     │
│ static async getFeesByStudent(studentId) {                        │
│   return FeePayment.find({ studentId });                          │
│   // Query MongoDB                                                │
│ }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (Model - FeePayment.ts)                                    │
│                                                                     │
│ // Mongoose schema with validation                                │
│ // Connects to MongoDB feepayments collection                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE (MongoDB)                                                  │
│                                                                     │
│ Collection: feepayments                                           │
│ Query: { studentId: "ST-101" }                                    │
│ Results: [                                                         │
│   {                                                                │
│     _id: "507f1f77bcf86cd799439011",                             │
│     feeId: "FP-501",                                             │
│     studentId: "ST-101",                                          │
│     amount: 5000,                                                │
│     status: "Pending",                                           │
│     dueDate: "2026-06-30"                                        │
│   },                                                              │
│   {                                                                │
│     feeId: "FP-502",                                             │
│     amount: 3000,                                                │
│     status: "Paid",                                              │
│     ...                                                          │
│   }                                                               │
│ ]                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (Response)                                                  │
│                                                                     │
│ res.json(fees)                                                     │
│ Status: 200 OK                                                    │
│ Body: [                                                            │
│   { feeId: "FP-501", amount: 5000, status: "Pending" },          │
│   { feeId: "FP-502", amount: 3000, status: "Paid" }              │
│ ]                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND (apiClient.ts)                                            │
│                                                                     │
│ Receives response → returns to component                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND (ParentDashboard.tsx)                                      │
│                                                                     │
│ setFees(fees);  // Save to state                                  │
│                                                                    │
│ Render fees table:                                                 │
│ ┌─────────────────────────────────────────┐                       │
│ │ Fee ID  │ Amount │ Status   │ Action  │                        │
│ ├─────────────────────────────────────────┤                       │
│ │ FP-501  │ $5000  │ Pending  │ [Pay]   │                        │
│ │ FP-502  │ $3000  │ Paid     │ -       │                        │
│ └─────────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Summary Table

| Folder | File | Purpose | Used By |
|--------|------|---------|---------|
| **config/** | database.ts | MongoDB connection | server.ts |
| **config/** | env.ts | Environment variables | All services |
| **models/** | User.ts, Student.ts, etc. | Data schemas | Services & MongoDB |
| **middleware/** | auth.ts | JWT verification | Protected routes |
| **middleware/** | errorHandler.ts | Error formatting | All routes |
| **controllers/** | AuthController.ts | Login/register handling | authRoutes |
| **controllers/** | StudentController.ts | Student CRUD | studentRoutes |
| **controllers/** | FeeController.ts | Fee CRUD | feeRoutes |
| **services/** | AuthService.ts | Auth logic | AuthController |
| **services/** | StudentService.ts | Student logic | StudentController |
| **services/** | FeeService.ts | Fee logic | FeeController |
| **routes/** | authRoutes.ts | /api/auth/* endpoints | Express |
| **routes/** | studentRoutes.ts | /api/students/* endpoints | Express |
| **routes/** | feeRoutes.ts | /api/fees/* endpoints | Express |
| **server.ts** | - | Orchestration | Main entry point |

Every folder has a specific job in the request-response cycle!
