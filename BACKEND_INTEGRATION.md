# Backend Integration Checklist

## Frontend Integration Tasks

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure MongoDB Database Connection
- **MongoDB Atlas (Recommended)**: Create a cluster and set `MONGODB_URI` in `.env` to your remote Atlas connection string (enables access across all devices and server restarts).
- **Local Fallback**: Run a local MongoDB instance on `localhost:27017`.

### 3. Configure Environment
Copy `.env.example` to `.env` and update values:
- MONGODB_URI
- JWT_SECRET
- FRONTEND_URL

### 4. Start Backend Server
```bash
npm run dev
# Server will run on http://localhost:5000
```

### 5. Update Frontend API Base URL
In frontend project, update API calls to use:
```
http://localhost:5000/api
```

## Frontend Component Updates Required

### LoginGateway.tsx
Replace hardcoded authentication with backend API calls:
```typescript
// Before: Direct state update
// After: Call backend
const response = await fetch('http://localhost:5000/api/auth/login-parent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem('token', data.token);
```

### Hero.tsx
Update demo booking to call backend API:
```typescript
// POST to /api/bookings/demo-whatsapp endpoint
```

### ParentDashboard.tsx
- Replace mock fee data with backend API
- Update fee payment to call backend endpoint
- Load student data from backend

### StudentDashboard.tsx
- Load student assignments from backend
- Load attendance data from backend
- Load results from backend

### TutorDashboard.tsx
- Load assigned students from backend
- Update attendance marking to use backend
- Load assignments from backend

### AdminDashboard.tsx
- Connect all CRUD operations to backend
- Load data from backend endpoints
- Update all forms to persist to database

## API Response Format Examples

### Login Response
```json
{
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "userId": "user_id_here"
}
```

### Student Data
```json
{
  "_id": "mongo_id",
  "studentId": "ST-101",
  "name": "Abhilash",
  "grade": "12th Class",
  "attendanceRate": 94,
  "learningSubjects": ["Maths", "Physics", "Chemistry"]
}
```

### Fee Data
```json
{
  "_id": "mongo_id",
  "feeId": "FP-501",
  "studentId": "ST-101",
  "amount": 5000,
  "status": "Pending",
  "dueDate": "2026-06-30"
}
```

## Testing

### Test Auth Endpoints
```bash
curl -X POST http://localhost:5000/api/auth/login-student \
  -H "Content-Type: application/json" \
  -d '{"studentId":"ST-101"}'
```

### Test Protected Routes
```bash
curl -X GET http://localhost:5000/api/students/ST-101 \
  -H "Authorization: Bearer <your_token>"
```

## Deployment (Future)

### Backend Deployment Options
- **Heroku** - Free tier available
- **Railway** - Easy MongoDB integration
- **Render** - MongoDB support
- **AWS** - EC2 + MongoDB Atlas
- **DigitalOcean** - Affordable and simple

### Database Deployment
- **MongoDB Atlas** - Cloud MongoDB hosting (free tier: 512MB)

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify PORT 5000 is available
- Check .env file is configured correctly

### CORS errors
- Ensure FRONTEND_URL in .env matches frontend URL
- Check backend is running on correct port

### JWT errors
- Verify token is being sent in Authorization header
- Check JWT_SECRET in .env matches across restarts

### Database connection errors
- Verify MONGODB_URI is correct
- Check MongoDB is running/accessible
- For Atlas: Ensure IP is whitelisted

## Next Development Phases

### Phase 1: Complete (✅)
- Backend structure setup
- Core models and services
- Basic CRUD endpoints
- Authentication system

### Phase 2: In Progress
- Frontend integration with backend APIs
- Replace mock data with real database calls
- Complete all dashboard functionalities

### Phase 3: Future
- Real-time features (WebSocket)
- File upload handling
- Email notifications
- Advanced reporting
- Mobile app (React Native)
