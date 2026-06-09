# Academy Flow Backend

Backend API server for Academy Flow - Educational Platform

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Configure MongoDB Connection String in .env**
```env
# Recommend MongoDB Atlas for cloud persistence:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/academy_flow?retryWrites=true&w=majority

# Or local fallback for offline development:
# MONGODB_URI=mongodb://localhost:27017/academy_flow
```

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       (MongoDB connection)
│   │   └── env.js            (Environment variables)
│   ├── middleware/
│   │   ├── auth.js           (JWT authentication & role-based access)
│   │   └── errorHandler.js   (Error handling)
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Tutor.js
│   │   ├── Parent.js
│   │   ├── FeePayment.js
│   │   ├── Assignment.js
│   │   ├── Attendance.js
│   │   └── Result.js
│   ├── services/
│   │   ├── AuthService.js    (Authentication logic)
│   │   ├── StudentService.js (Student operations)
│   │   ├── FeeService.js     (Fee management)
│   │   ├── TutorService.js   (Tutor operations)
│   │   └── AssignmentService.js (Assignment operations)
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── StudentController.js
│   │   └── FeeController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── feeRoutes.js
│   │   └── attendanceRoutes.js
│   └── server.js             (Main entry point)
├── package.json
└── .env.example
```

## API Endpoints

### Authentication
- `POST /api/auth/register-parent` - Register new parent
- `POST /api/auth/login-student` - Login as student
- `POST /api/auth/login-parent` - Login as parent
- `POST /api/auth/login-tutor` - Login as tutor
- `POST /api/auth/login-admin` - Login as admin
- `POST /api/auth/logout` - Logout

### Students
- `GET /api/students/:studentId` - Get student details
- `GET /api/students/parent/:parentEmail` - Get all students for parent
- `POST /api/students` - Create new student
- `PUT /api/students/:studentId` - Update student
- `POST /api/students/:studentId/assign-tutor` - Assign tutor to student

### Fees
- `POST /api/fees` - Create fee record
- `GET /api/fees/:studentId` - Get student fees
- `GET /api/fees/fee/:feeId` - Get specific fee
- `PUT /api/fees/:feeId/payment` - Mark fee as paid
- `GET /api/fees/pending/all` - Get all pending fees
- `GET /api/fees/reports/monthly` - Generate fee reports

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/:studentId` - Get student attendance

### Assignments
- `POST /api/attendance/assignments` - Create assignment
- `GET /api/attendance/tutor/:tutorId/assignments` - Get tutor assignments

## Environment Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/academy_flow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@academyflow.com
ADMIN_PASSWORD=admin@123
```

## Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

All errors return standardized format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Next Steps

1. Set up MongoDB database
2. Update `.env` file with your configuration
3. Run `npm install`
4. Start development server with `npm run dev`
5. Test endpoints using Postman or similar API client
6. Connect frontend to backend API endpoints

### MongoDB Atlas (Cloud - Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new database (M0 tier is free).
3. Whitelist your IP address under Network Access, and create a Database User.
4. Copy the connection string under Connect > Drivers.
5. Update `MONGODB_URI` in `.env` with your connection string.

### Local MongoDB (Fallback)
```bash
# Windows: Install MongoDB Community Edition
# Or using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Technologies Used

- **Express.js** - Web framework
- **JavaScript** - Core logic
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin requests

## Support

For issues or questions, please create an issue in the repository.
