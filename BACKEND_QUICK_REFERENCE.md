# Backend Folder Quick Reference Guide

## 🎯 At a Glance

### Frontend → Backend Request Path

```
Frontend Component (React)
        ↓
    apiClient.ts
        ↓
    HTTP Request (GET/POST/PUT)
        ↓
    Express Router (routes/)
        ↓
    Middleware (checks auth)
        ↓
    Controller (receives request)
        ↓
    Service (business logic)
        ↓
    Model (MongoDB schema)
        ↓
    Database (MongoDB)
        ↓
    Response sent back to Frontend
```

---

## 📂 Each Folder - What It Does

| Folder | What's Inside | Why It Exists | When It Runs |
|--------|---------------|---------------|------------|
| **config/** | database.ts, env.ts | Setup & configuration | On server startup |
| **models/** | User.ts, Student.ts, etc. (8 files) | Database schemas | When saving/querying data |
| **middleware/** | auth.ts, errorHandler.ts | Request processing | Before every request |
| **controllers/** | AuthController, StudentController, FeeController | Handle HTTP requests | When route matches |
| **services/** | AuthService, StudentService, etc. (6 files) | Business logic | Called by controllers |
| **routes/** | authRoutes, studentRoutes, feeRoutes, attendanceRoutes | Map URLs to controllers | When request comes |
| **server.ts** | Main entry point | Orchestrate everything | On startup |

---

## 🔄 Common Frontend → Backend Flows

### 1. User Logs In

```
LoginGateway.tsx (Hero component)
    ↓
Click Login button
    ↓
apiClient.auth.loginParent(email, password)
    ↓
POST /api/auth/login-parent
    ↓
authRoutes.ts → AuthController.loginParent()
    ↓
AuthService.loginParent() → User.findOne() → bcrypt.compare()
    ↓
Return: { token, refreshToken, userId }
    ↓
Frontend saves token in localStorage
    ↓
Navigate to /parent (ParentDashboard)
```

### 2. Parent Views Child's Fees

```
ParentDashboard.tsx (mounts)
    ↓
useEffect calls:
apiClient.fees.getByStudent("ST-101")
    ↓
GET /api/fees/ST-101
    ↓
authMiddleware checks token in header
    ↓
feeRoutes.ts → FeeController.getFeesByStudent()
    ↓
FeeService.getFeesByStudent()
    ↓
FeePayment.find({ studentId: "ST-101" })
    ↓
MongoDB returns matching fees
    ↓
Response: [{ feeId, amount, status, dueDate }, ...]
    ↓
Frontend renders fees table
```

### 3. Parent Pays a Fee

```
ParentDashboard.tsx
    ↓
Click "Pay" button for fee
    ↓
apiClient.fees.markAsPaid(feeId, transactionId, paymentMethod)
    ↓
PUT /api/fees/FP-501/payment
    ↓
Body: { transactionId: "TXN-12345", paymentMethod: "Credit Card" }
    ↓
authMiddleware validates token
    ↓
feeRoutes.ts → FeeController.updateFeePayment()
    ↓
FeeService.updateFeePayment()
    ↓
FeePayment.findOneAndUpdate(
  { feeId: "FP-501" },
  { status: "Paid", transactionId, paidDate: now }
)
    ↓
MongoDB updates document
    ↓
Response: { status: "Paid", paidDate: ... }
    ↓
Frontend updates UI: "Paid" badge shown
```

### 4. Tutor Marks Attendance

```
TutorDashboard.tsx
    ↓
Select student + status
    ↓
Click "Submit Attendance"
    ↓
apiClient.attendance.mark(studentId, date, status)
    ↓
POST /api/attendance/mark
    ↓
Body: { studentId: "ST-101", date: "2026-06-02", status: "Present" }
    ↓
authMiddleware checks token
    ↓
attendanceRoutes.ts → Create new Attendance record
    ↓
Attendance.save()
    ↓
MongoDB saves attendance
    ↓
Response: { attendanceId, studentId, status, date }
    ↓
StudentDashboard.tsx can later fetch and display:
apiClient.attendance.getByStudent("ST-101")
    ↓
Shows attendance rate, calendar view
```

---

## 🗂️ File Structure Tree

```
backend/
│
├── package.json                    ← Dependencies
├── tsconfig.json                   ← TypeScript config
├── .env.example                    ← Environment template
├── .gitignore                      ← Git ignore rules
├── README.md                       ← Backend documentation
│
└── src/
    │
    ├── server.ts                   ← MAIN ENTRY POINT
    │                                 • Creates Express app
    │                                 • Connects to MongoDB
    │                                 • Registers routes
    │                                 • Starts server on port 5000
    │
    ├── config/                     ← Configuration
    │   ├── database.ts             • MongoDB connection
    │   └── env.ts                  • Load environment variables
    │
    ├── models/                     ← MongoDB Schemas (8 files)
    │   ├── User.ts                 • email, password, role
    │   ├── Student.ts              • studentId, grade, subjects
    │   ├── Tutor.ts                • tutorId, specialty, email
    │   ├── Parent.ts               • email, children[]
    │   ├── FeePayment.ts           • feeId, amount, status
    │   ├── Assignment.ts           • title, subject, dueDate
    │   ├── Attendance.ts           • studentId, date, status
    │   └── Result.ts               • term, scores, gpa
    │
    ├── middleware/                 ← Request Processing
    │   ├── auth.ts                 • JWT verification
    │   │                            • Role-based access
    │   └── errorHandler.ts         • Error formatting
    │
    ├── controllers/                ← HTTP Request Handlers
    │   ├── AuthController.ts       • login, register, logout
    │   ├── StudentController.ts    • get, create, update, assign tutor
    │   └── FeeController.ts        • create, pay, report
    │
    ├── services/                   ← Business Logic (6 files)
    │   ├── AuthService.ts          • Hash password, JWT token
    │   ├── StudentService.ts       • CRUD operations
    │   ├── FeeService.ts           • Fee calculations
    │   ├── TutorService.ts         • Tutor operations
    │   ├── AssignmentService.ts    • Assignment CRUD
    │   └── AttendanceService.ts    • Attendance tracking
    │
    ├── routes/                     ← API Endpoints
    │   ├── authRoutes.ts           • /api/auth/*
    │   ├── studentRoutes.ts        • /api/students/*
    │   ├── feeRoutes.ts            • /api/fees/*
    │   └── attendanceRoutes.ts     • /api/attendance/*
    │
    └── utils/                      ← Utility functions (empty folder)
```

---

## 🔌 API Endpoints Quick Lookup

### Authentication
| Method | Endpoint | Frontend Use | Body |
|--------|----------|--------------|------|
| POST | `/api/auth/register-parent` | RegisterModal | email, password, childName |
| POST | `/api/auth/login-parent` | LoginGateway | email, password |
| POST | `/api/auth/login-student` | LoginGateway | studentId |
| POST | `/api/auth/login-tutor` | LoginGateway | email, password |
| POST | `/api/auth/login-admin` | LoginGateway | email, password |

### Students
| Method | Endpoint | Frontend Use | Body |
|--------|----------|--------------|------|
| GET | `/api/students/:studentId` | StudentDashboard | - |
| GET | `/api/students/parent/:email` | ParentDashboard | - |
| POST | `/api/students` | AdminDashboard | name, grade, email |
| PUT | `/api/students/:studentId` | AdminDashboard | updateData |
| POST | `/api/students/:studentId/assign-tutor` | ParentDashboard | tutorId |
| POST | `/api/students/:studentId/learning-subjects` | ParentDashboard | subjects[] |

### Fees
| Method | Endpoint | Frontend Use | Body |
|--------|----------|--------------|------|
| POST | `/api/fees` | AdminDashboard | feeId, amount, dueDate |
| GET | `/api/fees/:studentId` | ParentDashboard | - |
| GET | `/api/fees/fee/:feeId` | ParentDashboard | - |
| PUT | `/api/fees/:feeId/payment` | ParentDashboard | transactionId, method |
| GET | `/api/fees/pending/all` | AdminDashboard | - |
| GET | `/api/fees/reports/monthly` | AdminDashboard | ?month=6&year=2026 |

### Attendance & Assignments
| Method | Endpoint | Frontend Use | Body |
|--------|----------|--------------|------|
| POST | `/api/attendance/mark` | TutorDashboard | studentId, date, status |
| GET | `/api/attendance/:studentId` | StudentDashboard | - |
| POST | `/api/attendance/assignments` | TutorDashboard | title, subject, dueDate |
| GET | `/api/attendance/tutor/:tutorId/assignments` | TutorDashboard | - |

---

## 🔐 Authentication Flow

```
1. User enters email + password
2. Frontend calls: apiClient.auth.loginParent(email, password)
3. Backend AuthService:
   - Finds user in database
   - Compares password with bcrypt
   - Generates JWT token (contains userId + role)
   - Returns token
4. Frontend stores token: localStorage.setItem("authToken", token)
5. Every future request includes: Authorization: Bearer <token>
6. Backend authMiddleware:
   - Extracts token from header
   - Verifies JWT signature
   - Checks token not expired
   - Attaches userId, role to request
7. Controller accesses: req.userId, req.role
```

---

## 📊 Data Models Summary

### User (Authentication)
- email (unique)
- password (hashed)
- role (student | parent | tutor | admin)

### Student (Profile)
- studentId (unique ID like "ST-101")
- name, grade, section
- parentEmail (links to parent)
- assignedTutorIds[] (list of tutors)
- learningSubjects[] (enrolled subjects)
- attendance tracking

### Tutor (Profile)
- tutorId (unique ID like "T-201")
- name, specialty (subject)
- email (unique, must be @academyflow.com)
- assignedStudentIds[] (teaching these students)

### Parent (Profile)
- email (unique)
- name, phone, address
- childrenIds[] (links to students)

### FeePayment (Billing)
- feeId (unique)
- studentId, studentName
- amount, title, dueDate
- status (Pending | Paid)
- transactionId, paidDate

### Assignment (Coursework)
- assignmentId (unique)
- tutorId (who created it)
- title, subject, dueDate, description
- status (Active | Completed | On Hold)

### Attendance (Tracking)
- attendanceId (unique)
- studentId, date, status (Present | Absent | Late)
- batchId (optional - class ID)

### Result (Grades)
- resultId (unique)
- studentId, term
- gpa, scores (maths, physics, etc.)

---

## ⚡ Key Concepts

### 1. Request Flow
Frontend sends HTTP request → Express matches route → Middleware validates → Controller handles → Service processes → Model queries → Database → Response back

### 2. Authentication
Token stored in localStorage → Sent in Authorization header → authMiddleware verifies → User ID available in controller

### 3. Data Validation
Models define schema → MongoDB enforces → Services check business rules → Controllers validate input → Errors returned consistently

### 4. Services Are Reusable
Can be called from multiple controllers
Can be called from other services
Contain all business logic
Return data to caller

### 5. Middleware Runs Before Controller
Can validate request
Can extract data
Can throw errors
Can attach data to request

---

## 🚀 Starting the Backend

```bash
# Install
cd backend
npm install

# Configure
cp .env.example .env
# Edit .env with MongoDB URI

# Start
npm run dev

# Output should show:
# ✅ MongoDB Connected Successfully
# Server running on: http://localhost:5000
```

---

## 🧪 Testing Flow

```
1. Test Auth:
   curl -X POST http://localhost:5000/api/auth/login-parent \
     -H "Content-Type: application/json" \
     -d '{"email":"parent@example.com","password":"password"}'
   
   Response: { token: "eyJ...", userId: "..." }

2. Save token

3. Test Protected Route:
   curl -X GET http://localhost:5000/api/students/ST-101 \
     -H "Authorization: Bearer eyJ..."
   
   Response: { studentId: "ST-101", name: "...", ... }

4. Without token:
   curl -X GET http://localhost:5000/api/students/ST-101
   
   Response: { error: "No token provided" } (401)
```

---

## ❌ Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** Start MongoDB or update MONGODB_URI in .env

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Update FRONTEND_URL in .env to match frontend URL

### Token Invalid Error
```
Error: Invalid or expired token
```
**Fix:** Token might be expired (1 hour), user needs to login again

### Route Not Found
```
Cannot POST /api/students
```
**Fix:** Check route spelling, check middleware applied correctly

### Database Duplicate Error
```
Error: E11000 duplicate key error
```
**Fix:** Unique field already exists, use different value

---

## 📞 Quick Help Index

**Q: How does authentication work?**
A: User logs in → Backend creates JWT token → Frontend stores it → Sends with every request → Backend verifies with authMiddleware

**Q: Where are passwords stored?**
A: In User model, hashed with bcryptjs (can't be reversed)

**Q: How does a route get called?**
A: Frontend sends HTTP request → Express matches URL in routes/ → Applies middleware → Calls controller → Calls service → Returns response

**Q: Which service does StudentController use?**
A: StudentService for business logic

**Q: Can services call other services?**
A: Yes, they can call any other service

**Q: Where is data stored?**
A: MongoDB collections, defined by models/ schemas

**Q: What happens if token expires?**
A: authMiddleware returns 401 → Frontend should redirect to login

**Q: How to add a new API endpoint?**
A1. Create model in models/
A2. Create service in services/
A3. Create controller in controllers/
A4. Create route in routes/
A5. Import route in server.ts

---

## ✅ Ready to Connect!

All 7 folders work together in this order:

1. **config/** → Loads settings
2. **models/** → Defines data
3. **middleware/** → Validates requests
4. **controllers/** → Handles requests
5. **services/** → Processes logic
6. **routes/** → Maps URLs
7. **server.ts** → Orchestrates everything

**Frontend** ← → **apiClient.ts** ← → **Backend** ← → **MongoDB**

Start backend: `npm run dev` in backend folder
Start frontend: `npm run dev` in root folder
They communicate automatically! 🎉
