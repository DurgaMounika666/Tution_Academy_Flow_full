/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { apiClient } from "./services/apiClient";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { WhyChooseUs } from "./components/WhyChooseUs";
import { Reviews } from "./components/Reviews";
import { Footer } from "./components/Footer";
import { LoginGateway } from "./components/LoginGateway";
import { StudentDashboard } from "./components/StudentDashboard";
import { ParentDashboard } from "./components/ParentDashboard";
import { TutorDashboard } from "./components/TutorDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { RegisterModal } from "./components/RegisterModal";

import {
  INITIAL_STUDENTS, INITIAL_TUTORS, INITIAL_FEES, INITIAL_ASSIGNMENTS,
  INITIAL_REVIEWS, INITIAL_MESSAGES, INITIAL_TESTS
} from "./data";
import { Student, Tutor, FeePayment, Assignment, Review, Message, TestScore } from "./types";

export default function App() {
  const navigate = useNavigate();

  // Global Memory state allowing bidirectional edits in-sandbox
  const [studentsState, setStudentsState] = useState<Student[]>(INITIAL_STUDENTS);
  const [tutorsState, setTutorsState] = useState<Tutor[]>(INITIAL_TUTORS);
  const [feesState, setFeesState] = useState<FeePayment[]>(INITIAL_FEES);
  const [assignmentsState, setAssignmentsState] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [reviewsState] = useState<Review[]>(INITIAL_REVIEWS);
  const [messagesState, setMessagesState] = useState<Message[]>(INITIAL_MESSAGES);
  const [testsState, setTestsState] = useState<TestScore[]>(INITIAL_TESTS);

  // Authentication Context trackers
  const [activeStudentId, setActiveStudentId] = useState("ST-101");
  const [activeParentEmail, setActiveParentEmail] = useState("parent@example.com");
  const [activeTutorId, setActiveTutorId] = useState("T-201");
  const [loggedInRole, setLoggedInRole] = useState<"student" | "parent" | "tutor" | "admin" | null>(null);

  // Standard dropdown selections state from Navbar/Hero
  const [activeStandard, setActiveStandard] = useState("9th Class");

  // Registration states
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registeredParents, setRegisteredParents] = useState<Array<{ email: string; pass: string }>>([]);

  const normalizeStudent = (apiStudent: any): Student => ({
    id: apiStudent.studentId || apiStudent._id || apiStudent.id || "",
    name: apiStudent.name || "Student",
    grade: apiStudent.grade || "9th Class",
    section: apiStudent.section || "Section A",
    attendanceRate: apiStudent.attendanceRate ?? 100,
    presentCount: apiStudent.presentCount ?? 0,
    absentCount: apiStudent.absentCount ?? 0,
    learningSubjects: (apiStudent.learningSubjects || []).map((name: string) => ({
      name,
      completedPercentage: 0,
      completedWeeks: 0
    })),
    results: (apiStudent.results || []).map((result: any) => ({
      term: result.term || "Current",
      gpa: result.gpa ?? 4.0,
      score: result.score ?? 100,
      mathsScore: result.mathsScore ?? 95,
      physicsScore: result.physicsScore ?? 92,
      literatureScore: result.literatureScore ?? 93,
      compSciScore: result.compSciScore ?? 91
    })),
    classTimings: apiStudent.classTimings?.length ? apiStudent.classTimings : [{
      subject: "Student Support",
      time: "09:00 AM",
      day: "Mon, Wed",
      mode: "Hybrid"
    }],
    upcomingEvents: apiStudent.upcomingEvents || [],
    videoResources: apiStudent.videoResources || [],
    parentEmail: apiStudent.parentEmail || "",
    assignedTutorIds: apiStudent.assignedTutorIds || []
  });

  const normalizeFee = (apiFee: any): FeePayment => ({
    id: apiFee.feeId || apiFee._id || apiFee.id || "",
    studentId: apiFee.studentId || "",
    studentName: apiFee.studentName || "",
    title: apiFee.title || "Outstanding Fee",
    amount: apiFee.amount ?? 0,
    status: apiFee.status || "Pending",
    dueDate: apiFee.dueDate || new Date().toISOString().split("T")[0],
    transactionId: apiFee.transactionId
  });

  const normalizeAssignment = (apiAssignment: any): Assignment => ({
    id: apiAssignment.assignmentId || apiAssignment._id || apiAssignment.id || "",
    title: apiAssignment.title || "New Assignment",
    subject: apiAssignment.subject || "General",
    dueDate: apiAssignment.dueDate || new Date().toISOString().split("T")[0],
    submissionsPending: apiAssignment.submissionsPending ?? 0,
    status: apiAssignment.status || "Active"
  });

  const fetchStudentById = async (studentId: string) => {
    try {
      const response = await apiClient.students.getById(studentId);
      return normalizeStudent(response);
    } catch (error) {
      console.warn("Unable to fetch student by id", error);
      return null;
    }
  };

  const fetchParentData = async (parentEmail: string) => {
    try {
      const response = await apiClient.students.getByParent(parentEmail);
      const normalized = response.map(normalizeStudent);
      setStudentsState(normalized.length ? normalized : INITIAL_STUDENTS);
      if (normalized[0]?.id) {
        await fetchFeesForStudent(normalized[0].id);
      }
    } catch (error) {
      console.warn("Unable to load parent students", error);
    }
  };

  const fetchFeesForStudent = async (studentId: string) => {
    try {
      const response = await apiClient.fees.getByStudent(studentId);
      setFeesState(response.map(normalizeFee));
    } catch (error) {
      console.warn("Unable to load fees for student", error);
    }
  };

  const fetchTutorAssignments = async (tutorId: string) => {
    try {
      const response = await apiClient.attendance.getAssignmentsByTutor(tutorId);
      setAssignmentsState(response.map(normalizeAssignment));
    } catch (error) {
      console.warn("Unable to load tutor assignments", error);
    }
  };

  const handleRegisterSuccess = (email: string, pass: string, childName: string, childGrade: string) => {
    setRegisteredParents([...registeredParents, { email, pass }]);

    const nextId = `ST-${100 + studentsState.length + 1}`;
    const newStudent: Student = {
      id: nextId,
      name: childName,
      grade: childGrade,
      section: "Section A",
      attendanceRate: 100,
      presentCount: 12,
      absentCount: 0,
      learningSubjects: [
        { name: "Basic Mathematics", completedPercentage: 0, completedWeeks: 0 }
      ],
      results: [
        { term: "Current", gpa: 4.0, score: 100, mathsScore: 100, physicsScore: 95, literatureScore: 98, compSciScore: 97 }
      ] as any,
      classTimings: [
        { subject: "Basic Mathematics", time: "10:30 AM", day: "Monday, Wednesday", mode: "Online" }
      ],
      upcomingEvents: [
        { title: "Syllabus Diagnostic Assessment", time: "Next Monday", description: "Standard induction test.", badge: "Diagnostic" }
      ],
      videoResources: [],
      parentEmail: email,
      assignedTutorIds: ["T-201"]
    };

    setStudentsState([...studentsState, newStudent]);

    const nextFeeId = `FP-${500 + feesState.length + 1}`;
    const newFee: FeePayment = {
      id: nextFeeId,
      studentId: nextId,
      studentName: childName,
      title: "Enrollment & Registration Fee",
      amount: 150,
      status: "Pending",
      dueDate: "2026-06-30"
    };

    setFeesState([newFee, ...feesState]);
  };

  const handleLoginSuccess = async (
    role: "student" | "parent" | "tutor" | "admin",
    userId?: string
  ) => {
    if (role === "student" && userId) {
      setLoggedInRole("student");
      setActiveStudentId(userId);
      const student = await fetchStudentById(userId);
      if (student) {
        setStudentsState([student]);
        await fetchFeesForStudent(student.id);
      }
      navigate("/student");
    } else if (role === "parent" && userId) {
      setLoggedInRole("parent");
      setActiveParentEmail(userId);
      await fetchParentData(userId);
      navigate("/parent");
    } else if (role === "tutor" && userId) {
      setLoggedInRole("tutor");
      setActiveTutorId(userId);
      await fetchTutorAssignments(userId);
      navigate("/tutor");
    } else if (role === "admin") {
      setLoggedInRole("admin");
      navigate("/admin");
    } else {
      navigate(`/${role}`);
    }
  };

  const handleBypassLogin = (role: "student" | "parent" | "tutor") => {
    if (role === "student") {
      setActiveStudentId("ST-101");
    } else if (role === "parent") {
      setActiveParentEmail("parent@example.com");
      setActiveStudentId("ST-102"); // Mrs. Henderson child (Leo)
    }
    navigate(`/${role}`);
  };

  const handleLogout = () => {
    apiClient.clearAuthToken();
    setLoggedInRole(null);
    navigate("/login");
  };

  // Get matching current logged in Student
  const currentStudent = studentsState.find((s) => s.id === activeStudentId) || studentsState[0];
  const currentTutor = tutorsState.find((t) => t.id === activeTutorId) || tutorsState[0];

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-[#0b1329] dark:text-slate-100 transition-colors duration-300">

        {/* Sticky Global Top Header */}
        <Navbar
          onOpenRegister={() => setRegisterOpen(true)}
          activeStandard={activeStandard}
          onSelectStandard={setActiveStandard}
        />

        {/* Dynamic Route Rendering Grid with Fade transitions */}
        <main className="flex-grow">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={
              <div className="animate-fade-in">
                <Hero
                  onRoleChange={(role) => navigate(role === "login_select" ? "/login" : role === "parent" ? "/parent" : "/")}
                  selectedStandard={activeStandard}
                  onSelectStandard={setActiveStandard}
                />
                <WhyChooseUs />
                <Reviews />
              </div>
            } />

            {/* Login Gateway */}
            <Route path="/login" element={
              <LoginGateway
                onLoginSuccess={handleLoginSuccess}
                onOpenRegister={() => setRegisterOpen(true)}
                registeredParents={registeredParents}
                tutors={tutorsState}
              />
            } />

            {/* Student Dashboard */}
            <Route path="/student" element={
              <StudentDashboard
                currentStudent={currentStudent}
                onLogout={handleLogout}
              />
            } />

            {/* Parent Dashboard */}
            <Route path="/parent" element={
              <ParentDashboard
                students={studentsState}
                tutors={tutorsState}
                fees={feesState}
                onUpdateFees={setFeesState}
                onUpdateStudents={setStudentsState}
                onLogout={handleLogout}
              />
            } />

            {/* Tutor Dashboard */}
            <Route path="/tutor" element={
              <TutorDashboard
                currentTutor={currentTutor}
                students={studentsState}
                assignments={assignmentsState}
                reviews={reviewsState}
                messages={messagesState}
                tests={testsState}
                onUpdateStudents={setStudentsState}
                onUpdateAssignments={setAssignmentsState}
                onUpdateMessages={setMessagesState}
                onUpdateTests={setTestsState}
                onLogout={handleLogout}
              />
            } />

            {/* Admin Dashboard */}
            <Route path="/admin" element={
              <AdminDashboard
                students={studentsState}
                tutors={tutorsState}
                fees={feesState}
                onBypassLogin={handleBypassLogin}
                onLogout={handleLogout}
              />
            } />

            {/* Catch-all: redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer info bar layout */}
        <Footer />

        {/* Dynamic Modal Registrations */}
        <RegisterModal
          isOpen={registerOpen}
          onClose={() => setRegisterOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />

      </div>
    </ThemeProvider>
  );
}