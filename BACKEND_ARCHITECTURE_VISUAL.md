# Backend Architecture Visual Guide

## 🏗️ Layer-by-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Components: LoginGateway, StudentDashboard, ParentDashboard │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────┐   │
│  │ src/services/apiClient.ts                                   │   │
│  │ • setAuthToken(token)                                       │   │
│  │ • auth.loginParent(email, password)                         │   │
│  │ • students.getById(studentId)                               │   │
│  │ • fees.getByStudent(studentId)                              │   │
│  │ • attendance.mark(studentId, date, status)                  │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │ HTTP Requests                               │
│                         │ POST /api/auth/login-parent                 │
│                         │ GET /api/students/ST-101                    │
│                         │ GET /api/fees/ST-101                        │
└─────────────────────────┼─────────────────────────────────────────────┘
                          │
                          │ Network
                          │
┌─────────────────────────┼─────────────────────────────────────────────┐
│                         ▼                                             │
│                    BACKEND (Node.js/Express)                         │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────┐   │
│  │ src/routes/ - Route Mapping                                 │   │
│  │ ┌────────────────────────────────────────────────────────┐  │   │
│  │ │ authRoutes.ts                                          │  │   │
│  │ │   router.post("/login-parent", AuthController...)     │  │   │
│  │ │   router.post("/register-parent", ...)                │  │   │
│  │ │                                                        │  │   │
│  │ │ studentRoutes.ts                                       │  │   │
│  │ │   router.get("/:studentId", authMiddleware, ...)      │  │   │
│  │ │   router.post("/:studentId/assign-tutor", ...)        │  │   │
│  │ │                                                        │  │   │
│  │ │ feeRoutes.ts                                           │  │   │
│  │ │   router.get("/:studentId", authMiddleware, ...)      │  │   │
│  │ │   router.put("/:feeId/payment", ...)                  │  │   │
│  │ │                                                        │  │   │
│  │ │ attendanceRoutes.ts                                    │  │   │
│  │ │   router.post("/mark", authMiddleware, ...)           │  │   │
│  │ │   router.get("/:studentId", authMiddleware, ...)      │  │   │
│  │ └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────┐   │
│  │ src/middleware/ - Request Processing                         │   │
│  │ ┌────────────────────────────────────────────────────────┐  │   │
│  │ │ auth.ts                                                │  │   │
│  │ │ • authMiddleware: Verify JWT token                     │  │   │
│  │ │ • roleMiddleware: Check user role                      │  │   │
│  │ │                                                        │  │   │
│  │ │ errorHandler.ts                                        │  │   │
│  │ │ • errorHandler: Format error responses                 │  │   │
│  │ │ • notFound: 404 handler                                │  │   │
│  │ └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────┐   │
│  │ src/controllers/ - Request Handlers                          │   │
│  │ ┌────────────────────────────────────────────────────────┐  │   │
│  │ │ AuthController.ts                                      │  │   │
│  │ │ • registerParent(req, res) - Extract → Validate       │  │   │
│  │ │ • loginParent(req, res)    → Call Service             │  │   │
│  │ │ • loginStudent(req, res)   → Return Response          │  │   │
│  │ │ • loginTutor(req, res)                                │  │   │
│  │ │ • loginAdmin(req, res)                                │  │   │
│  │ │                                                        │  │   │
│  │ │ StudentController.ts                                   │  │   │
│  │ │ • getStudentById(req, res)                             │  │   │
│  │ │ • createStudent(req, res)                              │  │   │
│  │ │ • updateStudent(req, res)                              │  │   │
│  │ │ • assignTutor(req, res)                                │  │   │
│  │ │                                                        │  │   │
│  │ │ FeeController.ts                                       │  │   │
│  │ │ • createFee(req, res)                                  │  │   │
│  │ │ • getFeesByStudent(req, res)                           │  │   │
│  │ │ • updateFeePayment(req, res)                           │  │   │
│  │ │ • getFeeReport(req, res)                               │  │   │
│  │ └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────┐   │
│  │ src/services/ - Business Logic                              │   │
│  │ ┌────────────────────────────────────────────────────────┐  │   │
│  │ │ AuthService.ts                                         │  │   │
│  │ │ • hashPassword(password)                               │  │   │
│  │ │ • generateToken(userId, role)                          │  │   │
│  │ │ • loginParent(email, password)                         │  │   │
│  │ │ • registerParent(email, password, ...)                 │  │   │
│  │ │                                                        │  │   │
│  │ │ StudentService.ts                                      │  │   │
│  │ │ • getStudentById(studentId)                            │  │   │
│  │ │ • createStudent(...)                                   │  │   │
│  │ │ • assignTutor(studentId, tutorId)                      │  │   │
│  │ │ • updateAttendance(...)                                │  │   │
│  │ │                                                        │  │   │
│  │ │ FeeService.ts                                          │  │   │
│  │ │ • createFee(...)                                       │  │   │
│  │ │ • getFeesByStudent(studentId)                          │  │   │
│  │ │ • updateFeePayment(feeId, transactionId, ...)         │  │   │
│  │ │ • generateFeeReport(month, year)                       │  │   │
│  │ │                                                        │  │   │
│  │ │ TutorService.ts                                        │  │   │
│  │ │ • getTutorById(tutorId)                                │  │   │
│  │ │ • assignStudent(tutorId, studentId)                    │  │   │
│  │ │ • getAssignedStudents(tutorId)                         │  │   │
│  │ │                                                        │  │   │
│  │ │ AssignmentService.ts                                   │  │   │
│  │ │ • createAssignment(...)                                │  │   │
│  │ │ • getAssignmentsByTutor(tutorId)                       │  │   │
│  │ │ • updateAssignmentStatus(...)                          │  │   │
│  │ │                                                        │  │   │
│  │ │ AttendanceService.ts                                   │  │   │
│  │ │ • markAttendance(...)                                  │  │   │
│  │ │ • getStudentAttendance(studentId)                      │  │   │
│  │ │ • getAttendanceReport(studentId, month, year)         │  │   │
│  │ └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────┐   │
│  │ src/models/ - MongoDB Schemas                               │   │
│  │ ┌────────────────────────────────────────────────────────┐  │   │
│  │ │ User.ts             Student.ts          Tutor.ts       │  │   │
│  │ │ ├─ email           ├─ studentId       ├─ tutorId       │  │   │
│  │ │ ├─ password        ├─ userId          ├─ userId        │  │   │
│  │ │ ├─ role            ├─ name            ├─ name          │  │   │
│  │ │ └─ isActive        ├─ grade           ├─ specialty     │  │   │
│  │ │                    ├─ parentEmail     ├─ email         │  │   │
│  │ │ Parent.ts          ├─ tutor IDs       └─ students[]    │  │   │
│  │ │ ├─ userId          ├─ subjects[]                       │  │   │
│  │ │ ├─ email           ├─ attendance                       │  │   │
│  │ │ ├─ name            └─ present/absent                   │  │   │
│  │ │ └─ children[]                                          │  │   │
│  │ │                    FeePayment.ts   Assignment.ts       │  │   │
│  │ │                    ├─ feeId         ├─ assignmentId    │  │   │
│  │ │                    ├─ studentId     ├─ tutorId         │  │   │
│  │ │                    ├─ amount        ├─ title           │  │   │
│  │ │                    ├─ status        ├─ subject         │  │   │
│  │ │                    ├─ dueDate       ├─ dueDate         │  │   │
│  │ │                    └─ paidDate      └─ status          │  │   │
│  │ │                                                        │  │   │
│  │ │                    Attendance.ts    Result.ts          │  │   │
│  │ │                    ├─ attendanceId  ├─ resultId        │  │   │
│  │ │                    ├─ studentId     ├─ studentId       │  │   │
│  │ │                    ├─ date          ├─ term            │  │   │
│  │ │                    ├─ status        ├─ gpa             │  │   │
│  │ │                    └─ batchId       └─ scores[]        │  │   │
│  │ └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────┐   │
│  │ src/config/ - Configuration                                 │   │
│  │ ┌────────────────────────────────────────────────────────┐  │   │
│  │ │ database.ts                      env.ts              │  │   │
│  │ │ • connectDB()                   • config.port         │  │   │
│  │ │ • mongoose.connect()            • config.mongoUri     │  │   │
│  │ │ • Error handling                 • config.jwtSecret   │  │   │
│  │ │ • Logger                         • config.frontendUrl │  │   │
│  │ └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                             │
└─────────────────────────┼─────────────────────────────────────────────┘
                          │
                          │ MongoDB Driver
                          │
┌─────────────────────────▼─────────────────────────────────────────────┐
│                   MongoDB Database                                    │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ Collections:                                                 │    │
│  │ • users                • parents                             │    │
│  │ • students              • feepayments                        │    │
│  │ • tutors                • assignments                        │    │
│  │ • attendances           • results                           │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Detailed

### Example 1: Parent Logs In

```
FRONTEND (LoginGateway.tsx)
│
├─ User enters email & password
├─ Clicks "Login"
│
└─ Calls: apiClient.auth.loginParent(email, password)
          ↓
          Makes: POST http://localhost:5000/api/auth/login-parent
          Body: { email, password }
          Headers: { "Content-Type": "application/json" }

BACKEND (Routes)
│
├─ Express matches: POST /api/auth/login-parent
├─ Middleware check: None (public endpoint)
│
└─ Calls: AuthController.loginParent(req, res)

BACKEND (Controller)
│
├─ Extracts: req.body → { email, password }
├─ Validates: email and password present
│
└─ Calls: AuthService.loginParent(email, password)

BACKEND (Service)
│
├─ Queries: User.findOne({ email })
│
├─ Compares: bcrypt.compare(password, user.password)
├─ Generates: JWT token = jwt.sign({ userId, role }, JWT_SECRET)
│
└─ Returns: { token, refreshToken, userId }

BACKEND (Response)
│
├─ Status: 200 OK
├─ Body: {
│    message: "Login successful",
│    token: "eyJhbGciOiJIUzI1NiIs...",
│    refreshToken: "...",
│    userId: "507f1f77bcf86cd799439011"
│  }

FRONTEND (apiClient)
│
├─ Receives response
├─ Calls: apiClient.setAuthToken(response.token)
├─ Saves: localStorage.setItem("authToken", token)
│
└─ Returns: response to component

FRONTEND (LoginGateway.tsx)
│
├─ Receives token
├─ Calls: onLoginSuccess("parent", userId)
│
└─ Navigates to: /parent route (ParentDashboard)
```

### Example 2: Parent Views Child's Fees

```
FRONTEND (ParentDashboard.tsx)
│
├─ useEffect hook runs on mount
│
└─ Calls: apiClient.fees.getByStudent("ST-101")
          ↓
          Makes: GET http://localhost:5000/api/fees/ST-101
          Headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer <token_from_localStorage>"
          }

BACKEND (Middleware - auth.ts)
│
├─ authMiddleware intercepts request
├─ Extracts: Authorization header
├─ Splits: "Bearer <token>" → token
├─ Verifies: jwt.verify(token, JWT_SECRET)
├─ Attaches: req.userId, req.role to request
│
└─ Passes to controller (or returns 401 if token invalid)

BACKEND (Routes)
│
├─ Express matches: GET /fees/ST-101
│
└─ Calls: FeeController.getFeesByStudent(req, res)

BACKEND (Controller)
│
├─ Extracts: req.params.studentId = "ST-101"
│
└─ Calls: FeeService.getFeesByStudent("ST-101")

BACKEND (Service)
│
├─ Queries: FeePayment.find({ studentId: "ST-101" })
│
└─ Returns: [
     {
       _id: "...",
       feeId: "FP-501",
       studentId: "ST-101",
       amount: 5000,
       status: "Pending",
       dueDate: "2026-06-30"
     },
     ...
   ]

BACKEND (Database)
│
├─ Searches: feepayments collection
├─ Matches: { studentId: "ST-101" }
│
└─ Returns: matching documents

BACKEND (Response)
│
├─ Status: 200 OK
├─ Body: [
│    {
│      feeId: "FP-501",
│      amount: 5000,
│      status: "Pending",
│      dueDate: "2026-06-30"
│    },
│    ...
│  ]

FRONTEND (apiClient)
│
├─ Receives response
│
└─ Returns: Array of fees to component

FRONTEND (ParentDashboard.tsx)
│
├─ setFees([...]) saves to state
│
└─ Renders: Fees table with:
           - Fee ID: FP-501
           - Amount: $5000
           - Status: Pending
           - Due Date: 2026-06-30
           - [Pay] button
```

---

## 🎯 Folder Usage Summary

| Folder | Files | Purpose | Frontend Connection |
|--------|-------|---------|---------------------|
| **config/** | database.ts, env.ts | Setup & configuration | Backend startup, credentials |
| **models/** | User, Student, Tutor, Parent, Fee, Assignment, Attendance, Result | Database schemas | Data structure definition |
| **middleware/** | auth.ts, errorHandler.ts | Request validation & processing | Token verification for all routes |
| **services/** | Auth, Student, Fee, Tutor, Assignment, Attendance | Business logic | Core application logic |
| **controllers/** | Auth, Student, Fee | HTTP request handlers | Direct API endpoint handlers |
| **routes/** | auth, student, fee, attendance | URL to controller mapping | API endpoint definition |
| **server.ts** | Main entry point | Orchestration | Application startup |

---

## 🌐 Frontend-Backend Communication Map

```
LoginGateway.tsx
├─ apiClient.auth.registerParent()
│  → POST /api/auth/register-parent
│  → authRoutes.ts → AuthController → AuthService → User model
│
├─ apiClient.auth.loginParent()
│  → POST /api/auth/login-parent
│  → authRoutes.ts → AuthController → AuthService → User model
│
├─ apiClient.auth.loginStudent()
│  → POST /api/auth/login-student
│  → authRoutes.ts → AuthController → AuthService
│
├─ apiClient.auth.loginTutor()
│  → POST /api/auth/login-tutor
│  → authRoutes.ts → AuthController → AuthService → User model
│
└─ apiClient.auth.loginAdmin()
   → POST /api/auth/login-admin
   → authRoutes.ts → AuthController → AuthService

ParentDashboard.tsx
├─ apiClient.students.getByParent()
│  → GET /api/students/parent/:email
│  → studentRoutes.ts → StudentController → StudentService → Student model
│
├─ apiClient.fees.getByStudent()
│  → GET /api/fees/:studentId
│  → feeRoutes.ts → FeeController → FeeService → FeePayment model
│
├─ apiClient.fees.markAsPaid()
│  → PUT /api/fees/:feeId/payment
│  → feeRoutes.ts → FeeController → FeeService → FeePayment model
│
└─ apiClient.students.assignTutor()
   → POST /api/students/:studentId/assign-tutor
   → studentRoutes.ts → StudentController → StudentService → Student model

StudentDashboard.tsx
├─ apiClient.students.getById()
│  → GET /api/students/:studentId
│  → studentRoutes.ts → StudentController → StudentService → Student model
│
├─ apiClient.attendance.getByStudent()
│  → GET /api/attendance/:studentId
│  → attendanceRoutes.ts → AttendanceController → Attendance model
│
└─ apiClient.attendance.getAssignmentsByTutor()
   → GET /api/attendance/tutor/:tutorId/assignments
   → attendanceRoutes.ts → AttendanceController → Assignment model

TutorDashboard.tsx
├─ apiClient.attendance.mark()
│  → POST /api/attendance/mark
│  → attendanceRoutes.ts → AttendanceController → Attendance model
│
├─ apiClient.attendance.createAssignment()
│  → POST /api/attendance/assignments
│  → attendanceRoutes.ts → AttendanceController → Assignment model
│
└─ apiClient.attendance.getAssignmentsByTutor()
   → GET /api/attendance/tutor/:tutorId/assignments
   → attendanceRoutes.ts → AttendanceController → Assignment model

AdminDashboard.tsx
├─ apiClient.students.create()
│  → POST /api/students
│  → studentRoutes.ts → StudentController → StudentService → Student model
│
├─ apiClient.fees.getReport()
│  → GET /api/fees/reports/monthly
│  → feeRoutes.ts → FeeController → FeeService → FeePayment model
│
└─ ... (All other CRUD operations)
```

---

## 💡 Key Concepts Recap

**Request Path:**
Frontend Component → apiClient → HTTP Request → Express Route → Middleware → Controller → Service → Model → MongoDB → Response → Component State

**Database Connection:**
config/database.ts → mongoose.connect() → MongoDB Atlas/Local → Collections

**Authentication:**
apiClient stores token → Includes in Authorization header → authMiddleware verifies → Attaches to request → Controllers use it

**Data Flow:**
Service handles logic → Returns data → Controller formats response → Route sends to frontend → apiClient processes → Component displays

---

## ✅ Summary

Every folder serves a specific purpose in the request-response cycle:

1. **config/** - Setup
2. **models/** - Data structure
3. **middleware/** - Request validation
4. **services/** - Business logic
5. **controllers/** - Request handling
6. **routes/** - Endpoint mapping
7. **server.ts** - Orchestration

All connected through **apiClient.ts** in the frontend!
