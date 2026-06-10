/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const { connectDB } = require("./config/database");
const { config } = require("./config/env");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { User } = require("./models/User");
const { Student } = require("./models/Student");
const { Tutor } = require("./models/Tutor");
const { Parent } = require("./models/Parent");
const { Timetable } = require("./models/Timetable");
const { BookingController } = require("./controllers/BookingController");
const { Catalog } = require("./models/Catalog");

// Routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const studentRoutes = require("./routes/studentRoutes");
const feeRoutes = require("./routes/feeRoutes");
const feeStructureRoutes = require("./routes/feeStructureRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const parentRoutes = require("./routes/parentRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const chatRoutes = require("./routes/chatRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const resultRoutes = require("./routes/resultRoutes");

const app = express();

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
app.get("/api/bookings/demo", BookingController.getAllDemoBookings);
app.use("/api/bookings", bookingRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/fee-structure", feeStructureRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/results", resultRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const printStartupBanner = (port) => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🎓 Academy Flow Backend Server                     ║
║                                                              ║
║  Server: http://localhost:${port}                            ║
║  Environment: ${config.nodeEnv}
║  MongoDB: Connected ✅                                        ║
║                                                              ║
║  API Endpoints:                                              ║
║  • POST   /api/auth/register-parent                          ║
║  • POST   /api/auth/login-parent                             ║
║  • POST   /api/auth/login-student                            ║
║  • POST   /api/auth/login-tutor                              ║
║  • POST   /api/auth/login-admin                              ║
║  • GET    /api/students/:studentId                           ║
║  • GET    /api/tutors                                        ║
║  • GET    /api/parents/by-email/:email                       ║
║  • GET    /api/timetable                                     ║
║  • GET    /api/timetable/summary                             ║
╚══════════════════════════════════════════════════════════════╝
  `);
};

const listenWithPortFallback = (initialPort) => {
  return new Promise((resolve, reject) => {
    const tryPort = (portToTry) => {
      const server = app
        .listen(portToTry, () => {
          const addressInfo = server.address();
          resolve(addressInfo?.port ?? portToTry);
        })
        .on("error", (error) => {
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

// ─────────────────────────────────────────────────────────────
//  SEED DATA  — 7 Indian Tutors + 12 Indian Students + Parents
// ─────────────────────────────────────────────────────────────

const TUTORS_SEED = [
  {
    tutorId: "T-201",
    email: "anitha.sharma@academyflow.com",
    name: "Dr. Anitha Sharma",
    specialty: "Mathematics Specialist",
    qualification: "Ph.D Mathematics – Osmania University",
    experience: "12 years",
    phone: "+91 98400 11201",
    subjects: ["Mathematics", "Aptitude / Logical Reasoning"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtyd2CRb90hNdYfBUMT1G-WThzLZAZF92RO58CqttTvKAeDFYdafu_oYAUYJpgv8OnQXgnlrekQojBmHtmXFFLL-np47rR8OMuEOLo_3RzeFzOve2Rtp1F5j7rEYdgOEmhacGcX4mbh2PLF1mMgDvNlqZpjTE4-jMD8v5Fj4DIWQlm_oPECHD8zCJgwMvBAHsaepCZawoKDTNECjxqnVM2A89IZOQY-G-cF96q40-pAvnLsHMj5qQn7QRRzw8uAuS5dMl2LfSYNcI",
    assignedStudentIds: ["ST-101", "ST-102", "ST-103", "ST-104", "ST-105"],
    pendingTasksCount: 8,
  },
  {
    tutorId: "T-202",
    email: "narayana.rao@academyflow.com",
    name: "Prof. Narayana Rao",
    specialty: "Physics & Chemistry Instructor",
    qualification: "M.Sc Physics – Hyderabad University",
    experience: "9 years",
    phone: "+91 98400 11202",
    subjects: ["Physics", "Chemistry", "General Science"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAugtMwAAZ-BC_ggIBikD0GJg9BF89SlmEX_a1WBtclVuGPJOQcJoqW0fdlNO3p9_AUbOK50PVG_vDlX7zdd9EW_X5KDdcfS-TGIEVkIuA2e4hLSFajBXMrBBA5oiuC7XHVdorup5giu00g5VtHqOEG28xs-gMWCHnMmGF_pb69-JXYjfi88iOZwL1bN1dmgAd02rFk7PrPi7XIeBoooP9IBH03n6kSvvfweTUl1CdhxU9BoUMqFUfi8BiXV3GK4a7enHsYjp0jF4",
    assignedStudentIds: ["ST-101", "ST-106", "ST-107", "ST-108"],
    pendingTasksCount: 5,
  },
  {
    tutorId: "T-203",
    email: "anand.krishna@academyflow.com",
    name: "Mr. Anand Krishna",
    specialty: "Computer Science Expert",
    qualification: "B.Tech CSE – JNTU Hyderabad",
    experience: "7 years",
    phone: "+91 98400 11203",
    subjects: ["Computer Science", "Mathematics"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-102", "ST-109", "ST-110"],
    pendingTasksCount: 3,
  },
  {
    tutorId: "T-204",
    email: "lakshmi.devi@academyflow.com",
    name: "Mrs. Lakshmi Devi",
    specialty: "English & Communication Skills",
    qualification: "M.A English Literature – OU",
    experience: "10 years",
    phone: "+91 98400 11204",
    subjects: ["English", "Grammar & Communication Skills", "Spoken English"],
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-103", "ST-104", "ST-111"],
    pendingTasksCount: 6,
  },
  {
    tutorId: "T-205",
    email: "venkat.reddy@academyflow.com",
    name: "Mr. Venkat Reddy",
    specialty: "Social Studies & Telugu",
    qualification: "M.A Telugu – Kakatiya University",
    experience: "8 years",
    phone: "+91 98400 11205",
    subjects: ["Social Studies", "Telugu / Hindi", "General Knowledge (GK)"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-105", "ST-106", "ST-112"],
    pendingTasksCount: 4,
  },
  {
    tutorId: "T-206",
    email: "sunita.pandey@academyflow.com",
    name: "Ms. Sunita Pandey",
    specialty: "Biology & Life Sciences",
    qualification: "M.Sc Biology – Nagpur University",
    experience: "6 years",
    phone: "+91 98400 11206",
    subjects: ["Biology", "General Science", "Environmental Science (EVS)"],
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-107", "ST-108", "ST-109"],
    pendingTasksCount: 7,
  },
  {
    tutorId: "T-207",
    email: "ramesh.gupta@academyflow.com",
    name: "Mr. Ramesh Gupta",
    specialty: "SSC & Competitive Exam Coach",
    qualification: "M.Ed – CIEFL Hyderabad",
    experience: "14 years",
    phone: "+91 98400 11207",
    subjects: ["SSC Exam Preparation", "Olympiad Preparation", "Competitive Exam Foundation", "Aptitude / Logical Reasoning"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-110", "ST-111", "ST-112"],
    pendingTasksCount: 9,
  },
];

const STUDENTS_SEED = [
  {
    studentId: "ST-101",
    email: "arjun.sharma@student.academyflow.com",
    name: "Arjun Sharma",
    grade: "10th Class",
    section: "Section A",
    parentEmail: "priya.sharma@gmail.com",
    assignedTutorIds: ["T-201", "T-202"],
    learningSubjects: ["Mathematics", "Physics", "Chemistry"],
    attendanceRate: 92, presentCount: 138, absentCount: 12,
    phone: "+91 98401 00101",
    dateOfBirth: "2010-04-15",
    address: "12-3, Banjara Hills, Hyderabad",
  },
  {
    studentId: "ST-102",
    email: "kavya.reddy@student.academyflow.com",
    name: "Kavya Reddy",
    grade: "10th Class",
    section: "Section A",
    parentEmail: "suresh.reddy@gmail.com",
    assignedTutorIds: ["T-201", "T-203"],
    learningSubjects: ["Mathematics", "Computer Science", "English"],
    attendanceRate: 96, presentCount: 144, absentCount: 6,
    phone: "+91 98401 00102",
    dateOfBirth: "2010-07-22",
    address: "45, Jubilee Hills, Hyderabad",
  },
  {
    studentId: "ST-103",
    email: "rohith.kumar@student.academyflow.com",
    name: "Rohith Kumar",
    grade: "9th Class",
    section: "Section B",
    parentEmail: "meena.kumar@gmail.com",
    assignedTutorIds: ["T-201", "T-204"],
    learningSubjects: ["Mathematics", "English", "Social Studies"],
    attendanceRate: 88, presentCount: 132, absentCount: 18,
    phone: "+91 98401 00103",
    dateOfBirth: "2011-01-10",
    address: "78, Madhapur, Hyderabad",
  },
  {
    studentId: "ST-104",
    email: "divya.nair@student.academyflow.com",
    name: "Divya Nair",
    grade: "9th Class",
    section: "Section A",
    parentEmail: "krishna.nair@gmail.com",
    assignedTutorIds: ["T-201", "T-204"],
    learningSubjects: ["Mathematics", "English", "Biology"],
    attendanceRate: 94, presentCount: 141, absentCount: 9,
    phone: "+91 98401 00104",
    dateOfBirth: "2011-03-28",
    address: "33, Gachibowli, Hyderabad",
  },
  {
    studentId: "ST-105",
    email: "sai.krishna@student.academyflow.com",
    name: "Sai Krishna",
    grade: "10th Class",
    section: "Section B",
    parentEmail: "padma.krishna@gmail.com",
    assignedTutorIds: ["T-201", "T-205"],
    learningSubjects: ["Mathematics", "Telugu / Hindi", "Social Studies"],
    attendanceRate: 85, presentCount: 127, absentCount: 23,
    phone: "+91 98401 00105",
    dateOfBirth: "2010-09-05",
    address: "22, Ameerpet, Hyderabad",
  },
  {
    studentId: "ST-106",
    email: "sneha.patel@student.academyflow.com",
    name: "Sneha Patel",
    grade: "9th Class",
    section: "Section C",
    parentEmail: "ravi.patel@gmail.com",
    assignedTutorIds: ["T-202", "T-205"],
    learningSubjects: ["Physics", "Chemistry", "Social Studies"],
    attendanceRate: 91, presentCount: 136, absentCount: 14,
    phone: "+91 98401 00106",
    dateOfBirth: "2011-06-18",
    address: "56, Kukatpally, Hyderabad",
  },
  {
    studentId: "ST-107",
    email: "vikram.singh@student.academyflow.com",
    name: "Vikram Singh",
    grade: "8th Class",
    section: "Section A",
    parentEmail: "ananya.singh@gmail.com",
    assignedTutorIds: ["T-202", "T-206"],
    learningSubjects: ["Physics", "Biology", "General Science"],
    attendanceRate: 89, presentCount: 133, absentCount: 17,
    phone: "+91 98401 00107",
    dateOfBirth: "2012-11-02",
    address: "9, Secunderabad, Hyderabad",
  },
  {
    studentId: "ST-108",
    email: "preethi.menon@student.academyflow.com",
    name: "Preethi Menon",
    grade: "8th Class",
    section: "Section B",
    parentEmail: "rajesh.menon@gmail.com",
    assignedTutorIds: ["T-202", "T-206"],
    learningSubjects: ["Physics", "Chemistry", "Biology"],
    attendanceRate: 97, presentCount: 145, absentCount: 5,
    phone: "+91 98401 00108",
    dateOfBirth: "2012-02-14",
    address: "67, LB Nagar, Hyderabad",
  },
  {
    studentId: "ST-109",
    email: "aakash.verma@student.academyflow.com",
    name: "Aakash Verma",
    grade: "10th Class",
    section: "Section C",
    parentEmail: "geeta.verma@gmail.com",
    assignedTutorIds: ["T-203", "T-206"],
    learningSubjects: ["Computer Science", "Mathematics", "Biology"],
    attendanceRate: 93, presentCount: 139, absentCount: 11,
    phone: "+91 98401 00109",
    dateOfBirth: "2010-08-30",
    address: "14, Uppal, Hyderabad",
  },
  {
    studentId: "ST-110",
    email: "meghana.rao@student.academyflow.com",
    name: "Meghana Rao",
    grade: "9th Class",
    section: "Section A",
    parentEmail: "srinivas.rao@gmail.com",
    assignedTutorIds: ["T-203", "T-207"],
    learningSubjects: ["Computer Science", "Aptitude / Logical Reasoning", "SSC Exam Preparation"],
    attendanceRate: 98, presentCount: 147, absentCount: 3,
    phone: "+91 98401 00110",
    dateOfBirth: "2011-05-12",
    address: "88, Miyapur, Hyderabad",
  },
  {
    studentId: "ST-111",
    email: "harshitha.iyer@student.academyflow.com",
    name: "Harshitha Iyer",
    grade: "10th Class",
    section: "Section B",
    parentEmail: "subramaniam.iyer@gmail.com",
    assignedTutorIds: ["T-204", "T-207"],
    learningSubjects: ["English", "SSC Exam Preparation", "Olympiad Preparation"],
    attendanceRate: 90, presentCount: 135, absentCount: 15,
    phone: "+91 98401 00111",
    dateOfBirth: "2010-12-07",
    address: "100, Manikonda, Hyderabad",
  },
  {
    studentId: "ST-112",
    email: "rahul.das@student.academyflow.com",
    name: "Rahul Das",
    grade: "8th Class",
    section: "Section C",
    parentEmail: "monika.das@gmail.com",
    assignedTutorIds: ["T-205", "T-207"],
    learningSubjects: ["Telugu / Hindi", "Competitive Exam Foundation", "General Knowledge (GK)"],
    attendanceRate: 87, presentCount: 130, absentCount: 20,
    phone: "+91 98401 00112",
    dateOfBirth: "2012-07-25",
    address: "25, Dilsukhnagar, Hyderabad",
  },
];

const PARENTS_SEED = [
  { email: "priya.sharma@gmail.com", name: "Priya Sharma", phone: "+91 98400 20001", address: "12-3, Banjara Hills, Hyderabad", occupation: "Software Engineer", childrenIds: ["ST-101"] },
  { email: "suresh.reddy@gmail.com", name: "Suresh Reddy", phone: "+91 98400 20002", address: "45, Jubilee Hills, Hyderabad", occupation: "Business Owner", childrenIds: ["ST-102"] },
  { email: "meena.kumar@gmail.com", name: "Meena Kumar", phone: "+91 98400 20003", address: "78, Madhapur, Hyderabad", occupation: "Doctor", childrenIds: ["ST-103"] },
  { email: "krishna.nair@gmail.com", name: "Krishna Nair", phone: "+91 98400 20004", address: "33, Gachibowli, Hyderabad", occupation: "Bank Manager", childrenIds: ["ST-104"] },
  { email: "padma.krishna@gmail.com", name: "Padma Krishna", phone: "+91 98400 20005", address: "22, Ameerpet, Hyderabad", occupation: "Teacher", childrenIds: ["ST-105"] },
  { email: "ravi.patel@gmail.com", name: "Ravi Patel", phone: "+91 98400 20006", address: "56, Kukatpally, Hyderabad", occupation: "Engineer", childrenIds: ["ST-106"] },
  { email: "ananya.singh@gmail.com", name: "Ananya Singh", phone: "+91 98400 20007", address: "9, Secunderabad, Hyderabad", occupation: "Accountant", childrenIds: ["ST-107"] },
  { email: "rajesh.menon@gmail.com", name: "Rajesh Menon", phone: "+91 98400 20008", address: "67, LB Nagar, Hyderabad", occupation: "Lawyer", childrenIds: ["ST-108"] },
  { email: "geeta.verma@gmail.com", name: "Geeta Verma", phone: "+91 98400 20009", address: "14, Uppal, Hyderabad", occupation: "Nurse", childrenIds: ["ST-109"] },
  { email: "srinivas.rao@gmail.com", name: "Srinivas Rao", phone: "+91 98400 20010", address: "88, Miyapur, Hyderabad", occupation: "IT Manager", childrenIds: ["ST-110"] },
  { email: "subramaniam.iyer@gmail.com", name: "Subramaniam Iyer", phone: "+91 98400 20011", address: "100, Manikonda, Hyderabad", occupation: "Professor", childrenIds: ["ST-111"] },
  { email: "monika.das@gmail.com", name: "Monika Das", phone: "+91 98400 20012", address: "25, Dilsukhnagar, Hyderabad", occupation: "Entrepreneur", childrenIds: ["ST-112"] },
];

const TIMETABLE_SEED = [
  { scheduleId: "SCH-001", tutorId: "T-201", subject: "Mathematics", grade: "10th Class", day: "Monday", startTime: "09:00 AM", endTime: "10:30 AM", mode: "Offline", room: "Room 101", assignedStudentIds: ["ST-101", "ST-102"] },
  { scheduleId: "SCH-002", tutorId: "T-201", subject: "Mathematics", grade: "9th Class", day: "Tuesday", startTime: "11:00 AM", endTime: "12:30 PM", mode: "Online", room: "Zoom Link A", assignedStudentIds: ["ST-103", "ST-104"] },
  { scheduleId: "SCH-003", tutorId: "T-201", subject: "Mathematics", grade: "10th Class", day: "Wednesday", startTime: "09:00 AM", endTime: "10:30 AM", mode: "Offline", room: "Room 101", assignedStudentIds: ["ST-101", "ST-102", "ST-105"] },
  { scheduleId: "SCH-004", tutorId: "T-202", subject: "Physics", grade: "10th Class", day: "Monday", startTime: "11:00 AM", endTime: "12:30 PM", mode: "Offline", room: "Lab 1", assignedStudentIds: ["ST-101", "ST-106"] },
  { scheduleId: "SCH-005", tutorId: "T-202", subject: "Chemistry", grade: "9th Class", day: "Wednesday", startTime: "02:00 PM", endTime: "03:30 PM", mode: "Offline", room: "Lab 2", assignedStudentIds: ["ST-106", "ST-107", "ST-108"] },
  { scheduleId: "SCH-006", tutorId: "T-202", subject: "General Science", grade: "8th Class", day: "Friday", startTime: "10:00 AM", endTime: "11:30 AM", mode: "Online", room: "Zoom Link B", assignedStudentIds: ["ST-107", "ST-108"] },
  { scheduleId: "SCH-007", tutorId: "T-203", subject: "Computer Science", grade: "10th Class", day: "Tuesday", startTime: "02:00 PM", endTime: "03:30 PM", mode: "Offline", room: "Computer Lab", assignedStudentIds: ["ST-102", "ST-109"] },
  { scheduleId: "SCH-008", tutorId: "T-203", subject: "Computer Science", grade: "9th Class", day: "Thursday", startTime: "02:00 PM", endTime: "03:30 PM", mode: "Offline", room: "Computer Lab", assignedStudentIds: ["ST-110"] },
  { scheduleId: "SCH-009", tutorId: "T-204", subject: "English", grade: "9th Class", day: "Monday", startTime: "02:00 PM", endTime: "03:00 PM", mode: "Online", room: "Zoom Link C", assignedStudentIds: ["ST-103", "ST-104"] },
  { scheduleId: "SCH-010", tutorId: "T-204", subject: "Spoken English", grade: "10th Class", day: "Thursday", startTime: "10:00 AM", endTime: "11:00 AM", mode: "Offline", room: "Room 103", assignedStudentIds: ["ST-111"] },
  { scheduleId: "SCH-011", tutorId: "T-205", subject: "Telugu / Hindi", grade: "10th Class", day: "Tuesday", startTime: "10:00 AM", endTime: "11:30 AM", mode: "Offline", room: "Room 104", assignedStudentIds: ["ST-105"] },
  { scheduleId: "SCH-012", tutorId: "T-205", subject: "Social Studies", grade: "9th Class", day: "Thursday", startTime: "11:00 AM", endTime: "12:30 PM", mode: "Online", room: "Zoom Link D", assignedStudentIds: ["ST-106", "ST-112"] },
  { scheduleId: "SCH-013", tutorId: "T-206", subject: "Biology", grade: "8th Class", day: "Wednesday", startTime: "11:00 AM", endTime: "12:30 PM", mode: "Offline", room: "Bio Lab", assignedStudentIds: ["ST-107", "ST-108"] },
  { scheduleId: "SCH-014", tutorId: "T-206", subject: "Biology", grade: "10th Class", day: "Friday", startTime: "02:00 PM", endTime: "03:30 PM", mode: "Offline", room: "Bio Lab", assignedStudentIds: ["ST-109"] },
  { scheduleId: "SCH-015", tutorId: "T-207", subject: "SSC Exam Preparation", grade: "10th Class", day: "Saturday", startTime: "09:00 AM", endTime: "11:00 AM", mode: "Offline", room: "Room 201", assignedStudentIds: ["ST-110", "ST-111", "ST-112"] },
  { scheduleId: "SCH-016", tutorId: "T-207", subject: "Olympiad Preparation", grade: "9th Class", day: "Saturday", startTime: "11:30 AM", endTime: "01:00 PM", mode: "Online", room: "Zoom Link E", assignedStudentIds: ["ST-110", "ST-111"] },
];

const seedAllData = async () => {
  // ── 1. Seed Tutor Users + Tutor Profiles ──
  for (const t of TUTORS_SEED) {
    let userDoc = await User.findOne({ email: t.email, role: "tutor" });
    if (!userDoc) {
      const hashed = await bcrypt.hash("password", 10);
      userDoc = await User.create({ email: t.email, password: hashed, role: "tutor" });
      console.log(`✅ Created tutor user: ${t.email}`);
    }
    const existingTutor = await Tutor.findOne({ tutorId: t.tutorId });
    if (!existingTutor) {
      await Tutor.create({
        tutorId: t.tutorId,
        userId: userDoc._id,
        name: t.name,
        specialty: t.specialty,
        qualification: t.qualification,
        experience: t.experience,
        phone: t.phone,
        email: t.email,
        image: t.image,
        assignedStudentIds: t.assignedStudentIds,
        subjects: t.subjects,
        pendingTasksCount: t.pendingTasksCount,
      });
      console.log(`✅ Created tutor profile: ${t.name} (${t.tutorId})`);
    }
  }

  // ── 2. Seed Student Users + Student Profiles ──
  for (const s of STUDENTS_SEED) {
    let userDoc = await User.findOne({ email: s.email, role: "student" });
    if (!userDoc) {
      const hashed = await bcrypt.hash("password", 10);
      userDoc = await User.create({ email: s.email, password: hashed, role: "student" });
      console.log(`✅ Created student user: ${s.email}`);
    }
    const existingStudent = await Student.findOne({ studentId: s.studentId });
    if (!existingStudent) {
      await Student.create({
        studentId: s.studentId,
        userId: userDoc._id,
        name: s.name,
        grade: s.grade,
        section: s.section,
        parentEmail: s.parentEmail,
        assignedTutorIds: s.assignedTutorIds,
        learningSubjects: s.learningSubjects,
        phone: s.phone,
        dateOfBirth: s.dateOfBirth,
        address: s.address,
        attendanceRate: s.attendanceRate,
        presentCount: s.presentCount,
        absentCount: s.absentCount,
      });
      console.log(`✅ Created student profile: ${s.name} (${s.studentId})`);
    }
  }

  // ── 3. Seed Parent Users + Parent Profiles ──
  for (const p of PARENTS_SEED) {
    let userDoc = await User.findOne({ email: p.email, role: "parent" });
    if (!userDoc) {
      const hashed = await bcrypt.hash("Password@123", 10);
      userDoc = await User.create({ email: p.email, password: hashed, role: "parent" });
      console.log(`✅ Created parent user: ${p.email}`);
    }
    const existingParent = await Parent.findOne({ email: p.email });
    if (!existingParent) {
      await Parent.create({
        userId: userDoc._id,
        email: p.email,
        name: p.name,
        phone: p.phone,
        address: p.address,
        occupation: p.occupation,
        childrenIds: p.childrenIds,
      });
      console.log(`✅ Created parent profile: ${p.name}`);
    }
  }

  // ── 4. Seed Admin User ──
  const adminEmail = config.adminEmail || "admin@academyflow.com";
  let adminUser = await User.findOne({ email: adminEmail, role: "admin" });
  if (!adminUser) {
    const hashed = await bcrypt.hash(config.adminPassword || "Admin@123", 10);
    await User.create({ email: adminEmail, password: hashed, role: "admin" });
    console.log(`✅ Created admin user: ${adminEmail}`);
  }

  // ── 5. Seed Timetable ──
  for (const sch of TIMETABLE_SEED) {
    const existing = await Timetable.findOne({ scheduleId: sch.scheduleId });
    if (!existing) {
      const tutor = await Tutor.findOne({ tutorId: sch.tutorId });
      if (tutor) {
        await Timetable.create({
          ...sch,
          tutorName: tutor.name,
          isActive: true,
        });
        console.log(`✅ Created schedule: ${sch.scheduleId} — ${sch.subject} (${sch.tutorId})`);
      }
    }
  }

  console.log("\n🎓 All seed data loaded successfully!\n");

  // ── 6. Seed Catalog (subjects, standards, locations) ──
  const catalogCount = await Catalog.countDocuments();
  if (catalogCount === 0) {
    const subjectsByClass = {
      "1st Class": ["Mathematics", "Environmental Studies", "English", "Telugu", "Hindi"],
      "2nd Class": ["Mathematics", "Environmental Studies", "English", "Telugu", "Hindi"],
      "3rd Class": ["Mathematics", "Environmental Studies", "English", "Telugu", "Hindi"],
      "4th Class": ["Mathematics", "Environmental Studies", "English", "Telugu", "Hindi"],
      "5th Class": ["Mathematics", "General Science", "English", "Social Studies", "Telugu", "Hindi"],
      "6th Class": ["Mathematics", "General Science", "English", "Social Studies", "Telugu", "Hindi"],
      "7th Class": ["Mathematics", "General Science", "English", "Social Studies", "Telugu", "Hindi"],
      "8th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Studies"],
      "9th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
      "10th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
    };

    for (const [className, subjects] of Object.entries(subjectsByClass)) {
      await Catalog.create({ type: "subjects_by_class", key: className, values: subjects });
    }
    await Catalog.create({ type: "standards", key: null, values: [
      "1st Class", "2nd Class", "3rd Class", "4th Class", "5th Class",
      "6th Class", "7th Class", "8th Class", "9th Class", "10th Class",
    ]});
    await Catalog.create({ type: "locations", key: null, values: ["Hyderabad", "Warangal", "Karimnagar"] });
    await Catalog.create({ type: "class_types", key: null, values: ["Online", "Offline"] });
    await Catalog.create({ type: "languages", key: null, values: ["English", "Telugu", "Hindi"] });
    console.log("✅ Catalog data seeded");
  }
};

// Connect to MongoDB and Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedAllData();
    const activePort = await listenWithPortFallback(config.port);
    printStartupBanner(activePort);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
