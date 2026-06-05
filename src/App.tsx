/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
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
import { ClassInfo } from "./components/ClassInfo";
import { ChatSupportWidget } from "./components/ChatSupportWidget";
import { DemoBookingModal } from "./components/DemoBookingModal";
import { ScrollToTop } from "./components/ScrollToTop";
import { useLanguage } from "./context/LanguageContext";
import {
  INITIAL_ASSIGNMENTS, INITIAL_REVIEWS, INITIAL_MESSAGES, INITIAL_TESTS,
} from "./data";
import {
  normalizeStudent, normalizeTutor, normalizeFee, normalizeAssignment,
} from "./utils/normalizers";
import { Student, Tutor, FeePayment, Assignment, Review, Message, TestScore } from "./types";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLanguage } = useLanguage();

  const [studentsState, setStudentsState] = useState<Student[]>([]);
  const [tutorsState, setTutorsState] = useState<Tutor[]>([]);
  const [feesState, setFeesState] = useState<FeePayment[]>([]);
  const [assignmentsState, setAssignmentsState] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [reviewsState] = useState<Review[]>(INITIAL_REVIEWS);
  const [messagesState, setMessagesState] = useState<Message[]>(INITIAL_MESSAGES);
  const [testsState, setTestsState] = useState<TestScore[]>(INITIAL_TESTS);

  const [activeStudentId, setActiveStudentId] = useState("");
  const [activeParentEmail, setActiveParentEmail] = useState("");
  const [activeTutorId, setActiveTutorId] = useState("");
  const [loggedInRole, setLoggedInRole] = useState<"student" | "parent" | "tutor" | "admin" | null>(null);

  const [activeStandard, setActiveStandard] = useState("9th Class");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [demoBookingOpen, setDemoBookingOpen] = useState(false);
  const [registeredParents, setRegisteredParents] = useState<Array<{ email: string; pass: string }>>([]);

  const loadTutors = useCallback(async () => {
    try {
      const response = await apiClient.tutors.getAll();
      setTutorsState(response.map(normalizeTutor));
    } catch (error) {
      console.warn("Unable to load tutors", error);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/login" && tutorsState.length === 0) {
      loadTutors();
    }
  }, [location.pathname, tutorsState.length, loadTutors]);

  const loadAllFees = useCallback(async () => {
    try {
      const response = await apiClient.fees.getAll();
      setFeesState(response.map(normalizeFee));
    } catch (error) {
      console.warn("Unable to load fees", error);
    }
  }, []);

  const loadAllStudents = useCallback(async () => {
    try {
      const response = await apiClient.students.getAll();
      setStudentsState(response.map(normalizeStudent));
    } catch (error) {
      console.warn("Unable to load students", error);
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    await Promise.all([loadAllStudents(), loadTutors(), loadAllFees()]);
  }, [loadAllStudents, loadTutors, loadAllFees]);

  const fetchStudentById = async (studentId: string) => {
    try {
      const response = await apiClient.students.getById(studentId);
      return normalizeStudent(response);
    } catch (error) {
      console.warn("Unable to fetch student by id", error);
      return null;
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

  const fetchParentData = async (parentEmail: string) => {
    try {
      const [studentsRes] = await Promise.all([
        apiClient.students.getByParent(parentEmail),
        loadTutors(),
      ]);
      const normalized = studentsRes.map(normalizeStudent);
      setStudentsState(normalized);
      if (normalized[0]?.id) {
        setActiveStudentId(normalized[0].id);
        await fetchFeesForStudent(normalized[0].id);
      }
    } catch (error) {
      console.warn("Unable to load parent students", error);
    }
  };

  const fetchTutorData = async (tutorId: string) => {
    try {
      const [tutorRes, studentsRes] = await Promise.all([
        apiClient.tutors.getById(tutorId),
        apiClient.students.getByTutor(tutorId),
      ]);
      setTutorsState([normalizeTutor(tutorRes)]);
      setStudentsState(studentsRes.map(normalizeStudent));
      await fetchTutorAssignments(tutorId);
    } catch (error) {
      console.warn("Unable to load tutor data", error);
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

  const handleRegisterSuccess = async (email: string, pass: string) => {
    setRegisteredParents((prev) => [...prev, { email, pass }]);
    await fetchParentData(email);
  };

  const handleLoginSuccess = async (
    role: "student" | "parent" | "tutor" | "admin",
    userId?: string
  ) => {
    setLoggedInRole(role);

    if (role === "student" && userId) {
      setActiveStudentId(userId);
      const student = await fetchStudentById(userId);
      if (student) {
        setStudentsState([student]);
        await Promise.all([fetchFeesForStudent(student.id), loadTutors()]);
      }
      navigate("/student");
    } else if (role === "parent" && userId) {
      setActiveParentEmail(userId);
      await fetchParentData(userId);
      navigate("/parent");
    } else if (role === "tutor" && userId) {
      setActiveTutorId(userId);
      await fetchTutorData(userId);
      navigate("/tutor");
    } else if (role === "admin") {
      await loadAdminData();
      navigate("/admin");
    } else {
      navigate(`/${role}`);
    }
  };

  const handleBypassLogin = async (role: "student" | "parent" | "tutor") => {
    if (role === "student" && studentsState[0]) {
      setActiveStudentId(studentsState[0].id);
    } else if (role === "parent" && studentsState[0]) {
      setActiveParentEmail(studentsState[0].parentEmail);
      setActiveStudentId(studentsState[0].id);
    }
    navigate(`/${role}`);
  };

  const handleLogout = () => {
    apiClient.clearAuthToken();
    setLoggedInRole(null);
    setStudentsState([]);
    setTutorsState([]);
    setFeesState([]);
    setAssignmentsState([]);
    setActiveStudentId("");
    setActiveParentEmail("");
    setActiveTutorId("");
    setLanguage("English");
    navigate("/login");
  };

  const refreshStudents = async () => {
    if (loggedInRole === "admin") {
      await loadAllStudents();
    } else if (loggedInRole === "parent" && activeParentEmail) {
      await fetchParentData(activeParentEmail);
    } else if (loggedInRole === "tutor" && activeTutorId) {
      await fetchTutorData(activeTutorId);
    }
  };

  const refreshTutors = async () => {
    await loadTutors();
  };

  const refreshFees = async () => {
    if (loggedInRole === "admin") {
      await loadAllFees();
    } else if (activeStudentId) {
      await fetchFeesForStudent(activeStudentId);
    }
  };

  const currentStudent = studentsState.find((s) => s.id === activeStudentId) || studentsState[0];
  const currentTutor = tutorsState.find((t) => t.id === activeTutorId) || tutorsState[0];
  const isDashboardRoute = ["/student", "/parent", "/tutor", "/admin"].includes(location.pathname);

  return (
    <ThemeProvider>
      <ScrollToTop />
      <div className={`site-interactive flex flex-col bg-slate-50 text-slate-800 dark:bg-[#0b1329] dark:text-slate-100 transition-colors duration-300 ${isDashboardRoute ? "h-screen overflow-hidden" : "min-h-screen"}`}>

        <Navbar
          onOpenRegister={() => setRegisterOpen(true)}
          activeStandard={activeStandard}
          onSelectStandard={setActiveStandard}
        />

        <main className={isDashboardRoute ? "flex-1 min-h-0 overflow-hidden" : "flex-grow"}>
          <Routes>
            <Route path="/" element={
              <div className="animate-fade-in">
                <Hero
                  onRoleChange={(role) => navigate(role === "login_select" ? "/login" : role === "parent" ? "/parent" : "/")}
                  onOpenDemo={() => setDemoBookingOpen(true)}
                  selectedStandard={activeStandard}
                  onSelectStandard={setActiveStandard}
                />
                <WhyChooseUs />
                <Reviews />
              </div>
            } />

            <Route path="/login" element={
              <LoginGateway
                onLoginSuccess={handleLoginSuccess}
                onOpenRegister={() => setRegisterOpen(true)}
              />
            } />

            <Route path="/classes/:type" element={<ClassInfo />} />

            <Route path="/student" element={
              currentStudent ? (
                <StudentDashboard
                  key={`student-${activeStudentId}`}
                  currentStudent={currentStudent}
                  tutors={tutorsState}
                  onLogout={handleLogout}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Please log in as a student to view your dashboard.
                </div>
              )
            } />

            <Route path="/parent" element={
              studentsState.length > 0 ? (
                <ParentDashboard
                  key={`parent-${activeParentEmail}`}
                  students={studentsState}
                  tutors={tutorsState}
                  fees={feesState}
                  onUpdateFees={setFeesState}
                  onUpdateStudents={setStudentsState}
                  onRefreshFees={refreshFees}
                  onLogout={handleLogout}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Please log in as a parent to view your dashboard.
                </div>
              )
            } />

            <Route path="/tutor" element={
              currentTutor ? (
                <TutorDashboard
                  key={`tutor-${activeTutorId}`}
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
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Please log in as a tutor to view your dashboard.
                </div>
              )
            } />

            <Route path="/admin" element={
              <AdminDashboard
                key="admin-dashboard"
                students={studentsState}
                tutors={tutorsState}
                fees={feesState}
                onRefreshStudents={refreshStudents}
                onRefreshTutors={refreshTutors}
                onRefreshFees={refreshFees}
                onBypassLogin={handleBypassLogin}
                onLogout={handleLogout}
              />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {!isDashboardRoute && <Footer />}
        <ChatSupportWidget />

        <RegisterModal
          isOpen={registerOpen}
          onClose={() => setRegisterOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
        <DemoBookingModal
          isOpen={demoBookingOpen}
          onClose={() => setDemoBookingOpen(false)}
        />

      </div>
    </ThemeProvider>
  );
}
