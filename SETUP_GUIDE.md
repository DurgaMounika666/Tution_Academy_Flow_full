# Academy Flow - Backend + Frontend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas (Cloud Database - Recommended) or local MongoDB instance
- Git

### Option 1: Root Workspace Shortcuts (Easiest)

You can manage both services directly from the root of the project using root scripts:

```bash
# 1. Install dependencies for both frontend and backend
npm run install:all

# 2. In backend/ directory, copy .env.example to .env and configure MONGODB_URI
# 3. In frontend/ directory, copy .env.example to .env

# 4. Start backend (runs on http://localhost:5000)
npm run dev:backend

# 5. Start frontend (runs on http://localhost:5173 or http://localhost:3000)
npm run dev:frontend
```

---

### Option 2: Running Services Separately

If you prefer managing directories manually:

#### Step 1: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your MongoDB connection string (MONGODB_URI)
```

##### Option A: MongoDB Atlas (Cloud - Recommended)
To ensure that all application data persists permanently and is accessible across multiple devices:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up/login.
2. Create a new project and build a database (the M0 free tier is fully sufficient).
3. Under **Database Access**, create a user with read/write privileges.
4. Under **Network Access**, whitelist your IP address (or `0.0.0.0/0` for access from anywhere).
5. In **Database** > **Connect** > **Drivers**, select Node.js and copy the connection string.
6. Replace the placeholder in backend `.env` with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/academy_flow?retryWrites=true&w=majority
   ```

##### Option B: Local MongoDB (Fallback)
If you prefer running a local database for offline development:
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# Or use Docker to run local MongoDB:
docker run -d -p 27017:27017 --name mongodb mongo:latest
# Then set MONGODB_URI in backend .env to:
# MONGODB_URI=mongodb://localhost:27017/academy_flow
```

#### Step 2: Start Backend Server

```bash
# From backend directory
npm run dev

# You should see:
# ✅ MongoDB Connected Successfully
# Server running on: http://localhost:5000
```

#### Step 3: Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start frontend (keep backend running)
npm run dev

# Frontend will run on: http://localhost:5173 or http://localhost:3000
```

### Step 4: Test Integration

#### Test via Terminal

```bash
# 1. Test Backend Health
curl http://localhost:5000/health

# 2. Login as Student
curl -X POST http://localhost:5000/api/auth/login-student \
  -H "Content-Type: application/json" \
  -d '{"studentId":"ST-101"}'

# Expected response:
# {"message":"Student login successful","token":"...","refreshToken":"..."}

# 3. Get Student Details (use token from above)
curl -X GET http://localhost:5000/api/students/ST-101 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test via Postman

1. Import `POSTMAN_COLLECTION.json` (see below)
2. Set environment variables:
   - `baseUrl`: http://localhost:5000
   - `token`: (auto-set after login)
3. Run requests in order

---

## 📝 Using API Client in Frontend

### Example: Login in React Component

```typescript
import { apiClient } from "./services/apiClient";

export function LoginGateway() {
  const handleParentLogin = async (email: string, password: string) => {
    try {
      const response = await apiClient.auth.loginParent(email, password);
      apiClient.setAuthToken(response.token);
      localStorage.setItem("userId", response.userId);
      // Navigate to parent dashboard
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <button onClick={() => handleParentLogin("parent@example.com", "password")}>
      Login
    </button>
  );
}
```

### Example: Get Student Data

```typescript
import { useEffect, useState } from "react";
import { apiClient } from "./services/apiClient";

export function StudentDashboard() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await apiClient.students.getById("ST-101");
        setStudent(data);
      } catch (error) {
        console.error("Failed to fetch student:", error);
      }
    };

    fetchStudent();
  }, []);

  return <div>{student?.name}</div>;
}
```

---

## 🗄️ MongoDB Collections (Auto-Created)

When backend starts, these collections will be auto-created:

- **users** - Authentication credentials
- **students** - Student profiles
- **tutors** - Tutor profiles
- **parents** - Parent profiles
- **feepayments** - Fee records
- **assignments** - Course assignments
- **attendances** - Attendance records
- **results** - Student results

### Seed Initial Data (Optional)

Create `backend/src/seeders/seedDB.ts`:

```typescript
import { Student } from "../models/Student";

export const seedInitialData = async () => {
  const initialStudents = [
    {
      studentId: "ST-101",
      userId: "...",
      name: "Abhilash",
      grade: "12th Class",
      parentEmail: "parent@example.com",
      learningSubjects: ["Maths", "Physics", "Chemistry"],
      attendanceRate: 94,
    },
    // Add more students...
  ];

  await Student.insertMany(initialStudents);
};
```

---

## 🔗 API Endpoints Reference

### Authentication
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/auth/register-parent` | `{ email, password, childName, childGrade }` |
| POST | `/auth/login-student` | `{ studentId }` |
| POST | `/auth/login-parent` | `{ email, password }` |
| POST | `/auth/login-tutor` | `{ email, password }` |
| POST | `/auth/login-admin` | `{ email, password }` |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students/:studentId` | Get student by ID |
| GET | `/students/parent/:parentEmail` | Get all children of parent |
| POST | `/students` | Create new student |
| PUT | `/students/:studentId` | Update student info |
| POST | `/students/:studentId/assign-tutor` | Assign tutor to student |

### Fees
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/fees` | Create fee record |
| GET | `/fees/:studentId` | Get fees for student |
| GET | `/fees/fee/:feeId` | Get specific fee |
| PUT | `/fees/:feeId/payment` | Mark fee as paid |
| GET | `/fees/pending/all` | Get all pending fees |
| GET | `/fees/reports/monthly` | Get fee report |

### Attendance & Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/attendance/mark` | Mark attendance |
| GET | `/attendance/:studentId` | Get student attendance |
| POST | `/attendance/assignments` | Create assignment |
| GET | `/attendance/tutor/:tutorId/assignments` | Get tutor assignments |

---

## 🧪 Testing Scenarios

### Scenario 1: Parent Registration & Student View

```typescript
// 1. Register new parent
await apiClient.auth.registerParent(
  "newparent@gmail.com",
  "password123",
  "Johnny",
  "10th Class"
);

// 2. Login as parent
const parentLogin = await apiClient.auth.loginParent(
  "newparent@gmail.com",
  "password123"
);
apiClient.setAuthToken(parentLogin.token);

// 3. Get children
const children = await apiClient.students.getByParent("newparent@gmail.com");
```

### Scenario 2: Create & Pay Fee

```typescript
// 1. Create fee
const fee = await apiClient.fees.create({
  feeId: "FP-999",
  studentId: "ST-101",
  studentName: "Abhilash",
  title: "Monthly Tuition",
  amount: 5000,
  dueDate: "2026-06-30",
});

// 2. Mark as paid
const paid = await apiClient.fees.markAsPaid(
  "FP-999",
  "TXN-12345",
  "Credit Card"
);
```

### Scenario 3: Mark Attendance

```typescript
await apiClient.attendance.mark(
  "ST-101",
  "2026-06-02",
  "Present",
  "BATCH-001"
);

// Get attendance report
const report = await apiClient.attendance.getByStudent("ST-101");
console.log(`Attendance Rate: ${report.attendanceRate}%`);
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB or update MONGODB_URI in .env

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Check FRONTEND_URL in .env matches your frontend URL (http://localhost:5173)

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** 
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Token Expired
```
Error: Invalid or expired token
```
**Solution:** Login again and set new token

---

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to hosting
```

---

## 🚀 Deployment

### Option 1: Railway.app (Recommended)
1. Push to GitHub
2. Connect Railway to GitHub
3. Set environment variables
4. Deploy with one click

### Option 2: Heroku
```bash
cd backend
heroku create academy-flow-api
git push heroku main
heroku config:set MONGODB_URI=<your_atlas_uri>
```

### Option 3: DigitalOcean
1. Create App Platform
2. Connect GitHub repo
3. Set environment variables
4. Deploy

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT Authentication](https://jwt.io/)
- [Mongoose Documentation](https://mongoosejs.com/)

---

## ✅ Verification Checklist

- [ ] Node.js installed (v18+)
- [ ] MongoDB Atlas cluster configured and accessible (or local MongoDB fallback)
- [ ] Backend dependencies installed (`npm install` in backend/ or `npm run install:all` from root)
- [ ] `.env` file configured with the correct `MONGODB_URI` in backend/
- [ ] Backend server running (`npm run dev` in backend/ or `npm run dev:backend` from root)
- [ ] Frontend dependencies installed (`npm install` in frontend/ or `npm run install:all` from root)
- [ ] Frontend can reach backend on http://localhost:5000
- [ ] API client properly configured in frontend (loads data from MongoDB instead of localStorage)
- [ ] All test scenarios pass

---

## 📞 Support

For issues:
1. Check this guide
2. Review API logs in terminal
3. Check MongoDB connection
4. Verify environment variables
5. Check browser console for frontend errors

---

**Happy Coding! 🎓**
