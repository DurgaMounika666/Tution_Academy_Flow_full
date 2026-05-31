/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Home, Users, ClipboardCheck, FileText, BookOpen, Award, Calendar,
  MessageSquare, Star, User, Settings, Bell, ChevronRight, UserCheck,
  CalendarPlus, Sparkles, HelpCircle, LogOut
} from "lucide-react";
import { Student, Tutor, Assignment, Review, Message, TestScore } from "../types";

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
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
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
    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black">
      {initial}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
      <p className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{value}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 3000);
  };

  const [selectedStudentId, setSelectedStudentId] = useState(myStudents[0]?.id || "");
  const activeStudent = myStudents.find((s) => s.id === selectedStudentId) || myStudents[0];

  const [mathsVal, setMathsVal] = useState(85);
  const [physicsVal, setPhysicsVal] = useState(80);
  const [litVal, setLitVal] = useState(90);

  const [newTitle, setNewTitle] = useState("");
  const [newSubj, setNewSubj] = useState("Algebraic Systems");
  const [newDue, setNewDue] = useState("2026-06-15");

  const handleToggleAttendance = (studentId: string) => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const nextPresent = s.presentCount + 1;
        const total = nextPresent + s.absentCount;
        const rate = total > 0 ? Math.round((nextPresent / total) * 100) : 100;
        return { ...s, presentCount: nextPresent, attendanceRate: rate };
      }
      return s;
    });
    onUpdateStudents(updated);
    showNotif("Attendance marked successfully!");
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

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newAsst: Assignment = {
      id: `A-${Math.floor(920 + Math.random() * 80)}`,
      title: newTitle.trim(),
      subject: newSubj,
      dueDate: newDue,
      submissionsPending: myStudents.length,
      status: "Active"
    };
    onUpdateAssignments([newAsst, ...assignments]);
    setNewTitle("");
    showNotif(`Assignment '${newAsst.title}' published to your students!`);
  };

  const handleMarkMessageRead = (id: string) => {
    onUpdateMessages(messages.map((m) => m.id === id ? { ...m, unread: false } : m));
  };

  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const firstName = currentTutor.name.split(" ").slice(-1)[0] || currentTutor.name;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-4 p-4 sm:p-6 lg:p-8">

        {/* SIDEBAR */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="bg-emerald-700 dark:bg-emerald-800 rounded-3xl p-4 sticky top-4 flex flex-col gap-2 text-white">
            <div className="bg-white text-emerald-700 font-black uppercase tracking-wider text-center py-2.5 rounded-xl text-xs mb-2">
              Tutor Dashboard
            </div>

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.key;
                const showBadge = item.key === "messages" && unreadCount > 0;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveView(item.key)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                        ? "bg-white/20 text-white shadow-inner"
                        : "text-emerald-100 hover:bg-white/10"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {showBadge && (
                      <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 pt-4 border-t border-emerald-600 flex items-center gap-3 px-2">
              <img
                src={currentTutor.image}
                alt={currentTutor.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate">{currentTutor.name}</p>
                <p className="text-[10px] text-emerald-200">Tutor</p>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 space-y-6 text-left">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Welcome back, {firstName} <span aria-hidden>👋</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Here's your class and student activity overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                {todayStr}
              </span>
              <button className="relative p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {notif && (
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 p-4 rounded-xl text-xs text-sky-700 dark:text-sky-300 font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-500" />
              <span>{notif}</span>
            </div>
          )}

          {activeView === "dashboard" && (
            <DashboardView
              myStudents={myStudents}
              todaysClasses={todaysClasses}
              myTests={myTests}
              myReviews={myReviews}
              myMessages={myMessages}
              stats={{ totalStudents, todaysClassCount, pendingTests, avgAttendance }}
              onJumpView={setActiveView}
            />
          )}

          {activeView === "students" && <StudentsView students={myStudents} />}

          {activeView === "attendance" && (
            <AttendanceView students={myStudents} onMark={handleToggleAttendance} />
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

          {activeView === "reviews" && <ReviewsView reviews={myReviews} />}

          {activeView === "profile" && (
            <ProfileView tutor={currentTutor} studentCount={totalStudents} />
          )}

          {activeView === "settings" && <SettingsView />}

        </main>
      </div>
    </div>
  );
}

/* ---------- Sub-views ---------- */

function DashboardView({
  myStudents, todaysClasses, myTests, myReviews, myMessages, stats, onJumpView
}: {
  myStudents: Student[];
  todaysClasses: Array<{ subject: string; time: string; mode: string }>;
  myTests: TestScore[];
  myReviews: Review[];
  myMessages: Message[];
  stats: { totalStudents: number; todaysClassCount: number; pendingTests: number; avgAttendance: number };
  onJumpView: (v: ViewKey) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats.totalStudents} />
        <StatCard label="Today's Classes" value={stats.todaysClassCount} />
        <StatCard label="Pending Tests" value={stats.pendingTests} />
        <StatCard label="Attendance" value={`${stats.avgAttendance}%`} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">My Students</h3>
          <button
            onClick={() => onJumpView("students")}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            View All Students <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="text-left font-bold py-2">Student Name</th>
                <th className="text-left font-bold py-2">Course</th>
                <th className="text-left font-bold py-2">Attendance</th>
                <th className="text-left font-bold py-2">Progress</th>
              </tr>
            </thead>
            <tbody>
              {myStudents.slice(0, 5).map((s) => {
                const progress = s.learningSubjects[0]?.completedPercentage || 0;
                return (
                  <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <StudentAvatar name={s.name} />
                        <span className="font-bold text-slate-800 dark:text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">{getCourse(s)}</td>
                    <td className="py-3 font-bold text-slate-700 dark:text-slate-200">{s.attendanceRate}%</td>
                    <td className="py-3 w-48"><ProgressBar value={progress} /></td>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Today's Classes</h3>
          <div className="space-y-3">
            {todaysClasses.map((c, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{c.subject}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{c.time} • {c.mode}</p>
                </div>
              </div>
            ))}
            {todaysClasses.length === 0 && <p className="text-xs text-slate-500">No classes scheduled.</p>}
          </div>
          <button
            onClick={() => onJumpView("schedule")}
            className="mt-4 w-full text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View Schedule
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Recent Tests</h3>
          <div className="space-y-3">
            {myTests.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{t.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t.date}</p>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {t.score}/{t.total}
                </span>
              </div>
            ))}
            {myTests.length === 0 && <p className="text-xs text-slate-500">No tests recorded.</p>}
          </div>
          <button
            onClick={() => onJumpView("tests")}
            className="mt-4 w-full text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All Tests
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Student Reviews</h3>
          <div className="space-y-4">
            {myReviews.slice(0, 2).map((r) => (
              <div key={r.id} className="flex items-start gap-3">
                <StudentAvatar name={r.studentName} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{r.studentName}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 italic">"{r.comment}"</p>
                </div>
              </div>
            ))}
            {myReviews.length === 0 && <p className="text-xs text-slate-500">No reviews yet.</p>}
          </div>
          <button
            onClick={() => onJumpView("reviews")}
            className="mt-4 w-full text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All Reviews
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Messages</h3>
          <div className="space-y-3">
            {myMessages.slice(0, 3).map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <StudentAvatar name={m.fromName} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{m.fromName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{m.preview}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{m.time}</span>
              </div>
            ))}
            {myMessages.length === 0 && <p className="text-xs text-slate-500">No messages.</p>}
          </div>
          <button
            onClick={() => onJumpView("messages")}
            className="mt-4 w-full text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All Messages
          </button>
        </div>
      </div>
    </>
  );
}

function StudentsView({ students }: { students: Student[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">My Students ({students.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="text-left font-bold py-2">Student</th>
              <th className="text-left font-bold py-2">Grade</th>
              <th className="text-left font-bold py-2">Course</th>
              <th className="text-left font-bold py-2">Attendance</th>
              <th className="text-left font-bold py-2">Progress</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const progress = s.learningSubjects[0]?.completedPercentage || 0;
              return (
                <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <StudentAvatar name={s.name} />
                      <span className="font-bold text-slate-800 dark:text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">{s.grade}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">{getCourse(s)}</td>
                  <td className="py-3 font-bold">{s.attendanceRate}%</td>
                  <td className="py-3 w-48"><ProgressBar value={progress} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceView({ students, onMark }: { students: Student[]; onMark: (id: string) => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Attendance Log</h3>
      <div className="space-y-3">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <StudentAvatar name={s.name} />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">{s.name}</p>
                <p className="text-[10px] text-slate-500">{s.attendanceRate}% • {s.presentCount} present, {s.absentCount} absent</p>
              </div>
            </div>
            <button
              onClick={() => onMark(s.id)}
              className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-[10px] font-bold hover:bg-emerald-100 inline-flex items-center gap-1"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Mark Present
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestsView({ tests }: { tests: TestScore[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Test Records</h3>
      <div className="space-y-3">
        {tests.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">{t.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{t.studentName} • {t.subject} • {t.date}</p>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{t.score}/{t.total}</span>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            <CalendarPlus className="h-4 w-4" />
            Publish Assignment
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
              <span className="text-[9px] uppercase font-black tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">
        Record Assessment Scores
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStudentId(s.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${selectedStudentId === s.id
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
              <label className="text-slate-600">Mathematics (%)</label>
              <input type="number" min="0" max="100" value={mathsVal}
                onChange={(e) => setMathsVal(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-700" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-600">Physics (%)</label>
              <input type="number" min="0" max="100" value={physicsVal}
                onChange={(e) => setPhysicsVal(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-700" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-600">Literature (%)</label>
              <input type="number" min="0" max="100" value={litVal}
                onChange={(e) => setLitVal(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-700" required />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl flex justify-between items-center text-xs border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 font-bold">Computed GPA:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
              {((mathsVal + physicsVal + litVal) / 3 / 25).toFixed(2)} / 4.0
            </strong>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition-all active:scale-95"
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Class Schedule</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="text-left font-bold py-2">Subject</th>
              <th className="text-left font-bold py-2">Student</th>
              <th className="text-left font-bold py-2">Day</th>
              <th className="text-left font-bold py-2">Time</th>
              <th className="text-left font-bold py-2">Mode</th>
            </tr>
          </thead>
          <tbody>
            {all.map((c, idx) => (
              <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50">
                <td className="py-3 font-bold text-slate-800 dark:text-white">{c.subject}</td>
                <td className="py-3 text-slate-600 dark:text-slate-300">{c.student}</td>
                <td className="py-3 text-slate-600 dark:text-slate-300">{c.day}</td>
                <td className="py-3 text-slate-600 dark:text-slate-300">{c.time}</td>
                <td className="py-3">
                  <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                    {c.mode}
                  </span>
                </td>
              </tr>
            ))}
            {all.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-slate-500">No classes scheduled.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessagesView({ messages, onMarkRead }: { messages: Message[]; onMarkRead: (id: string) => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Messages</h3>
      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-center gap-3 p-3 rounded-xl border ${m.unread
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
                : "bg-slate-50 border-slate-100 dark:bg-slate-950 dark:border-slate-800"
              }`}
          >
            <StudentAvatar name={m.fromName} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white">{m.fromName}</p>
              <p className="text-[11px] text-slate-500 truncate">{m.preview}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-semibold">{m.time}</span>
              {m.unread && (
                <button
                  onClick={() => onMarkRead(m.id)}
                  className="text-[10px] font-bold text-emerald-600 hover:underline"
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

function ReviewsView({ reviews }: { reviews: Review[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Student Reviews</h3>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <StudentAvatar name={r.studentName} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{r.studentName}</p>
                <span className="text-[10px] text-slate-400">{r.date}</span>
              </div>
              <div className="flex mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                ))}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 italic">"{r.comment}"</p>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-xs text-slate-500">No reviews yet.</p>}
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Profile</h3>
      <div className="flex items-center gap-4 mb-6">
        <img src={tutor.image} alt={tutor.name} className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-200" />
        <div>
          <p className="text-lg font-black text-slate-900 dark:text-white">{tutor.name}</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{tutor.specialty}</p>
          <p className="text-[11px] text-slate-500 mt-1">{tutor.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatCard label="Tutor ID" value={tutor.id} />
        <StatCard label="Assigned Students" value={studentCount} />
      </div>

      <button
        onClick={handleAdminContact}
        className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-black py-3 rounded-xl text-xs inline-flex items-center justify-center gap-2 hover:opacity-90"
      >
        <HelpCircle className="h-4 w-4" />
        Contact Admin Hotline
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
      className={`w-10 h-5 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
    >
      <span className={`block h-4 w-4 bg-white rounded-full transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
      <h3 className="text-base font-black text-slate-900 dark:text-white">Settings</h3>

      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">Email Notifications</p>
          <p className="text-[10px] text-slate-500">Get assignment & message updates via email</p>
        </div>
        <Toggle on={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">SMS Alerts</p>
          <p className="text-[10px] text-slate-500">Get urgent alerts on your registered number</p>
        </div>
        <Toggle on={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">Auto-mark Attendance</p>
          <p className="text-[10px] text-slate-500">Automatically mark present on class start</p>
        </div>
        <Toggle on={autoMark} onChange={() => setAutoMark(!autoMark)} />
      </div>
    </div>
  );
}