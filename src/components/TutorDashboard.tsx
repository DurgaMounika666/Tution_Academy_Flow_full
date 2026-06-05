/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useMemo } from "react";
import {
  Home, Users, FileText, BookOpen, Award, Calendar,
  MessageSquare, Star, User, Settings, Bell, ChevronRight, UserCheck,
  CalendarPlus, Sparkles, HelpCircle, LogOut, Clock
} from "lucide-react";
import { apiClient } from "../services/apiClient";
import { Student, Tutor, Assignment, Review, Message, TestScore } from "../types";
import { Footer } from "./Footer";
import { LogoutButton } from "./LogoutButton";

interface TutorDashboardProps {
  currentTutor: Tutor;
  students: Student[];
  assignments: Assignment[];
  reviews: Review[];
  messages: Message[];
  tests: TestScore[];
  onUpdateStudents: (updated: Student[]) => void;
  onUpdateAssignments: (updated: Assignment[]) => void;
  onUpdateMessages: (updated: Message[]) => void;
  onUpdateTests: (updated: TestScore[]) => void;
  onLogout: () => void;
}

type ViewKey =
  | "dashboard" | "students" | "attendance" | "tests" | "assignments"
  | "results" | "schedule" | "messages" | "reviews" | "profile" | "settings";

const NAV_ITEMS: Array<{ key: ViewKey; label: string; icon: React.ComponentType<any> }> = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "students", label: "My Students", icon: Users },
  { key: "attendance", label: "Attendance", icon: UserCheck },
  { key: "tests", label: "Tests", icon: FileText },
  { key: "assignments", label: "Assignments", icon: BookOpen },
  { key: "results", label: "Results", icon: Award },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
];

function getCourse(s: Student): string {
  return s.learningSubjects[0]?.name || "General";
}

function StudentAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-750 dark:text-emerald-300 flex items-center justify-center text-xs font-black">
      {initial}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-grow h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 w-8 text-right">{value}%</span>
    </div>
  );
}

export function TutorDashboard({
  currentTutor, students, assignments, reviews, messages, tests,
  onUpdateStudents, onUpdateAssignments, onUpdateMessages, onUpdateTests, onLogout
}: TutorDashboardProps) {

  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [notif, setNotif] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [attendanceMarkedToday, setAttendanceMarkedToday] = useState<Record<string, boolean>>({});
  const mainPanelRef = useRef<HTMLElement | null>(null);

  const myStudents = useMemo(
    () => students.filter((s) => currentTutor.assignedStudentIds.includes(s.id)),
    [students, currentTutor]
  );

  const myReviews = reviews.filter((r) => currentTutor.assignedStudentIds.includes(r.studentId));
  const myMessages = messages.filter((m) => currentTutor.assignedStudentIds.includes(m.fromStudentId));
  const myTests = tests.filter((t) => currentTutor.assignedStudentIds.includes(t.studentId));
  const unreadCount = myMessages.filter((m) => m.unread).length;

  const todaysClasses = useMemo(() => {
    const map = new Map<string, { subject: string; time: string; mode: string }>();
    myStudents.forEach((s) => {
      s.classTimings.forEach((c) => {
        if (!map.has(c.subject)) map.set(c.subject, { subject: c.subject, time: c.time, mode: c.mode });
      });
    });
    return Array.from(map.values()).slice(0, 4);
  }, [myStudents]);

  const totalStudents = myStudents.length;
  const todaysClassCount = todaysClasses.length;
  const pendingTests = assignments.filter((a) => a.status === "Active").reduce((sum, a) => sum + a.submissionsPending, 0);
  const avgAttendance = myStudents.length > 0
    ? Math.round(myStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / myStudents.length)
    : 0;
  const notificationItems = [
    ...myMessages.slice(0, 3).map((m) => ({
      id: m.id,
      title: `Message from ${m.fromName}`,
      detail: m.preview,
      time: m.time,
    })),
    {
      id: "pending-assignments",
      title: "Assignments pending review",
      detail: `${pendingTests} submission(s) pending`,
      time: "Now",
    },
  ];

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 3000);
  };

  const handleViewChange = (view: ViewKey) => {
    setActiveView(view);
    if (mainPanelRef.current) mainPanelRef.current.scrollTop = 0;
  };

  const [selectedStudentId, setSelectedStudentId] = useState(myStudents[0]?.id || "");
  const activeStudent = myStudents.find((s) => s.id === selectedStudentId) || myStudents[0];

  const [mathsVal, setMathsVal] = useState(85);
  const [physicsVal, setPhysicsVal] = useState(80);
  const [litVal, setLitVal] = useState(90);

  const [newTitle, setNewTitle] = useState("");
  const [newSubj, setNewSubj] = useState("Algebraic Systems");
  const [newDue, setNewDue] = useState("2026-06-15");

  const handleMarkAttendance = async (studentId: string, status: "Present" | "Absent") => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const prevStatus = attendanceMarkedToday[studentId] === true
        ? "Present"
        : attendanceMarkedToday[studentId] === false
          ? "Absent"
          : null;
      if (prevStatus === status) {
        showNotif(`Already marked ${status.toLowerCase()}.`);
        return;
      }
      await apiClient.attendance.mark(studentId, today, status);
      const updated = students.map((s) => {
        if (s.id === studentId) {
          let nextPresent = s.presentCount;
          let nextAbsent = s.absentCount;
          if (status === "Present") {
            nextPresent += 1;
            if (prevStatus === "Absent") nextAbsent = Math.max(0, nextAbsent - 1);
          } else {
            nextAbsent += 1;
            if (prevStatus === "Present") nextPresent = Math.max(0, nextPresent - 1);
          }
          const total = nextPresent + nextAbsent;
          const rate = total > 0 ? Math.round((nextPresent / total) * 100) : 100;
          return { ...s, presentCount: nextPresent, absentCount: nextAbsent, attendanceRate: rate };
        }
        return s;
      });
      onUpdateStudents(updated);
      setAttendanceMarkedToday((prev) => ({ ...prev, [studentId]: status === "Present" }));
      showNotif(`Attendance updated: ${status}`);
    } catch (error) {
      console.warn("Unable to mark attendance", error);
      showNotif("Unable to mark attendance right now. Please try again.");
    }
  };

  const handleUpdateScores = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    const avg = (mathsVal + physicsVal + litVal) / 3;
    const calcGPA = Number((avg / 25).toFixed(2));

    const updated = students.map((s) => {
      if (s.id === activeStudent.id) {
        const nextResults = [...s.results];
        const lastIndex = nextResults.length - 1;
        if (lastIndex >= 0) {
          nextResults[lastIndex] = {
            ...nextResults[lastIndex],
            mathsScore: mathsVal,
            physicsScore: physicsVal,
            literatureScore: litVal,
            gpa: calcGPA
          };
        }
        return { ...s, results: nextResults };
      }
      return s;
    });
    onUpdateStudents(updated);

    const newTest: TestScore = {
      id: `TS-${600 + tests.length + 1}`,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      title: "Latest Assessment",
      subject: activeStudent.learningSubjects[0]?.name || "General",
      score: Math.round(avg),
      total: 100,
      date: new Date().toISOString().slice(0, 10)
    };
    onUpdateTests([newTest, ...tests]);

    showNotif(`Grades updated for ${activeStudent.name}! New GPA: ${calcGPA}`);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await apiClient.attendance.createAssignment(currentTutor.id, newTitle.trim(), newSubj, newDue, "Active");
      const newAsst: Assignment = {
        id: created.assignmentId || created.id || `A-${Math.floor(920 + Math.random() * 80)}`,
        title: created.title || newTitle.trim(),
        subject: created.subject || newSubj,
        dueDate: created.dueDate || newDue,
        submissionsPending: created.submissionsPending ?? myStudents.length,
        status: created.status || "Active"
      };
      onUpdateAssignments([newAsst, ...assignments]);
      setNewTitle("");
      showNotif(`Assignment '${newAsst.title}' published to your students!`);
    } catch (error) {
      console.warn("Unable to create assignment", error);
      showNotif("Unable to publish assignment. Please try again.");
    }
  };

  const handleMarkMessageRead = (id: string) => {
    onUpdateMessages(messages.map((m) => m.id === id ? { ...m, unread: false } : m));
  };

  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const firstName = currentTutor.name.split(" ").slice(-1)[0] || currentTutor.name;

  return (
    <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar Navigation — fixed height; scrolls only if nav overflows */}
      <aside className="w-full md:w-64 bg-[#133d27] dark:bg-[#071b11] text-emerald-50 flex flex-col p-5 border-r border-[#194b30] shrink-0 md:h-full overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden space-y-6">
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <span className="p-2 bg-[#10b981] rounded-xl text-white shadow-lg animate-pulse">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="font-extrabold text-sm tracking-widest text-white uppercase">
              Tutors Lounge
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-left">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.key;
              const showBadge = item.key === "messages" && unreadCount > 0;
              return (
                <button
                  key={item.key}
                  onClick={() => handleViewChange(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? "bg-[#10b981] text-white shadow-md transform scale-[1.02]" 
                      : "text-emerald-100/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {showBadge && (
                    <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card Profile Footer */}
        <div className="pt-4 border-t border-white/10 mt-4 shrink-0 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <img 
              src={currentTutor.image} 
              alt={currentTutor.name} 
              className="h-9 w-9 rounded-full object-cover border border-emerald-400"
            />
            <div>
              <p className="text-xs font-black text-white leading-tight">{currentTutor.name}</p>
              <p className="text-[10px] text-emerald-200/50">Tutor Staff</p>
            </div>
          </div>
        </div>
      </aside>

      <main ref={mainPanelRef} data-scroll-container className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 space-y-6 relative">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <LogoutButton onLogout={onLogout} />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left mt-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Welcome back, {firstName} 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Here's your class and student activity overview.
            </p>
          </div>

          <div className="flex items-center gap-3 relative">
            <span className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 text-xs font-extrabold text-slate-700 dark:text-slate-350">
              {todayStr}
            </span>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850"
            >
              <Bell className="h-4 w-4 text-slate-700 dark:text-slate-350" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full px-1 py-0.5 shrink-0">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 max-h-80 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-3 z-20">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 pb-2">
                  Notifications
                </p>
                <div className="space-y-2">
                  {notificationItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-left">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{item.detail}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {notif && (
          <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 p-4 rounded-xl text-xs text-sky-700 dark:text-sky-300 font-bold flex items-center gap-2 text-left">
            <Sparkles className="h-5 w-5 text-sky-500 shrink-0" />
            <span>{notif}</span>
          </div>
        )}

        {/* Dynamic Navigation Content views */}
        {activeView === "dashboard" && (
          <DashboardView
            myStudents={myStudents}
            todaysClasses={todaysClasses}
            myTests={myTests}
            myReviews={myReviews}
            myMessages={myMessages}
            stats={{ totalStudents, todaysClassCount, pendingTests, avgAttendance }}
            onJumpView={setActiveView}
            attendanceMarkedToday={attendanceMarkedToday}
            onMarkAttendance={handleMarkAttendance}
          />
        )}

        {activeView === "students" && <StudentsView students={myStudents} />}

        {activeView === "attendance" && (
          <AttendanceView
            students={myStudents}
            onMark={handleMarkAttendance}
            attendanceMarkedToday={attendanceMarkedToday}
          />
        )}

        {activeView === "tests" && <TestsView tests={myTests} />}

        {activeView === "assignments" && (
          <AssignmentsView
            assignments={assignments}
            newTitle={newTitle} setNewTitle={setNewTitle}
            newSubj={newSubj} setNewSubj={setNewSubj}
            newDue={newDue} setNewDue={setNewDue}
            onCreate={handleCreateAssignment}
          />
        )}

        {activeView === "results" && (
          <ResultsView
            students={myStudents}
            activeStudent={activeStudent}
            selectedStudentId={selectedStudentId}
            setSelectedStudentId={setSelectedStudentId}
            mathsVal={mathsVal} setMathsVal={setMathsVal}
            physicsVal={physicsVal} setPhysicsVal={setPhysicsVal}
            litVal={litVal} setLitVal={setLitVal}
            onSubmit={handleUpdateScores}
          />
        )}

        {activeView === "schedule" && <ScheduleView students={myStudents} />}

        {activeView === "messages" && (
          <MessagesView messages={myMessages} onMarkRead={handleMarkMessageRead} />
        )}

        {activeView === "reviews" && <ReviewsView reviews={myReviews} students={myStudents} />}

        {activeView === "profile" && (
          <ProfileView tutor={currentTutor} studentCount={totalStudents} />
        )}

        {activeView === "settings" && <SettingsView />}

        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mb-24 mt-8">
          <Footer />
        </div>

      </main>

    </div>
  );
}

/* ---------- Dashboard sub-view redrawn based on mockup image ---------- */

function DashboardView({
  myStudents, todaysClasses, myTests, myReviews, myMessages, stats, onJumpView,
  attendanceMarkedToday, onMarkAttendance
}: {
  myStudents: Student[];
  todaysClasses: Array<{ subject: string; time: string; mode: string }>;
  myTests: TestScore[];
  myReviews: Review[];
  myMessages: Message[];
  stats: { totalStudents: number; todaysClassCount: number; pendingTests: number; avgAttendance: number };
  onJumpView: (v: ViewKey) => void;
  attendanceMarkedToday: Record<string, boolean>;
  onMarkAttendance: (id: string, status: "Present" | "Absent") => void;
}) {
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "present" | "absent">("all");

  const attendanceRows = myStudents.map((s) => ({
    student: s,
    status: attendanceMarkedToday[s.id] === true ? "Present"
      : attendanceMarkedToday[s.id] === false ? "Absent"
      : "Not marked"
  }));

  const presentRows = attendanceRows.filter((row) => row.status === "Present");
  const absentRows = attendanceRows.filter((row) => row.status === "Absent");
  const unmarkedRows = attendanceRows.filter((row) => row.status === "Not marked");
  const filteredRows = attendanceFilter === "present"
    ? presentRows
    : attendanceFilter === "absent"
      ? absentRows
      : attendanceRows;

  return (
    <>
      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {/* Card 1: Total Students */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Students</span>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalStudents}
            </span>
          </div>
        </div>

        {/* Card 2: Today's Classes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Today's Classes</span>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.todaysClassCount}
            </span>
          </div>
        </div>

        {/* Card 3: Pending Tests */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Pending Tests</span>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.pendingTests}
            </span>
          </div>
        </div>

        {/* Card 4: Attendance */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Attendance</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.avgAttendance}%
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold">
              Good
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Left Card: Attendance + My Students (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Attendance Summary</h3>
                <p className="text-[10px] text-slate-500 mt-1">Toggle between present and absent students for today.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "present", "absent"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAttendanceFilter(filter)}
                    className={`rounded-full px-3 py-2 text-[10px] font-black transition ${attendanceFilter === filter ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}
                  >
                    {filter === "all" ? "All" : filter === "present" ? "Present" : "Absent"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                <p className="uppercase font-black tracking-wider text-[9px] text-slate-400">Present</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{presentRows.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                <p className="uppercase font-black tracking-wider text-[9px] text-slate-400">Absent</p>
                <p className="text-lg font-black text-rose-600 dark:text-rose-400">{absentRows.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                <p className="uppercase font-black tracking-wider text-[9px] text-slate-400">Unmarked</p>
                <p className="text-lg font-black text-slate-700 dark:text-slate-200">{unmarkedRows.length}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {filteredRows.slice(0, 4).map(({ student, status }) => (
                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{getCourse(student)} • {student.attendanceRate}%</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-black ${status === "Present" ? "bg-emerald-100 text-emerald-700" : status === "Absent" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                      {status}
                    </span>
                    <button
                      type="button"
                      onClick={() => onMarkAttendance(student.id, "Present")}
                      className={`text-[10px] font-black uppercase tracking-wider rounded-xl px-3 py-2 ${status === "Present" ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => onMarkAttendance(student.id, "Absent")}
                      className={`text-[10px] font-black uppercase tracking-wider rounded-xl px-3 py-2 ${status === "Absent" ? "bg-rose-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
              {filteredRows.length === 0 && (
                <p className="text-xs text-slate-500">No {attendanceFilter === "all" ? "attendance records" : `${attendanceFilter} students`} to show.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">My Students</h3>
              <button
                onClick={() => onJumpView("students")}
                className="text-xs font-extrabold text-[#10b981] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All Students</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

          <div className="overflow-hidden rounded-2xl border border-slate-105">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                  <th className="text-left px-4 py-2">Student Name</th>
                  <th className="text-left px-4 py-2">Course</th>
                  <th className="text-left px-4 py-2">Attendance</th>
                  <th className="text-left px-4 py-2">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-350">
                {myStudents.slice(0, 5).map((s) => {
                  const progress = s.learningSubjects[0]?.completedPercentage || 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StudentAvatar name={s.name} />
                          <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getCourse(s)}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{s.attendanceRate}%</td>
                      <td className="px-4 py-3 min-w-[120px]"><ProgressBar value={progress} /></td>
                    </tr>
                  );
                })}
                {myStudents.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-500">No students assigned yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>

        {/* Right Card: Today's Classes (Col 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Today's Classes</h3>
            <div className="space-y-3">
              {todaysClasses.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                  <div className="text-left space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{c.subject}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{c.time}</span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-tight bg-indigo-50 dark:bg-indigo-950/45 text-indigo-650 dark:text-indigo-400 rounded-lg">
                    {c.mode}
                  </span>
                </div>
              ))}
              {todaysClasses.length === 0 && <p className="text-xs text-slate-500">No classes scheduled.</p>}
            </div>
          </div>

          <button
            onClick={() => onJumpView("schedule")}
            className="mt-4 w-full text-center text-xs font-bold text-[#10b981] hover:underline block pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
          >
            View Schedule
          </button>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        
        {/* Student Reviews */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Student Reviews</h3>
          <div className="space-y-4">
            {myReviews.slice(0, 2).map((r) => (
              <div key={r.id} className="p-3.5 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-start gap-3">
                <StudentAvatar name={r.studentName} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-whiteleading-none">{r.studentName}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">{r.date}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 italic font-medium pt-1">"{r.comment}"</p>
                </div>
              </div>
            ))}
            {myReviews.length === 0 && <p className="text-xs text-slate-500">No reviews yet.</p>}
          </div>
          <button
            onClick={() => onJumpView("reviews")}
            className="w-full text-center text-xs font-bold text-[#10b981] hover:underline block pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
          >
            View All Reviews
          </button>
        </div>

        {/* Recent Tests & Messages Inbox */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Tests</h3>
          <div className="space-y-3">
            {myTests.slice(0, 3).map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{t.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{t.subject} • {t.date}</p>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                  {t.score}/{t.total}
                </span>
              </div>
            ))}
            {myTests.length === 0 && <p className="text-xs text-slate-500">No tests recorded.</p>}
          </div>
          <button
            onClick={() => onJumpView("tests")}
            className="w-full text-center text-xs font-bold text-[#10b981] hover:underline block pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
          >
            View All Tests
          </button>
        </div>

      </div>
    </>
  );
}

/* ---------- Sub-views ---------- */

function StudentsView({ students }: { students: Student[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">My Students ({students.length})</h3>
      <div className="overflow-hidden rounded-2xl border border-slate-105">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
              <th className="text-left px-4 py-2">Student</th>
              <th className="text-left px-4 py-2">Grade</th>
              <th className="text-left px-4 py-2">Course</th>
              <th className="text-left px-4 py-2">Attendance</th>
              <th className="text-left px-4 py-2">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-350">
            {students.map((s) => {
              const progress = s.learningSubjects[0]?.completedPercentage || 0;
              return (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StudentAvatar name={s.name} />
                      <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{s.grade}</td>
                  <td className="px-4 py-3">{getCourse(s)}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{s.attendanceRate}%</td>
                  <td className="px-4 py-3 min-w-[120px]"><ProgressBar value={progress} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceView({
  students,
  onMark,
  attendanceMarkedToday,
}: {
  students: Student[];
  onMark: (id: string, status: "Present" | "Absent") => void;
  attendanceMarkedToday: Record<string, boolean>;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Attendance Log</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {students.map((s) => {
          const status = attendanceMarkedToday[s.id] === true ? "Present" : attendanceMarkedToday[s.id] === false ? "Absent" : "Not marked";
          const actionStatus = status === "Present" ? "Absent" : "Present";
          return (
            <div key={s.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <StudentAvatar name={s.name} />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{s.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{s.attendanceRate}% • {s.presentCount} present, {s.absentCount} absent</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] px-2 py-1 rounded-full font-black ${status === "Present" ? "bg-emerald-100 text-emerald-700" : status === "Absent" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                  {status}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onMark(s.id, "Present")}
                    className={`px-3.5 py-2 rounded-xl text-[10px] font-bold ${status === "Present" ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => onMark(s.id, "Absent")}
                    className={`px-3.5 py-2 rounded-xl text-[10px] font-bold ${status === "Absent" ? "bg-rose-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestsView({ tests }: { tests: TestScore[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Test Records</h3>
      <div className="space-y-3">
        {tests.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{t.title}</p>
              <p className="text-[10px] text-slate-500 mt-1">{t.studentName} • {t.subject} • {t.date}</p>
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg shrink-0">
              {t.score}/{t.total}
            </span>
          </div>
        ))}
        {tests.length === 0 && <p className="text-xs text-slate-500">No tests recorded.</p>}
      </div>
    </div>
  );
}

function AssignmentsView({
  assignments, newTitle, setNewTitle, newSubj, setNewSubj, newDue, setNewDue, onCreate
}: {
  assignments: Assignment[];
  newTitle: string; setNewTitle: (v: string) => void;
  newSubj: string; setNewSubj: (v: string) => void;
  newDue: string; setNewDue: (v: string) => void;
  onCreate: (e: React.FormEvent) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Create Assignment</h3>
        <form onSubmit={onCreate} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-600">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="E.g. Calculus Quiz 3"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-700"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-600">Subject</label>
              <select
                value={newSubj}
                onChange={(e) => setNewSubj(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:bg-slate-950 dark:border-slate-700"
              >
                <option>Algebraic Systems</option>
                <option>Advanced Calculus</option>
                <option>Physics Thermodynamics</option>
                <option>Computer Science Principles</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-600">Due Date</label>
              <input
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:bg-slate-950 dark:border-slate-700"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
          >
            <CalendarPlus className="h-4 w-4 shrink-0" />
            <span>Publish Assignment</span>
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Active Assignments</h3>
        <div className="space-y-2.5">
          {assignments.map((a) => (
            <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-white leading-tight">{a.title}</p>
                <p className="text-[10px] text-slate-500 mt-1">{a.subject} • Due: {a.dueDate}</p>
              </div>
              <span className="text-[9px] uppercase font-black tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded shrink-0">
                {a.submissionsPending} pending
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsView({
  students, activeStudent, selectedStudentId, setSelectedStudentId,
  mathsVal, setMathsVal, physicsVal, setPhysicsVal, litVal, setLitVal, onSubmit
}: {
  students: Student[];
  activeStudent: Student | undefined;
  selectedStudentId: string;
  setSelectedStudentId: (v: string) => void;
  mathsVal: number; setMathsVal: (v: number) => void;
  physicsVal: number; setPhysicsVal: (v: number) => void;
  litVal: number; setLitVal: (v: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">
        Record Assessment Scores
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStudentId(s.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${selectedStudentId === s.id
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
              }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {activeStudent && (
        <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-650">Mathematics (%)</label>
              <input type="number" min="0" max="100" value={mathsVal}
                onChange={(e) => setMathsVal(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-700" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-650">Physics (%)</label>
              <input type="number" min="0" max="100" value={physicsVal}
                onChange={(e) => setPhysicsVal(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-700" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-650">Literature (%)</label>
              <input type="number" min="0" max="100" value={litVal}
                onChange={(e) => setLitVal(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-700" required />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl flex justify-between items-center text-xs border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 font-bold">Computed GPA:</span>
            <strong className="text-emerald-600 dark:text-emerald-450 text-sm">
              {((mathsVal + physicsVal + litVal) / 3 / 25).toFixed(2)} / 4.0
            </strong>
          </div>

          <button
            type="submit"
            className="w-full bg-[#10b981] hover:opacity-90 text-white font-black py-3 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
          >
            Save & Update Results
          </button>
        </form>
      )}
    </div>
  );
}

function ScheduleView({ students }: { students: Student[] }) {
  const all = students.flatMap((s) =>
    s.classTimings.map((c) => ({ ...c, student: s.name }))
  );
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Class Schedule</h3>
      <div className="overflow-hidden rounded-2xl border border-slate-105">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
              <th className="text-left px-4 py-2">Subject</th>
              <th className="text-left px-4 py-2">Student</th>
              <th className="text-left px-4 py-2">Day</th>
              <th className="text-left px-4 py-2">Time</th>
              <th className="text-left px-4 py-2">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-350">
            {all.map((c, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{c.subject}</td>
                <td className="px-4 py-3">{c.student}</td>
                <td className="px-4 py-3">{c.day}</td>
                <td className="px-4 py-3">{c.time}</td>
                <td className="px-4 py-3">
                  <span className="text-[9px] uppercase font-black px-2.5 py-1 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/45 dark:text-sky-300 shrink-0">
                    {c.mode}
                  </span>
                </td>
              </tr>
            ))}
            {all.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-slate-550">No classes scheduled.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessagesView({ messages, onMarkRead }: { messages: Message[]; onMarkRead: (id: string) => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Messages</h3>
      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-center gap-3 p-3 rounded-2xl border ${m.unread
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
                : "bg-slate-50 border-slate-100 dark:bg-slate-950 dark:border-slate-800"
              }`}
          >
            <StudentAvatar name={m.fromName} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{m.fromName}</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{m.preview}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-450 font-semibold">{m.time}</span>
              {m.unread && (
                <button
                  onClick={() => onMarkRead(m.id)}
                  className="text-[10px] font-black text-emerald-600 hover:underline cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-xs text-slate-500">Inbox is empty.</p>}
      </div>
    </div>
  );
}

function ReviewsView({ reviews, students }: { reviews: Review[]; students: Student[] }) {
  const tutorReviewsForStudents = students.slice(0, 5).map((s) => ({
    id: `tutor-review-${s.id}`,
    studentName: s.name,
    rating: s.attendanceRate >= 90 ? 5 : s.attendanceRate >= 80 ? 4 : 3,
    comment:
      s.attendanceRate >= 90
        ? "Excellent consistency and class participation."
        : s.attendanceRate >= 80
          ? "Good effort. Focus on completing pending assignments on time."
          : "Needs stronger consistency and regular class participation.",
    date: "Today",
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Reviews</h3>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Student Reviews For Tutor</p>
      <div className="space-y-4 mb-6">
        {reviews.map((r) => (
          <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-start gap-3">
            <StudentAvatar name={r.studentName} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{r.studentName}</p>
                <span className="text-[10px] text-slate-400">{r.date}</span>
              </div>
              <div className="flex mt-1 gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                ))}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-350 mt-2 italic font-medium">"{r.comment}"</p>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-xs text-slate-500">No reviews yet.</p>}
      </div>

      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Tutor Reviews For Students</p>
      <div className="space-y-4">
        {tutorReviewsForStudents.map((r) => (
          <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-start gap-3">
            <StudentAvatar name={r.studentName} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{r.studentName}</p>
                <span className="text-[10px] text-slate-400">{r.date}</span>
              </div>
              <div className="flex mt-1 gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-emerald-500 text-emerald-500" : "text-slate-300"}`} />
                ))}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-350 mt-2 italic font-medium">"{r.comment}"</p>
            </div>
          </div>
        ))}
        {tutorReviewsForStudents.length === 0 && <p className="text-xs text-slate-500">No tutor reviews available.</p>}
      </div>
    </div>
  );
}

function ProfileView({ tutor, studentCount }: { tutor: Tutor; studentCount: number }) {
  const handleAdminContact = () => {
    const txt = encodeURIComponent(`Hello Admin Desk! This is ${tutor.name} requesting coordination.`);
    window.open(`https://wa.me/916300227011?text=${txt}`, "_blank");
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left space-y-5">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Profile</h3>
      <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
        <img src={tutor.image} alt={tutor.name} className="h-20 w-20 rounded-2xl object-cover border border-emerald-450" />
        <div>
          <p className="text-lg font-black text-slate-900 dark:text-white">{tutor.name}</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{tutor.specialty}</p>
          <p className="text-[11px] text-slate-500 mt-1">{tutor.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Tutor ID</span>
          <span className="text-base font-black text-slate-905 mt-1 block">{tutor.id}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Assigned Students</span>
          <span className="text-base font-black text-slate-905 mt-1 block">{studentCount} pupils</span>
        </div>
      </div>

      <button
        onClick={handleAdminContact}
        className="w-full bg-[#133d27] hover:opacity-90 text-white font-black py-3.5 rounded-2xl text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Contact Admin Hotline desk</span>
      </button>
    </div>
  );
}

function SettingsView() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [autoMark, setAutoMark] = useState(false);

  const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-10 h-5 rounded-full transition-colors flex items-center cursor-pointer ${on ? "bg-emerald-500" : "bg-slate-350 dark:bg-slate-700"}`}
    >
      <span className={`block h-4 w-4 bg-white rounded-full transition-transform ${on ? "translate-x-5.5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 text-left">
      <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Settings</h3>

      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Email Notifications</p>
          <p className="text-[10px] text-slate-500 mt-1">Get assignment & message updates via email</p>
        </div>
        <Toggle on={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
      </div>

      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">SMS Alerts</p>
          <p className="text-[10px] text-slate-500 mt-1">Get urgent alerts on your registered number</p>
        </div>
        <Toggle on={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />
      </div>

      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Auto-mark Attendance</p>
          <p className="text-[10px] text-slate-500 mt-1">Automatically mark present on class start</p>
        </div>
        <Toggle on={autoMark} onChange={() => setAutoMark(!autoMark)} />
      </div>
    </div>
  );
}
