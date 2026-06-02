# Frontend API Integration Guide

## 📡 All API Endpoints Required

---

## 🔐 **Authentication APIs** (`/api/auth/*`)

### 1. Register Parent
```
POST /api/auth/register-parent
```

**Frontend Component:** `RegisterModal.tsx`

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "password123",
  "childName": "Abhilash",
  "childGrade": "12th Class"
}
```

**Response:**
```json
{
  "message": "Parent registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Frontend Usage:**
```typescript
// RegisterModal.tsx
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/auth/register-parent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        childName,
        childGrade
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Save token to localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
      
      // Redirect to parent dashboard
      navigate('/parent');
    } else {
      setError(data.error);
    }
  } catch (error) {
    setError('Registration failed');
  }
};
```

---

### 2. Parent Login
```
POST /api/auth/login-parent
```

**Frontend Component:** `LoginGateway.tsx` (Parent Tab)

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Parent login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Frontend Usage:**
```typescript
// LoginGateway.tsx
const handleParentLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login-parent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userRole', 'parent');
      
      onLoginSuccess('parent', data.userId);
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Login failed');
  }
};
```

---

### 3. Student Login
```
POST /api/auth/login-student
```

**Frontend Component:** `LoginGateway.tsx` (Student Tab)

**Request:**
```json
{
  "studentId": "ST-101"
}
```

**Response:**
```json
{
  "message": "Student login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011"
}
```

---

### 4. Tutor Login
```
POST /api/auth/login-tutor
```

**Frontend Component:** `LoginGateway.tsx` (Tutor Tab)

**Request:**
```json
{
  "email": "tutor@academyflow.com",
  "password": "password123"
}
```

**Response:** Same as parent login

---

### 5. Admin Login
```
POST /api/auth/login-admin
```

**Frontend Component:** `LoginGateway.tsx` (Admin Tab)

**Request:**
```json
{
  "email": "admin@academyflow.com",
  "password": "admin@123"
}
```

**Response:** Same as parent login

---

### 6. Logout
```
POST /api/auth/logout
```

**Frontend Component:** All Dashboards (Logout button)

**Request:**
```json
{}
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

**Frontend Usage:**
```typescript
// Navbar.tsx or any dashboard
const handleLogout = async () => {
  const token = localStorage.getItem('authToken');
  
  try {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    
    // Redirect to home
    navigate('/');
  } catch (error) {
    console.error('Logout failed');
  }
};
```

---

## 👨‍🎓 **Student APIs** (`/api/students/*`)

### 1. Get Student by ID
```
GET /api/students/:studentId
```

**Frontend Component:** `StudentDashboard.tsx`

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentId": "ST-101",
  "userId": "...",
  "name": "Abhilash",
  "grade": "12th Class",
  "section": "A",
  "parentEmail": "parent@example.com",
  "assignedTutorIds": ["T-201", "T-202"],
  "learningSubjects": ["Maths", "Physics", "Chemistry"],
  "attendanceRate": 94,
  "presentCount": 45,
  "absentCount": 3,
  "createdAt": "2026-06-01T10:00:00Z",
  "updatedAt": "2026-06-02T05:51:42Z"
}
```

**Frontend Usage:**
```typescript
// StudentDashboard.tsx
useEffect(() => {
  const fetchStudent = async () => {
    const token = localStorage.getItem('authToken');
    const studentId = "ST-101"; // Get from URL or state
    
    try {
      const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStudent(data);
      }
    } catch (error) {
      console.error('Failed to fetch student');
    }
  };
  
  fetchStudent();
}, []);
```

---

### 2. Get Students by Parent Email
```
GET /api/students/parent/:parentEmail
```

**Frontend Component:** `ParentDashboard.tsx`

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
[
  {
    "studentId": "ST-101",
    "name": "Abhilash",
    "grade": "12th Class",
    "assignedTutorIds": ["T-201"],
    "learningSubjects": ["Maths", "Physics"],
    "attendanceRate": 94
  },
  {
    "studentId": "ST-102",
    "name": "Ananya",
    "grade": "10th Class",
    "assignedTutorIds": ["T-202"],
    "learningSubjects": ["Biology"],
    "attendanceRate": 89
  }
]
```

**Frontend Usage:**
```typescript
// ParentDashboard.tsx
useEffect(() => {
  const fetchChildren = async () => {
    const token = localStorage.getItem('authToken');
    const parentEmail = "parent@example.com"; // Get from localStorage or state
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/students/parent/${parentEmail}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      setChildren(data);
    } catch (error) {
      console.error('Failed to fetch children');
    }
  };
  
  fetchChildren();
}, []);
```

---

### 3. Create Student (Admin)
```
POST /api/students
```

**Frontend Component:** `AdminDashboard.tsx`

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request:**
```json
{
  "studentId": "ST-103",
  "userId": "507f...",
  "name": "New Student",
  "grade": "11th Class",
  "section": "B",
  "parentEmail": "parent@example.com"
}
```

**Response:** Created student object with all fields

---

### 4. Update Student
```
PUT /api/students/:studentId
```

**Frontend Component:** `AdminDashboard.tsx`

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request:**
```json
{
  "name": "Updated Name",
  "grade": "12th Class",
  "section": "A"
}
```

**Response:** Updated student object

---

### 5. Assign Tutor to Student
```
POST /api/students/:studentId/assign-tutor
```

**Frontend Component:** `ParentDashboard.tsx` (Enrollment Wizard - Step 3)

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request:**
```json
{
  "tutorId": "T-201"
}
```

**Response:**
```json
{
  "message": "Tutor assigned successfully",
  "student": {
    "studentId": "ST-101",
    "assignedTutorIds": ["T-201"]
  }
}
```

**Frontend Usage:**
```typescript
// ParentDashboard.tsx - Enrollment Wizard
const handleAssignTutor = async (tutorId: string) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/students/ST-101/assign-tutor`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tutorId })
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Tutor assigned successfully');
      setTutorAssigned(true);
    }
  } catch (error) {
    alert('Failed to assign tutor');
  }
};
```

---

### 6. Add Learning Subjects
```
POST /api/students/:studentId/learning-subjects
```

**Frontend Component:** `ParentDashboard.tsx` (Enrollment Wizard - Step 2)

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request:**
```json
{
  "subjects": ["Maths", "Physics", "Chemistry"]
}
```

**Response:**
```json
{
  "message": "Subjects added successfully",
  "student": {
    "studentId": "ST-101",
    "learningSubjects": ["Maths", "Physics", "Chemistry"]
  }
}
```

---

## 💳 **Fee APIs** (`/api/fees/*`)

### 1. Create Fee (Admin)
```
POST /api/fees
```

**Frontend Component:** `AdminDashboard.tsx`

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request:**
```json
{
  "feeId": "FP-501",
  "studentId": "ST-101",
  "studentName": "Abhilash",
  "title": "Monthly Tuition",
  "amount": 5000,
  "dueDate": "2026-06-30"
}
```

**Response:** Created fee object

---

### 2. Get Fees by Student
```
GET /api/fees/:studentId
```

**Frontend Component:** `ParentDashboard.tsx`

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "feeId": "FP-501",
    "studentId": "ST-101",
    "studentName": "Abhilash",
    "title": "Monthly Tuition",
    "amount": 5000,
    "status": "Pending",
    "dueDate": "2026-06-30",
    "transactionId": null,
    "paidDate": null,
    "paymentMethod": null
  },
  {
    "feeId": "FP-502",
    "amount": 3000,
    "status": "Paid",
    "dueDate": "2026-05-30",
    "paidDate": "2026-05-28"
  }
]
```

**Frontend Usage:**
```typescript
// ParentDashboard.tsx
useEffect(() => {
  const fetchFees = async () => {
    const token = localStorage.getItem('authToken');
    const studentId = "ST-101";
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/fees/${studentId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      setFees(data);
    } catch (error) {
      console.error('Failed to fetch fees');
    }
  };
  
  fetchFees();
}, []);
```

---

### 3. Get Fee by ID
```
GET /api/fees/fee/:feeId
```

**Frontend Component:** `ParentDashboard.tsx`

**Response:** Single fee object

---

### 4. Mark Fee as Paid
```
PUT /api/fees/:feeId/payment
```

**Frontend Component:** `ParentDashboard.tsx` (Pay Fee Button)

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request:**
```json
{
  "transactionId": "TXN-12345",
  "paymentMethod": "Credit Card"
}
```

**Response:**
```json
{
  "message": "Fee payment updated successfully",
  "fee": {
    "feeId": "FP-501",
    "status": "Paid",
    "paidDate": "2026-06-02T05:51:42Z",
    "transactionId": "TXN-12345",
    "paymentMethod": "Credit Card"
  }
}
```

**Frontend Usage:**
```typescript
// ParentDashboard.tsx
const handlePayFee = async (feeId: string) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/fees/${feeId}/payment`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId: 'TXN-' + Date.now(),
          paymentMethod: 'Credit Card'
        })
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Fee paid successfully');
      // Refresh fees list
      fetchFees();
    }
  } catch (error) {
    alert('Payment failed');
  }
};
```

---

### 5. Get Pending Fees (Admin)
```
GET /api/fees/pending/all
```

**Frontend Component:** `AdminDashboard.tsx`

**Response:**
```json
[
  {
    "feeId": "FP-501",
    "studentId": "ST-101",
    "amount": 5000,
    "status": "Pending",
    "dueDate": "2026-06-30"
  },
  {
    "feeId": "FP-503",
    "studentId": "ST-102",
    "amount": 3000,
    "status": "Pending",
    "dueDate": "2026-06-15"
  }
]
```

---

### 6. Get Fee Report (Admin)
```
GET /api/fees/reports/monthly?month=6&year=2026
```

**Frontend Component:** `AdminDashboard.tsx`

**Response:**
```json
{
  "total": 10000,
  "paid": 5000,
  "pending": 5000,
  "feeCount": 2
}
```

**Frontend Usage:**
```typescript
// AdminDashboard.tsx
const fetchFeeReport = async (month: number, year: number) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/fees/reports/monthly?month=${month}&year=${year}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const data = await response.json();
    setFeeReport(data);
  } catch (error) {
    console.error('Failed to fetch report');
  }
};
```

---

## ✅ **Attendance APIs** (`/api/attendance/*`)

### 1. Mark Attendance
```
POST /api/attendance/mark
```

**Frontend Component:** `TutorDashboard.tsx`

**Headers Required:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request:**
```json
{
  "studentId": "ST-101",
  "date": "2026-06-02",
  "status": "Present"
}
```

**Response:**
```json
{
  "message": "Attendance marked successfully",
  "attendance": {
    "attendanceId": "ATT-001",
    "studentId": "ST-101",
    "date": "2026-06-02",
    "status": "Present"
  }
}
```

**Frontend Usage:**
```typescript
// TutorDashboard.tsx
const handleMarkAttendance = async (studentId: string, status: string) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(
      'http://localhost:5000/api/attendance/mark',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          date: new Date().toISOString().split('T')[0],
          status
        })
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Attendance marked');
    }
  } catch (error) {
    alert('Failed to mark attendance');
  }
};
```

---

### 2. Get Attendance by Student
```
GET /api/attendance/:studentId
```

**Frontend Component:** `StudentDashboard.tsx`

**Response:**
```json
[
  {
    "attendanceId": "ATT-001",
    "studentId": "ST-101",
    "date": "2026-06-02",
    "status": "Present"
  },
  {
    "attendanceId": "ATT-002",
    "studentId": "ST-101",
    "date": "2026-06-01",
    "status": "Present"
  }
]
```

**Frontend Usage:**
```typescript
// StudentDashboard.tsx
const fetchAttendance = async () => {
  const token = localStorage.getItem('authToken');
  const studentId = "ST-101";
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/attendance/${studentId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const data = await response.json();
    setAttendance(data);
  } catch (error) {
    console.error('Failed to fetch attendance');
  }
};
```

---

### 3. Create Assignment
```
POST /api/attendance/assignments
```

**Frontend Component:** `TutorDashboard.tsx`

**Request:**
```json
{
  "assignmentId": "ASG-001",
  "tutorId": "T-201",
  "title": "Maths Assignment Chapter 5",
  "subject": "Maths",
  "dueDate": "2026-06-09",
  "description": "Complete problems 1-20 from the textbook"
}
```

**Response:** Created assignment object

---

### 4. Get Assignments by Tutor
```
GET /api/attendance/tutor/:tutorId/assignments
```

**Frontend Component:** `TutorDashboard.tsx`

**Response:**
```json
[
  {
    "assignmentId": "ASG-001",
    "title": "Maths Assignment",
    "subject": "Maths",
    "dueDate": "2026-06-09",
    "status": "Active"
  }
]
```

---

## 🔑 **How to Set Up API Calls in Frontend**

### Option 1: Create an API Client Service (Recommended)

Create `src/services/apiClient.ts`:

```typescript
// src/services/apiClient.ts

const API_BASE_URL = 'http://localhost:5000/api';

class APIClient {
  private token: string | null = null;

  setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getAuthToken(): string | null {
    return this.token || localStorage.getItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Auth APIs
  async loginParent(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login-parent`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  async registerParent(
    email: string,
    password: string,
    childName: string,
    childGrade: string
  ) {
    const response = await fetch(`${API_BASE_URL}/auth/register-parent`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, childName, childGrade }),
    });
    return response.json();
  }

  // Student APIs
  async getStudentById(studentId: string) {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getStudentsByParent(parentEmail: string) {
    const response = await fetch(
      `${API_BASE_URL}/students/parent/${parentEmail}`,
      {
        headers: this.getHeaders(),
      }
    );
    return response.json();
  }

  // Fee APIs
  async getFeesByStudent(studentId: string) {
    const response = await fetch(`${API_BASE_URL}/fees/${studentId}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async markFeeAsPaid(
    feeId: string,
    transactionId: string,
    paymentMethod: string
  ) {
    const response = await fetch(`${API_BASE_URL}/fees/${feeId}/payment`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ transactionId, paymentMethod }),
    });
    return response.json();
  }

  // Attendance APIs
  async markAttendance(
    studentId: string,
    date: string,
    status: 'Present' | 'Absent' | 'Late'
  ) {
    const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ studentId, date, status }),
    });
    return response.json();
  }

  async getAttendanceByStudent(studentId: string) {
    const response = await fetch(`${API_BASE_URL}/attendance/${studentId}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }
}

export default new APIClient();
```

### Option 2: Use in Components

```typescript
// LoginGateway.tsx
import apiClient from '../services/apiClient';

const handleLogin = async () => {
  const response = await apiClient.loginParent(email, password);
  
  if (response.token) {
    apiClient.setAuthToken(response.token);
    navigate('/parent');
  } else {
    alert(response.error);
  }
};

// ParentDashboard.tsx
useEffect(() => {
  const loadChildren = async () => {
    const children = await apiClient.getStudentsByParent('parent@example.com');
    setChildren(children);
  };
  
  loadChildren();
}, []);

// Mark fee as paid
const handlePayFee = async (feeId: string) => {
  const response = await apiClient.markFeeAsPaid(
    feeId,
    'TXN-' + Date.now(),
    'Credit Card'
  );
  
  if (response.message) {
    alert('Fee paid successfully');
  }
};
```

---

## 📋 **Summary - All Endpoints**

| Endpoint | Method | Frontend Component | Purpose |
|----------|--------|-------------------|---------|
| `/api/auth/register-parent` | POST | RegisterModal | Parent registration |
| `/api/auth/login-parent` | POST | LoginGateway | Parent login |
| `/api/auth/login-student` | POST | LoginGateway | Student login |
| `/api/auth/login-tutor` | POST | LoginGateway | Tutor login |
| `/api/auth/login-admin` | POST | LoginGateway | Admin login |
| `/api/auth/logout` | POST | All Dashboards | Logout |
| `/api/students/:id` | GET | StudentDashboard | Get student |
| `/api/students/parent/:email` | GET | ParentDashboard | Get children |
| `/api/students` | POST | AdminDashboard | Create student |
| `/api/students/:id` | PUT | AdminDashboard | Update student |
| `/api/students/:id/assign-tutor` | POST | ParentDashboard | Assign tutor |
| `/api/students/:id/learning-subjects` | POST | ParentDashboard | Add subjects |
| `/api/fees` | POST | AdminDashboard | Create fee |
| `/api/fees/:studentId` | GET | ParentDashboard | Get fees |
| `/api/fees/fee/:feeId` | GET | ParentDashboard | Get fee detail |
| `/api/fees/:feeId/payment` | PUT | ParentDashboard | Pay fee |
| `/api/fees/pending/all` | GET | AdminDashboard | Pending fees |
| `/api/fees/reports/monthly` | GET | AdminDashboard | Fee report |
| `/api/attendance/mark` | POST | TutorDashboard | Mark attendance |
| `/api/attendance/:studentId` | GET | StudentDashboard | Get attendance |
| `/api/attendance/assignments` | POST | TutorDashboard | Create assignment |
| `/api/attendance/tutor/:tutorId/assignments` | GET | TutorDashboard | Get assignments |

---

## ✅ Next Steps

1. **Create `src/services/apiClient.ts`** with all methods shown above
2. **Update each component** to use apiClient instead of mock data
3. **Start backend** with `npm run dev` in backend folder
4. **Test each endpoint** with Postman or cURL
5. **Debug** any CORS or authentication issues

All endpoints are ready to use! 🚀
