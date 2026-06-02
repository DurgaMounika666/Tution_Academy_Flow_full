# Backend Architecture Deep Dive

## 📊 Complete Backend Flow Overview

```
Frontend Component
        ↓
apiClient.ts (HTTP Request)
        ↓
Express Router (routes/)
        ↓
Controller (controllers/)
        ↓
Service (services/)
        ↓
MongoDB Model (models/)
        ↓
MongoDB Database
```

---

## 🗂️ Backend Folder Structure & Explanation

### 1. **`backend/src/config/` - Configuration Layer**

**Purpose:** Centralized configuration for database and environment variables

#### Files:

**`database.ts`** - MongoDB Connection
```typescript
// What it does:
- Connects to MongoDB using mongoose
- Sets up connection error handling
- Logs connection status

// Used by:
- server.ts (calls connectDB() on startup)
- All models (mongoose uses this connection)

// Flow:
server.ts → connectDB() → mongoose.connect(mongoUri) → MongoDB
```

**`env.ts`** - Environment Variables
```typescript
// What it does:
- Loads .env file variables
- Exports config object with all settings
- Type-safe configuration access

// Used by:
- AuthService (JWT_SECRET, JWT_EXPIRE)
- server.ts (PORT, FRONTEND_URL)
- All services that need configs

// Example:
config.jwtSecret → Used in AuthService.generateToken()
config.mongoUri → Used in database.ts connection
```

**Frontend Connection:**
- Frontend sets `REACT_APP_API_URL` environment variable
- apiClient.ts reads this to know backend URL
- Backend's FRONTEND_URL in .env allows CORS

---

### 2. **`backend/src/models/` - MongoDB Schemas**

**Purpose:** Define database structure and field types

#### Files (8 models):

**`User.ts`** - Authentication Base
```typescript
// Schema:
{
  email: String (unique)
  password: String (hashed)
  role: "student" | "parent" | "tutor" | "admin"
  isActive: Boolean
  timestamps
}

// Used by:
- AuthService (login/register checks user)
- Every authentication flow

// Frontend Flow:
LoginGateway.tsx → apiClient.auth.loginParent()
  → AuthController → AuthService → User.findOne()
```

**`Student.ts`** - Student Profile
```typescript
// Schema:
{
  studentId: "ST-101" (unique)
  userId: Reference to User
  name: String
  grade: String ("12th Class")
  section: String
  parentEmail: String
  assignedTutorIds: [String]
  learningSubjects: [String]
  attendanceRate: Number
  presentCount, absentCount: Number
}

// Used by:
- StudentService (CRUD operations)
- StudentController (API handlers)
- StudentDashboard.tsx

// Frontend Flow:
StudentDashboard.tsx → apiClient.students.getById("ST-101")
  → StudentController → StudentService → Student.findOne()
  → Returns student data to display
```

**`Tutor.ts`** - Tutor Profile
```typescript
// Schema:
{
  tutorId: "T-201" (unique)
  userId: Reference to User
  name: String
  specialty: String ("Mathematics")
  email: String (unique, @academyflow.com)
  image: String
  assignedStudentIds: [String]
  pendingTasksCount: Number
}

// Used by:
- TutorService (CRUD operations)
- TutorController (API handlers)
- TutorDashboard.tsx
- ParentDashboard.tsx (for tutor assignment)

// Frontend Flow:
ParentDashboard.tsx → apiClient.students.assignTutor(studentId, tutorId)
  → StudentController → StudentService → Tutor reference
```

**`Parent.ts`** - Parent Profile
```typescript
// Schema:
{
  userId: Reference to User
  email: String (unique)
  name: String
  phone: String
  address: String
  childrenIds: [String] (ST-101, ST-102, etc.)
}

// Used by:
- ParentDashboard.tsx (showing parent info)
- StudentService (linking parent to students)

// Frontend Flow:
ParentDashboard.tsx → apiClient.students.getByParent("parent@email.com")
  → StudentController → StudentService → Student.find({ parentEmail })
```

**`FeePayment.ts`** - Fee Records
```typescript
// Schema:
{
  feeId: "FP-501" (unique)
  studentId: "ST-101"
  studentName: String
  title: String ("Monthly Tuition")
  amount: Number
  status: "Paid" | "Pending"
  dueDate: Date
  transactionId: String
  paidDate: Date
  paymentMethod: String
}

// Used by:
- FeeService (CRUD & reporting)
- FeeController (API handlers)
- ParentDashboard.tsx (fee display & payment)
- AdminDashboard.tsx (fee management)

// Frontend Flow:
ParentDashboard.tsx → apiClient.fees.markAsPaid(feeId, transactionId)
  → FeeController → FeeService → FeePayment.findOneAndUpdate()
```

**`Assignment.ts`** - Course Assignments
```typescript
// Schema:
{
  assignmentId: String (unique)
  tutorId: "T-201"
  title: String
  subject: String ("Mathematics")
  dueDate: Date
  description: String
  submissionsPending: Number
  status: "Active" | "Completed" | "On Hold"
}

// Used by:
- AssignmentService (CRUD)
- TutorDashboard.tsx (create & manage)
- StudentDashboard.tsx (view & submit)

// Frontend Flow:
TutorDashboard.tsx → apiClient.attendance.createAssignment()
  → AttendanceController → Assignment.save()
  → StudentDashboard.tsx → apiClient.attendance.getAssignmentsByTutor()
```

**`Attendance.ts`** - Attendance Records
```typescript
// Schema:
{
  attendanceId: String (unique)
  studentId: "ST-101"
  date: Date
  status: "Present" | "Absent" | "Late"
  batchId: String (optional)
}

// Used by:
- AttendanceService (CRUD & reporting)
- TutorDashboard.tsx (mark attendance)
- StudentDashboard.tsx (view attendance)

// Frontend Flow:
TutorDashboard.tsx → apiClient.attendance.mark(studentId, date, status)
  → AttendanceController → Attendance.save()
  → StudentDashboard.tsx → apiClient.attendance.getByStudent()
```

**`Result.ts`** - Student Results
```typescript
// Schema:
{
  resultId: String (unique)
  studentId: "ST-101"
  term: String ("Term 1")
  gpa: Number
  mathsScore, physicsScore, literatureScore, compSciScore: Number
}

// Used by:
- StudentDashboard.tsx (display results)
- AdminDashboard.tsx (publish results)

// Frontend Flow:
StudentDashboard.tsx → Displays results from mock data
  → Future: apiClient will fetch from Result model
```

---

### 3. **`backend/src/middleware/` - Request Processing Layer**

**Purpose:** Handle request validation, authentication, and error processing

#### Files:

**`auth.ts`** - Authentication & Authorization
```typescript
// What it does:
- Extracts JWT token from Authorization header
- Verifies token signature and expiry
- Adds userId and role to request object
- Enforces role-based access control

// Key Functions:
export const authMiddleware = (req, res, next) => {
  // Checks: Authorization Bearer token exists?
  // Verifies: Token signature valid?
  // Attaches: req.userId, req.role for later use
  // Next: Passes to controller
}

export const roleMiddleware = (allowedRoles) => {
  // Checks: User role in allowedRoles?
  // Rejects: 403 Forbidden if not authorized
}

// Used by:
- Every protected route
- All student/fee/attendance endpoints

// Route Example:
router.post("/students/:id/assign-tutor", 
  authMiddleware,           // ← Check token
  roleMiddleware(["admin"]), // ← Check if admin
  StudentController.assignTutor
)

// Frontend Flow:
LoginGateway.tsx → Saves token from login response
  → apiClient.setAuthToken(token)
  → All subsequent apiClient calls include Authorization header
  → authMiddleware validates it
```

**`errorHandler.ts`** - Error Processing
```typescript
// What it does:
- Catches all errors from routes
- Formats error responses consistently
- Handles MongoDB validation errors
- Handles duplicate key errors
- Logs errors for debugging

// Used by:
- Catches errors from all controllers
- Returns proper HTTP status codes

// Frontend Flow:
Frontend makes request
  → Error occurs in controller/service
  → errorHandler catches it
  → Returns { error: "...", message: "..." }
  → Frontend receives and displays error message
```

---

### 4. **`backend/src/services/` - Business Logic Layer**

**Purpose:** Reusable business logic independent of HTTP

#### Files (6 services):

**`AuthService.ts`** - Authentication Logic
```typescript
// What it does:
- Hash passwords with bcryptjs
- Generate JWT tokens
- Verify tokens
- Validate credentials

// Key Methods:
static async hashPassword(password) 
  → bcrypt.hash(password, 10)

static generateToken(userId, role)
  → jwt.sign({ userId, role }, JWT_SECRET)

static async loginParent(email, password)
  → Find user
  → Compare password hash
  → Return token

static registerParent(email, password, childName, childGrade)
  → Check if exists
  → Hash password
  → Save to DB
  → Return token

// Used by:
- AuthController (all login/register endpoints)
- Frontend authentication flow

// Frontend Flow:
LoginGateway.tsx:
  1. User enters email + password
  2. Calls apiClient.auth.loginParent(email, password)
  3. POST /api/auth/login-parent
  4. AuthController calls AuthService.loginParent()
  5. Returns token
  6. Frontend saves token in localStorage
  7. token used in all future requests
```

**`StudentService.ts`** - Student Operations
```typescript
// Key Methods:
static async getStudentById(studentId)
  → Student.findOne({ studentId })

static async getStudentsByParent(parentEmail)
  → Student.find({ parentEmail })

static async createStudent(studentId, userId, name, grade, parentEmail)
  → new Student({...}) → save()

static async updateStudent(studentId, updateData)
  → Student.findOneAndUpdate()

static async assignTutor(studentId, tutorId)
  → Find student
  → Add tutorId to assignedTutorIds array
  → Save

static async updateAttendance(studentId, presentCount, absentCount)
  → Calculate attendanceRate
  → Update student record

// Used by:
- StudentController (all student endpoints)
- ParentDashboard.tsx (get children)
- StudentDashboard.tsx (get student info)
- AdminDashboard.tsx (manage students)

// Frontend Flow Examples:

// 1. Get student data:
StudentDashboard.tsx
  → apiClient.students.getById("ST-101")
  → StudentController.getStudentById("ST-101")
  → StudentService.getStudentById("ST-101")
  → Student.findOne({ studentId: "ST-101" })
  → Returns student object
  → Display in UI

// 2. Assign tutor:
ParentDashboard.tsx (Enrollment Wizard)
  → Select tutor
  → apiClient.students.assignTutor("ST-101", "T-201")
  → StudentController.assignTutor()
  → StudentService.assignTutor("ST-101", "T-201")
  → Update Student document
  → Return updated student
```

**`FeeService.ts`** - Fee Management
```typescript
// Key Methods:
static async createFee(feeId, studentId, studentName, title, amount, dueDate)
  → Create FeePayment record

static async getFeesByStudent(studentId)
  → FeePayment.find({ studentId })

static async updateFeePayment(feeId, transactionId, paymentMethod)
  → Mark status as "Paid"
  → Save transactionId and paidDate

static async getPendingFees(studentId)
  → Find all Pending fees

static async generateFeeReport(month, year)
  → Get all fees for period
  → Calculate total, paid, pending amounts
  → Return summary

// Used by:
- FeeController (all fee endpoints)
- ParentDashboard.tsx (show fees, pay)
- AdminDashboard.tsx (fee reports)

// Frontend Flow:

// 1. Display pending fees:
ParentDashboard.tsx
  → apiClient.fees.getByStudent("ST-101")
  → FeeController.getFeesByStudent()
  → FeeService.getFeesByStudent()
  → Returns array of fees
  → Display in table

// 2. Pay fee:
ParentDashboard.tsx (Pay Fee button)
  → User confirms payment
  → apiClient.fees.markAsPaid("FP-501", "TXN-12345", "Credit Card")
  → FeeController.updateFeePayment()
  → FeeService.updateFeePayment()
  → Update FeePayment.status = "Paid"
  → Returns updated fee
  → Show success message

// 3. Get fee report:
AdminDashboard.tsx
  → apiClient.fees.getReport(month=6, year=2026)
  → FeeController.getFeeReport()
  → FeeService.generateFeeReport()
  → Calculate totals
  → Return { total, paid, pending, feeCount }
```

**`TutorService.ts`** - Tutor Operations
```typescript
// Key Methods:
static async getTutorById(tutorId)
  → Tutor.findOne({ tutorId })

static async getTutorByEmail(email)
  → Tutor.findOne({ email })

static async getAllTutors()
  → Tutor.find()

static async createTutor(tutorId, userId, name, specialty, email, image)
  → Create Tutor record

static async assignStudent(tutorId, studentId)
  → Add studentId to assignedStudentIds

static async getAssignedStudents(tutorId)
  → Return array of student IDs

// Used by:
- TutorController
- ParentDashboard.tsx (select tutor for enrollment)
- TutorDashboard.tsx (view assigned students)
- AdminDashboard.tsx (manage tutors)

// Frontend Flow:

// 1. Get tutors for enrollment:
ParentDashboard.tsx (Enrollment Wizard Step 3)
  → apiClient shows tutor dropdown
  → tutors come from /api/tutors endpoint
  → User selects tutor
  → Assign via apiClient.students.assignTutor()

// 2. Tutor views assigned students:
TutorDashboard.tsx
  → apiClient.tutors.getAssignedStudents(tutorId)
  → TutorService.getAssignedStudents()
  → Returns ["ST-101", "ST-102"]
  → Display list of students
```

**`AssignmentService.ts`** - Assignment Management
```typescript
// Key Methods:
static async createAssignment(assignmentId, tutorId, title, subject, dueDate, description)
  → Create Assignment record

static async getAssignmentsByTutor(tutorId)
  → Assignment.find({ tutorId })

static async getAssignmentById(assignmentId)
  → Assignment.findOne()

static async updateAssignmentStatus(assignmentId, status)
  → Update status: "Active" → "Completed"

static async getActiveAssignments()
  → Assignment.find({ status: "Active" })

// Used by:
- AssignmentController
- TutorDashboard.tsx (create assignments)
- StudentDashboard.tsx (view assignments)

// Frontend Flow:

// 1. Tutor creates assignment:
TutorDashboard.tsx
  → Form: title, subject, dueDate, description
  → apiClient.attendance.createAssignment(tutorId, title, ...)
  → AssignmentController
  → AssignmentService.createAssignment()
  → Saves to MongoDB
  → Confirm to tutor

// 2. Student views assignments:
StudentDashboard.tsx
  → apiClient.attendance.getAssignmentsByTutor("T-201")
  → Returns array of assignments
  → Display in list with status
  → Can click to view details
```

**`AttendanceService.ts`** - Attendance Management
```typescript
// Key Methods:
static async markAttendance(attendanceId, studentId, date, status, batchId)
  → Create Attendance record
  → Status: "Present" | "Absent" | "Late"

static async getStudentAttendance(studentId)
  → Attendance.find({ studentId })
  → Sort by date descending

static async getAttendanceReport(studentId, month, year)
  → Get attendance records for period
  → Calculate: attendanceRate, presentCount, absentCount
  → Return summary report

static async markBatchAttendance(date, batchId, attendance)
  → Mark attendance for entire batch at once
  → Used when tutor marks class attendance

// Used by:
- AttendanceController
- TutorDashboard.tsx (mark attendance)
- StudentDashboard.tsx (view attendance)
- AdminDashboard.tsx (attendance reports)

// Frontend Flow:

// 1. Tutor marks attendance:
TutorDashboard.tsx
  → Show list of students
  → Tutor selects Present/Absent for each
  → Click "Submit Attendance"
  → apiClient.attendance.mark(studentId, date, status)
  → AttendanceService.markAttendance()
  → Saved to MongoDB

// 2. Student views attendance:
StudentDashboard.tsx
  → apiClient.attendance.getByStudent("ST-101")
  → Returns attendance report
  → Displays: "Attendance Rate: 94%"
  → Shows calendar of present/absent days
```

---

### 5. **`backend/src/controllers/` - Request Handlers**

**Purpose:** Handle HTTP requests, validate input, call services, return responses

#### Files:

**`AuthController.ts`** - Authentication Endpoints
```typescript
// What it does:
- Receives HTTP requests from routes
- Extracts request body data
- Validates input
- Calls AuthService methods
- Returns responses to client

// Methods:

static async registerParent(req, res) {
  // 1. Extract: { email, password, childName, childGrade }
  // 2. Validate: Check email and password present
  // 3. Call: AuthService.registerParent()
  // 4. Return: { token, refreshToken, userId }
}

static async loginStudent(req, res) {
  // 1. Extract: { studentId }
  // 2. Validate: Check studentId present
  // 3. Call: AuthService.loginStudent()
  // 4. Return: { token, refreshToken }
}

static async loginParent(req, res) {
  // 1. Extract: { email, password }
  // 2. Validate: Check email and password
  // 3. Call: AuthService.loginParent()
  // 4. Handle errors: Invalid credentials → return 401
  // 5. Return: { token, refreshToken, userId }
}

// Similar for: loginTutor, loginAdmin, logout

// Frontend Flow:
Frontend: POST /api/auth/login-parent
  → Body: { email: "parent@example.com", password: "password" }
  → AuthController.loginParent() receives it
  → Validates input
  → AuthService.loginParent(email, password)
  → Returns token
  → Frontend receives and stores token
```

**`StudentController.ts`** - Student Endpoints
```typescript
// Methods:

static async getStudentById(req, res) {
  // Route: GET /api/students/:studentId
  // 1. Extract: req.params.studentId
  // 2. Call: StudentService.getStudentById()
  // 3. Return: student object
}

static async getStudentsByParent(req, res) {
  // Route: GET /api/students/parent/:parentEmail
  // 1. Extract: req.params.parentEmail
  // 2. Call: StudentService.getStudentsByParent()
  // 3. Return: array of students
}

static async createStudent(req, res) {
  // Route: POST /api/students
  // 1. Extract: { studentId, name, grade, parentEmail }
  // 2. Validate: Required fields
  // 3. Call: StudentService.createStudent()
  // 4. Return: new student object
}

static async updateStudent(req, res) {
  // Route: PUT /api/students/:studentId
  // 1. Extract: studentId and update data
  // 2. Call: StudentService.updateStudent()
  // 3. Return: updated student
}

static async assignTutor(req, res) {
  // Route: POST /api/students/:studentId/assign-tutor
  // 1. Extract: studentId from URL, tutorId from body
  // 2. Call: StudentService.assignTutor()
  // 3. Return: updated student with tutor assigned
}

static async addLearningSubjects(req, res) {
  // Route: POST /api/students/:studentId/learning-subjects
  // 1. Extract: studentId and subjects array
  // 2. Call: StudentService.addLearningSubjects()
  // 3. Return: updated student
}

// Frontend Flow Example:
ParentDashboard.tsx (Enrollment Wizard - Select Subjects)
  → User selects: ["Maths", "Physics"]
  → Calls: apiClient.students.addSubjects("ST-101", ["Maths", "Physics"])
  → POST /api/students/ST-101/learning-subjects
  → StudentController.addLearningSubjects()
  → StudentService.addLearningSubjects()
  → Student.findOneAndUpdate() with new subjects
  → Returns updated student
  → Frontend updates UI
```

**`FeeController.ts`** - Fee Endpoints
```typescript
// Methods:

static async createFee(req, res) {
  // Route: POST /api/fees
  // Admin creates fee record
}

static async getFeesByStudent(req, res) {
  // Route: GET /api/fees/:studentId
  // Returns all fees for a student
}

static async updateFeePayment(req, res) {
  // Route: PUT /api/fees/:feeId/payment
  // Mark fee as paid with transaction ID
}

static async getPendingFees(req, res) {
  // Route: GET /api/fees/pending/all
  // Returns all unpaid fees (optionally filtered by student)
}

static async getFeeReport(req, res) {
  // Route: GET /api/fees/reports/monthly
  // Query params: ?month=6&year=2026
  // Returns fee statistics
}

// Frontend Flow Example:
ParentDashboard.tsx
  → Component mounts
  → Calls: apiClient.fees.getByStudent("ST-101")
  → GET /api/fees/ST-101
  → FeeController.getFeesByStudent("ST-101")
  → FeeService.getFeesByStudent()
  → Returns: [{ feeId, amount, status, dueDate }, ...]
  → Displays fees in table
  → Parent clicks "Pay"
  → Calls: apiClient.fees.markAsPaid(feeId, txnId, method)
  → PUT /api/fees/:feeId/payment
  → FeeController.updateFeePayment()
  → Returns updated fee with status: "Paid"
  → UI updates to show "Paid" badge
```

---

### 6. **`backend/src/routes/` - API Endpoints**

**Purpose:** Map HTTP requests to controllers, apply middleware

#### Files:

**`authRoutes.ts`** - Authentication Endpoints
```typescript
router.post("/register-parent", AuthController.registerParent);
// Endpoint: POST /api/auth/register-parent
// Middleware: None (public)
// Handler: AuthController.registerParent

router.post("/login-student", AuthController.loginStudent);
// Endpoint: POST /api/auth/login-student
// No authentication needed (public endpoint)

router.post("/login-parent", AuthController.loginParent);
router.post("/login-tutor", AuthController.loginTutor);
router.post("/login-admin", AuthController.loginAdmin);
router.post("/logout", AuthController.logout);

// How routing works:
// Request: POST http://localhost:5000/api/auth/login-parent
// Express finds: router.post("/login-parent", ...)
// Calls: AuthController.loginParent(req, res)
```

**`studentRoutes.ts`** - Student Endpoints
```typescript
router.get("/:studentId", authMiddleware, StudentController.getStudentById);
// Endpoint: GET /api/students/ST-101
// Middleware: authMiddleware (check token)
// Handler: StudentController.getStudentById

router.post("/", authMiddleware, StudentController.createStudent);
// Endpoint: POST /api/students
// Middleware: authMiddleware
// Handler: StudentController.createStudent

router.put("/:studentId", authMiddleware, StudentController.updateStudent);
// Endpoint: PUT /api/students/ST-101
// Middleware: authMiddleware
// Handler: StudentController.updateStudent

router.post("/:studentId/assign-tutor", authMiddleware, StudentController.assignTutor);
// Endpoint: POST /api/students/ST-101/assign-tutor
// Middleware: authMiddleware
// Handler: StudentController.assignTutor

router.post("/:studentId/learning-subjects", authMiddleware, StudentController.addLearningSubjects);
// Endpoint: POST /api/students/ST-101/learning-subjects
// Middleware: authMiddleware
// Handler: StudentController.addLearningSubjects

// Flow when request comes:
// 1. Express matches: GET /api/students/ST-101
// 2. Applies middleware: authMiddleware (checks token)
// 3. If middleware passes: Calls StudentController.getStudentById
// 4. If middleware fails: Returns 401 Unauthorized
```

**`feeRoutes.ts`** - Fee Endpoints
```typescript
router.post("/", authMiddleware, FeeController.createFee);
// Endpoint: POST /api/fees
// Create new fee record

router.get("/:studentId", authMiddleware, FeeController.getFeesByStudent);
// Endpoint: GET /api/fees/ST-101
// Get all fees for student

router.get("/fee/:feeId", authMiddleware, FeeController.getFeeById);
// Endpoint: GET /api/fees/fee/FP-501
// Get specific fee

router.put("/:feeId/payment", authMiddleware, FeeController.updateFeePayment);
// Endpoint: PUT /api/fees/FP-501/payment
// Mark fee as paid

router.get("/pending/all", authMiddleware, FeeController.getPendingFees);
// Endpoint: GET /api/fees/pending/all
// Get all pending fees

router.get("/reports/monthly", authMiddleware, FeeController.getFeeReport);
// Endpoint: GET /api/fees/reports/monthly?month=6&year=2026
// Get fee report for month
```

**`attendanceRoutes.ts`** - Attendance & Assignment Endpoints
```typescript
// Attendance endpoints:
router.post("/mark", authMiddleware, async (req, res) => {...});
// Endpoint: POST /api/attendance/mark
// Mark student attendance

router.get("/:studentId", authMiddleware, async (req, res) => {...});
// Endpoint: GET /api/attendance/ST-101
// Get student attendance records

// Assignment endpoints:
router.post("/assignments", authMiddleware, async (req, res) => {...});
// Endpoint: POST /api/attendance/assignments
// Create new assignment

router.get("/tutor/:tutorId/assignments", authMiddleware, async (req, res) => {...});
// Endpoint: GET /api/attendance/tutor/T-201/assignments
// Get tutor's assignments
```

---

### 7. **`backend/server.ts`** - Main Entry Point

```typescript
// What it does:
1. Import all routes and middleware
2. Create Express app
3. Apply global middleware (CORS, Helmet, JSON parser)
4. Register routes
5. Connect to MongoDB
6. Start server on port 5000

// Flow on startup:
npm run dev
  → ts-node src/server.ts
  → Creates Express app
  → Applies middleware
  → Connects to MongoDB
  → Registers routes
  → Listens on port 5000
  → Ready to accept requests

// When request comes:
Frontend makes request
  → Express receives it
  → Middleware processes it
  → Routes match to controller
  → Controller processes
  → Response sent back
```

---

## 🔄 Complete Frontend-to-Backend Request Flow

### Example: Parent Logs In and Views Child's Fees

```
FRONTEND (LoginGateway.tsx)
┌─────────────────────────────────┐
│ 1. User enters email + password │
│    email: parent@example.com    │
│    password: password           │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ 2. Click "Login" button         │
│    Calls:                       │
│    apiClient.auth.loginParent() │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. apiClient (src/services/apiClient.ts)                   │
│    Makes HTTP request:                                      │
│    POST http://localhost:5000/api/auth/login-parent        │
│    Headers: { "Content-Type": "application/json" }         │
│    Body: { email, password }                               │
└──────────────┬────────────────────────────────────────────┘
               ↓
BACKEND (Routes)
┌──────────────────────────────────────────────────┐
│ 4. Express Router (src/routes/authRoutes.ts)    │
│    Matches: POST /auth/login-parent             │
│    Middleware: None (public endpoint)           │
│    Calls: AuthController.loginParent(req, res)  │
└──────────────┬─────────────────────────────────┘
               ↓
BACKEND (Controller)
┌──────────────────────────────────────────────────┐
│ 5. AuthController.loginParent()                 │
│    Extracts: email, password from req.body      │
│    Validates: email and password not empty      │
│    Calls: AuthService.loginParent()             │
└──────────────┬─────────────────────────────────┘
               ↓
BACKEND (Service)
┌──────────────────────────────────────────────────┐
│ 6. AuthService.loginParent()                    │
│    Finds: User.findOne({ email })               │
│    Compares: bcrypt.compare(password, hashed)   │
│    Generates: JWT token                         │
│    Returns: { token, refreshToken, userId }    │
└──────────────┬─────────────────────────────────┘
               ↓
BACKEND (Database)
┌──────────────────────────────────────────────────┐
│ 7. MongoDB                                      │
│    Searches: users collection                   │
│    Finds: User record with email                │
│    Returns: User document                       │
└──────────────┬─────────────────────────────────┘
               ↓
BACKEND (Response)
┌──────────────────────────────────────────────────┐
│ 8. AuthController sends response:               │
│    Status: 200 OK                               │
│    Body: {                                       │
│      message: "Login successful",               │
│      token: "eyJhbGc...",                       │
│      refreshToken: "...",                       │
│      userId: "507f1f77bcf86cd799439011"        │
│    }                                            │
└──────────────┬─────────────────────────────────┘
               ↓
FRONTEND (apiClient Response)
┌──────────────────────────────────────────────────┐
│ 9. apiClient receives response                  │
│    Calls: apiClient.setAuthToken(response.token)│
│    Saves: localStorage.setItem("authToken", ...) │
└──────────────┬─────────────────────────────────┘
               ↓
FRONTEND (App.tsx)
┌──────────────────────────────────────────────────┐
│ 10. onLoginSuccess("parent", userId) called    │
│     Navigates to: /parent                        │
│     Renders: ParentDashboard component          │
└──────────────┬─────────────────────────────────┘
               ↓
FRONTEND (ParentDashboard.tsx)
┌──────────────────────────────────────────────────┐
│ 11. useEffect hook runs on mount                │
│     Calls:                                       │
│     apiClient.fees.getByStudent("ST-101")       │
└──────────────┬─────────────────────────────────┘
               ↓
BACKEND (Routes)
┌──────────────────────────────────────────────────┐
│ 12. Express Router (src/routes/feeRoutes.ts)    │
│     Matches: GET /fees/ST-101                   │
│     Middleware: authMiddleware                  │
│       → Checks Authorization header             │
│       → Verifies JWT token                      │
│       → Sets req.userId, req.role               │
│     Calls: FeeController.getFeesByStudent()    │
└──────────────┬─────────────────────────────────┘
               ↓
BACKEND (Controller)
┌──────────────────────────────────────────────────┐
│ 13. FeeController.getFeesByStudent()            │
│     Extracts: studentId from req.params          │
│     Calls: FeeService.getFeesByStudent()        │
└──────────────┬─────────────────────────────────┘
               ↓
BACKEND (Service)
┌──────────────────────────────────────────────────┐
│ 14. FeeService.getFeesByStudent()               │
│     Calls: FeePayment.find({ studentId })      │
│     Returns: Array of fees                      │
└──────────────┬─────────────────────────────────┘
               ↓
BACKEND (Database)
┌──────────────────────────────────────────────────┐
│ 15. MongoDB Query                               │
│     Searches: feepayments collection             │
│     Filter: { studentId: "ST-101" }            │
│     Returns: [                                   │
│       {                                          │
│         feeId: "FP-501",                        │
│         amount: 5000,                           │
│         status: "Pending",                      │
│         dueDate: "2026-06-30"                   │
│       },                                         │
│       ...                                        │
│     ]                                            │
└──────────────┬─────────────────────────────────┘
               ↓
BACKEND (Response)
┌──────────────────────────────────────────────────┐
│ 16. FeeController sends response                │
│     Status: 200 OK                              │
│     Body: [{ feeId, amount, status, ... }]     │
└──────────────┬─────────────────────────────────┘
               ↓
FRONTEND (Display)
┌──────────────────────────────────────────────────┐
│ 17. ParentDashboard.tsx receives fees          │
│     Stores in state: setFees([...])             │
│     Renders: Fees table with:                   │
│     - Fee ID, Amount, Status, Due Date          │
│     - "Pay" button for each pending fee        │
└──────────────┬─────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│ 18. User clicks "Pay" on fee                    │
│     Calls: apiClient.fees.markAsPaid()          │
│     PUT /api/fees/FP-501/payment                │
│     Body: { transactionId, paymentMethod }     │
│     ... (same flow as above)                    │
│     Backend updates: status = "Paid"            │
│     Returns updated fee                         │
│     Frontend UI updates to show "Paid" badge   │
└──────────────────────────────────────────────────┘
```

---

## 📋 Frontend Components Using Backend

| Frontend Component | Backend Endpoints Used | Flow |
|---|---|---|
| **LoginGateway.tsx** | `/auth/login-*` | User login → get token → set authorization |
| **Hero.tsx** | (Future) Demo booking endpoint | Book demo → send to WhatsApp |
| **ParentDashboard.tsx** | `/students`, `/fees` | Get children, manage fees, enroll |
| **StudentDashboard.tsx** | `/students/:id`, `/attendance`, `/assignments` | View profile, attendance, assignments |
| **TutorDashboard.tsx** | `/tutor/:id`, `/attendance/mark`, `/assignments` | View students, mark attendance, create assignments |
| **AdminDashboard.tsx** | All endpoints | Full CRUD on all entities |
| **RegisterModal.tsx** | `/auth/register-parent` | Parent registration |

---

## 🔑 Key Connections Summary

**Config Layer** (`config/`)
  → Sets up database connection and loads environment
  
**Model Layer** (`models/`)
  → Defines MongoDB schemas with validation
  
**Service Layer** (`services/`)
  → Contains reusable business logic (can be used by multiple controllers/APIs)
  
**Controller Layer** (`controllers/`)
  → Handles HTTP requests, validates input, calls services
  
**Route Layer** (`routes/`)
  → Maps URLs to controllers, applies middleware
  
**Middleware** (`middleware/`)
  → Processes requests (authentication, error handling)
  
**Server** (`server.ts`)
  → Orchestrates everything, connects to database, starts server

**Frontend** (`src/services/apiClient.ts`)
  → Makes HTTP calls to backend routes
  → Stores tokens
  → Handles authentication headers
