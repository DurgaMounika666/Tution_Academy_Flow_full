/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
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
// Registration notifications are loaded exclusively from the backend API (MongoDB)

const roleDashboardPath = (role: UserRole | null) => (role ? `/${role}` : "/login");

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLanguage } = useLanguage();

  const [studentsState, setStudentsState] = useState<Student[]>([]);
  const [tutorsState, setTutorsState] = useState<Tutor[]>([]);
  const [feesState, setFeesState] = useState<FeePayment[]>([]);
  const [assignmentsState, setAssignmentsState] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [reviewsState, setReviewsState] = useState<Review[]>(INITIAL_REVIEWS);
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
  const [isLoadingData, setIsLoadingData] = useState(false);
  const restoredRoleRef = useRef<UserRole | null>(null);

  const [activeStandard, setActiveStandard] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [demoBookingOpen, setDemoBookingOpen] = useState(false);
  const [registrationNotifications, setRegistrationNotifications] = useState<RegistrationNotification[]>([]);

  const enrichStudentData = async (student: Student): Promise<Student> => {
    try {
      const [resultsRes, timetableRes] = await Promise.all([
        apiClient.results.getByStudent(student.id).catch(() => []),
        apiClient.timetable.getByStudent(student.id).catch(() => []),
      ]);
      
      const enrichedResults = (resultsRes || []).map((r: any) => ({
        term: r.term || "Current Evaluation",
        gpa: r.gpa ?? 4.0,
        score: r.score ?? 100,
        mathsScore: r.mathsScore ?? 95,
        physicsScore: r.physicsScore ?? 92,
        literatureScore: r.literatureScore ?? 93,
        compSciScore: r.compSciScore ?? 91,
      }));

      const classTimings = (Array.isArray(timetableRes) && timetableRes.length > 0)
        ? timetableRes.map((t: any) => ({
            subject: t.subject,
            time: `${t.startTime} - ${t.endTime}`,
            day: t.day,
            mode: t.mode,
          }))
        : student.classTimings;

      return {
        ...student,
        results: enrichedResults.length > 0 ? enrichedResults : student.results,
        classTimings,
      };
    } catch (error) {
      console.warn(`Unable to enrich student data for ${student.id}`, error);
      return student;
    }
  };

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
      const normalized = response.map(normalizeStudent);
      const enriched = await Promise.all(normalized.map(enrichStudentData));
      setStudentsState(enriched);
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
      const student = normalizeStudent(response);
      return await enrichStudentData(student);
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
      const enriched = await Promise.all(normalized.map(enrichStudentData));
      setStudentsState(enriched);
      if (enriched[0]?.id) {
        setActiveStudentId(enriched[0].id);
        await fetchFeesForStudent(enriched[0].id);
      }
    } catch (error) {
      console.warn("Unable to load parent students", error);
    }
  };

  const fetchTutorReviews = async (tutorId: string) => {
    try {
      const response = await apiClient.reviews.getByTutor(tutorId);
      // Map review list to reviews type
      const reviews = response.map((r: any) => ({
        id: r.reviewId || r._id || r.id,
        studentId: r.studentId || "",
        studentName: r.studentName || "Student",
        rating: r.rating || 5,
        comment: r.comment || "",
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent",
      }));
      setReviewsState(reviews);
    } catch (error) {
      console.warn("Unable to load tutor reviews", error);
    }
  };

  const fetchTutorData = async (tutorId: string) => {
    try {
      const [tutorRes, studentsRes] = await Promise.all([
        apiClient.tutors.getById(tutorId),
        apiClient.students.getByTutor(tutorId),
      ]);
      setTutorsState([normalizeTutor(tutorRes)]);
      const normalized = studentsRes.map(normalizeStudent);
      const enriched = await Promise.all(normalized.map(enrichStudentData));
      setStudentsState(enriched);
      await Promise.all([
        fetchTutorAssignments(tutorId),
        fetchTutorReviews(tutorId),
      ]);
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

  // Registration notifications are persisted in MongoDB via the backend API
  // No localStorage sync needed — data loads via loadRegistrations()

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
    setIsLoadingData(true);
    try {
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
    } catch (error) {
      console.error("Login redirect handling failed", error);
    } finally {
      setIsLoadingData(false);
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
    restoredRoleRef.current = null;
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
    if (restoredRoleRef.current === loggedInRole) {
      return;
    }

    const restoreSessionData = async () => {
      const needsStudentLoad = loggedInRole === "student" && activeStudentId && studentsState.length === 0;
      const needsParentLoad = loggedInRole === "parent" && activeParentEmail && studentsState.length === 0;
      const needsTutorLoad = loggedInRole === "tutor" && activeTutorId && tutorsState.length === 0;
      const needsAdminLoad = loggedInRole === "admin" && studentsState.length === 0 && tutorsState.length === 0;

      if (!needsStudentLoad && !needsParentLoad && !needsTutorLoad && !needsAdminLoad) {
        return;
      }

      restoredRoleRef.current = loggedInRole;
      setIsLoadingData(true);
      try {
        if (needsStudentLoad) {
          const student = await fetchStudentById(activeStudentId);
          if (student) {
            setStudentsState([student]);
            await Promise.all([fetchFeesForStudent(student.id), loadTutors()]);
          }
        } else if (needsParentLoad) {
          await fetchParentData(activeParentEmail);
        } else if (needsTutorLoad) {
          await fetchTutorData(activeTutorId);
        } else if (needsAdminLoad) {
          await loadAdminData();
        }
      } catch (error) {
        console.error("Failed to restore session data", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    restoreSessionData();
  }, [loggedInRole, activeStudentId, activeParentEmail, activeTutorId, studentsState.length, tutorsState.length]);

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
          onLogout={loggedInRole ? handleLogout : undefined}
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
                  selectedLocation={activeLocation}
                  onSelectLocation={setActiveLocation}
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
              renderProtectedDashboard("student", isLoadingData ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center animate-fade-in">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading student dashboard...</p>
                </div>
              ) : currentStudent ? (
                <StudentDashboard
                  key={`student-${activeStudentId}`}
                  currentStudent={currentStudent}
                  tutors={tutorsState}
                  onLogout={handleLogout}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center max-w-md mx-auto animate-fade-in">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200/50 dark:border-amber-900/50">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Student Profile Not Found</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                    We couldn't retrieve the student profile for ID <span className="font-semibold">{activeStudentId || "unknown"}</span>. Please verify your connection or retry below.
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={async () => {
                        setIsLoadingData(true);
                        try {
                          const student = await fetchStudentById(activeStudentId);
                          if (student) {
                            setStudentsState([student]);
                            await Promise.all([fetchFeesForStudent(student.id), loadTutors()]);
                          }
                        } finally {
                          setIsLoadingData(false);
                        }
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                      Retry Connection
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-all duration-200"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ))
            } />

            <Route path="/parent" element={
              renderProtectedDashboard("parent", isLoadingData ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center animate-fade-in">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading parent portal...</p>
                </div>
              ) : studentsState.length > 0 ? (
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
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center max-w-md mx-auto animate-fade-in">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200/50 dark:border-amber-900/50">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">No Student Accounts Found</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                    We couldn't retrieve any student details associated with the parent account <span className="font-semibold">{activeParentEmail || "unknown"}</span>. This may happen if your registration is pending approval or if there is a connection issue.
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={async () => {
                        setIsLoadingData(true);
                        try {
                          await fetchParentData(activeParentEmail);
                        } finally {
                          setIsLoadingData(false);
                        }
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                      Retry Connection
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-all duration-200"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ))
            } />

            <Route path="/tutor" element={
              renderProtectedDashboard("tutor", isLoadingData ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center animate-fade-in">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading tutor dashboard...</p>
                </div>
              ) : currentTutor ? (
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
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center max-w-md mx-auto animate-fade-in">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200/50 dark:border-amber-900/50">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Tutor Profile Not Found</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                    We couldn't retrieve the tutor profile for ID <span className="font-semibold">{activeTutorId || "unknown"}</span>. Please verify your connection or retry below.
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={async () => {
                        setIsLoadingData(true);
                        try {
                          await fetchTutorData(activeTutorId);
                        } finally {
                          setIsLoadingData(false);
                        }
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                      Retry Connection
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-all duration-200"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ))
            } />

            <Route path="/admin" element={
              renderProtectedDashboard("admin", isLoadingData ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center animate-fade-in">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading admin dashboard...</p>
                </div>
              ) : (
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
          initialCenter={activeLocation}
        />

      </div>
    </ThemeProvider>
  );
}
