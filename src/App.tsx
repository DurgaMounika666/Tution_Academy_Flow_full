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
import { Student, Tutor, FeePayment, Assignment, Review, Message, TestScore, RegistrationNotification } from "./types";

type UserRole = "student" | "parent" | "tutor" | "admin";

const SESSION_ROLE_KEY = "academyflow_session_role";
const SESSION_USER_KEY = "academyflow_session_user";
const REGISTRATION_NOTIFICATIONS_KEY = "academyflow_registration_notifications";

const roleDashboardPath = (role: UserRole | null) => (role ? `/${role}` : "/login");

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

  const [activeStudentId, setActiveStudentId] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(SESSION_ROLE_KEY) === "student"
      ? localStorage.getItem(SESSION_USER_KEY) || ""
      : ""
  );
  const [activeParentEmail, setActiveParentEmail] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(SESSION_ROLE_KEY) === "parent"
      ? localStorage.getItem(SESSION_USER_KEY) || ""
      : ""
  );
  const [activeTutorId, setActiveTutorId] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(SESSION_ROLE_KEY) === "tutor"
      ? localStorage.getItem(SESSION_USER_KEY) || ""
      : ""
  );
  const [loggedInRole, setLoggedInRole] = useState<UserRole | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(SESSION_ROLE_KEY);
    return ["student", "parent", "tutor", "admin"].includes(stored || "") ? stored as UserRole : null;
  });

  const [activeStandard, setActiveStandard] = useState("9th Class");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [demoBookingOpen, setDemoBookingOpen] = useState(false);
  const [registrationNotifications, setRegistrationNotifications] = useState<RegistrationNotification[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(REGISTRATION_NOTIFICATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  const loadRegistrations = useCallback(async () => {
    try {
      const response = await apiClient.registrations.getAll();
      const mapped: RegistrationNotification[] = response.map((reg: any) => ({
        id: reg._id || reg.id,
        name: reg.parentName || reg.name,
        role: "Parent",
        email: reg.email,
        mobileNumber: reg.phone || reg.mobileNumber || "",
        studentClass: reg.classGrade || reg.studentClass || "",
        registrationDateTime: reg.createdAt
          ? new Date(reg.createdAt).toLocaleString()
          : reg.registrationDateTime || "",
        status: reg.registrationStatus === "Pending Approval"
          ? "Pending"
          : reg.registrationStatus === "Approved"
            ? "Accepted"
            : reg.registrationStatus === "Rejected"
              ? "Rejected"
              : "Pending",
      }));
      setRegistrationNotifications(mapped);
    } catch (error) {
      console.warn("Unable to load registrations", error);
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    await Promise.all([loadAllStudents(), loadTutors(), loadAllFees(), loadRegistrations()]);
  }, [loadAllStudents, loadTutors, loadAllFees, loadRegistrations]);

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

  useEffect(() => {
    localStorage.setItem(REGISTRATION_NOTIFICATIONS_KEY, JSON.stringify(registrationNotifications));
  }, [registrationNotifications]);

  const persistSession = (role: UserRole, userId?: string) => {
    localStorage.setItem(SESSION_ROLE_KEY, role);
    localStorage.setItem(SESSION_USER_KEY, userId || role);
    setLoggedInRole(role);
  };

  const handleRegisterSuccess = async (notification: Omit<RegistrationNotification, "status">) => {
    const createdNotification: RegistrationNotification = {
      ...notification,
      status: "Pending",
    };
    setRegistrationNotifications((prev) => [createdNotification, ...prev]);
    await fetchParentData(notification.email);
  };

  const handleLoginSuccess = async (
    role: UserRole,
    userId?: string
  ) => {
    persistSession(role, userId);

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
      persistSession("student", studentsState[0].id);
    } else if (role === "parent" && studentsState[0]) {
      setActiveParentEmail(studentsState[0].parentEmail);
      setActiveStudentId(studentsState[0].id);
      persistSession("parent", studentsState[0].parentEmail);
    } else if (role === "tutor" && tutorsState[0]) {
      setActiveTutorId(tutorsState[0].id);
      persistSession("tutor", tutorsState[0].id);
    }
    navigate(`/${role}`);
  };

  const handleLogout = () => {
    apiClient.clearAuthToken();
    localStorage.removeItem(SESSION_ROLE_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
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

  const handleRegistrationDecision = async (id: string, status: "Accepted" | "Rejected") => {
    try {
      // Map frontend status terms to backend API terms
      const apiStatus = status === "Accepted" ? "Approved" : "Rejected";
      await apiClient.registrations.updateStatus(id, apiStatus);

      setRegistrationNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, status } : notification
        )
      );

      // Refresh students and fees data after approval creates new records
      if (status === "Accepted") {
        await loadAllStudents();
        await loadAllFees();
      }
    } catch (error: any) {
      console.error("Registration decision failed:", error.message);
    }
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

  useEffect(() => {
    const restoreSessionData = async () => {
      if (loggedInRole === "student" && activeStudentId && studentsState.length === 0) {
        const student = await fetchStudentById(activeStudentId);
        if (student) {
          setStudentsState([student]);
          await Promise.all([fetchFeesForStudent(student.id), loadTutors()]);
        }
      } else if (loggedInRole === "parent" && activeParentEmail && studentsState.length === 0) {
        await fetchParentData(activeParentEmail);
      } else if (loggedInRole === "tutor" && activeTutorId && tutorsState.length === 0) {
        await fetchTutorData(activeTutorId);
      } else if (loggedInRole === "admin" && studentsState.length === 0 && tutorsState.length === 0) {
        await loadAdminData();
      }
    };

    restoreSessionData();
  }, [loggedInRole]);

  useEffect(() => {
    if (loggedInRole !== "student") return;

    let inactivityTimer: ReturnType<typeof setTimeout>;
    const expireStudentSession = () => {
      window.alert("Your student session expired after 5 minutes of inactivity.");
      handleLogout();
    };
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(expireStudentSession, 5 * 60 * 1000);
    };
    const activityEvents = ["click", "keydown", "scroll", "pointerdown", "mousemove", "touchstart"];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [loggedInRole]);

  const renderProtectedDashboard = (role: UserRole, element: React.ReactElement) => {
    if (loggedInRole !== role) {
      return <Navigate to={roleDashboardPath(loggedInRole)} replace />;
    }

    return element;
  };

  return (
    <ThemeProvider>
      <ScrollToTop />
      <div className={`site-interactive flex flex-col bg-slate-50 text-slate-800 dark:bg-[#0b1329] dark:text-slate-100 transition-colors duration-300 ${isDashboardRoute ? "h-screen overflow-hidden" : "min-h-screen"}`}>

        <Navbar
          onOpenRegister={() => setRegisterOpen(true)}
          activeStandard={activeStandard}
          onSelectStandard={setActiveStandard}
          loggedInRole={loggedInRole}
        />
        <div className="h-16" />

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
              loggedInRole ? (
                <Navigate to={roleDashboardPath(loggedInRole)} replace />
              ) : (
                <LoginGateway
                  onLoginSuccess={handleLoginSuccess}
                  onOpenRegister={() => setRegisterOpen(true)}
                />
              )
            } />

            <Route path="/classes/:type" element={<ClassInfo />} />

            <Route path="/student" element={
              renderProtectedDashboard("student", currentStudent ? (
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
              ))
            } />

            <Route path="/parent" element={
              renderProtectedDashboard("parent", studentsState.length > 0 ? (
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
              ))
            } />

            <Route path="/tutor" element={
              renderProtectedDashboard("tutor", currentTutor ? (
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
              ))
            } />

            <Route path="/admin" element={
              renderProtectedDashboard("admin", (
                <AdminDashboard
                  key="admin-dashboard"
                  students={studentsState}
                  tutors={tutorsState}
                  fees={feesState}
                  registrationNotifications={registrationNotifications}
                  onRegistrationDecision={handleRegistrationDecision}
                  onRefreshStudents={refreshStudents}
                  onRefreshTutors={refreshTutors}
                  onRefreshFees={refreshFees}
                  onBypassLogin={handleBypassLogin}
                  onLogout={handleLogout}
                />
              ))
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
          initialClass={activeStandard}
        />

      </div>
    </ThemeProvider>
  );
}
