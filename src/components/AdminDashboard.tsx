/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ShieldCheck, Search, Users, ShieldAlert, DollarSign, MapPin,
  BookOpen, Mail, Terminal, Lock, CheckCircle2, ChevronRight, BarChart3, TrendingUp,
  LayoutDashboard, FileText, Bell, Settings, Award, PlusCircle, ArrowUpRight,
  Plus, Trash2, Edit3, Filter, Check, X, Send, Volume2, UserCheck, Calendar,
  Clock, CheckCircle, AlertCircle, Eye, CreditCard, School
} from "lucide-react";
import { apiClient } from "../services/apiClient";
import { Student, Tutor, FeePayment } from "../types";
import { STANDARDS } from "../data";
import { buildAllCoursesFromCatalog, CatalogCourse } from "../utils/courseCatalog";
import { buildFeeReceiptFromPayment, FeeReceiptData } from "../utils/feeReceipt";
import { FeeReceiptModal } from "./FeeReceiptModal";

interface AdminDashboardProps {
  students: Student[];
  tutors: Tutor[];
  fees: FeePayment[];
  onBypassLogin: (role: "student" | "parent" | "tutor") => void;
  onLogout: () => void;
}

type Course = CatalogCourse;

interface Batch {
  id: string;
  name: string;
  courseName: string;
  tutorName: string;
  timings: string;
  days: string;
  studentsCount: number;
  status: "Active" | "Upcoming";
}

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  target: "All" | "Students" | "Tutors" | "Parents";
  date: string;
}

export function AdminDashboard({
  students, tutors, fees, onBypassLogin, onLogout
}: AdminDashboardProps) {

  // Main Tabs Configuration
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Core Data States
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [localTutors, setLocalTutors] = useState<Tutor[]>(tutors);
  const [localFees, setLocalFees] = useState<FeePayment[]>(fees);
  const [courses, setCourses] = useState<Course[]>(() => buildAllCoursesFromCatalog(students));
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<FeeReceiptData | null>(null);
  const [batches, setBatches] = useState<Batch[]>([
    { id: "B-401", name: "Batch A - Morning STEM", courseName: "Mathematics", tutorName: "Dr. Elena Vance", timings: "09:00 AM - 10:30 AM", days: "Monday, Wednesday", studentsCount: 15, status: "Active" },
    { id: "B-402", name: "Batch B - Evening Physics", courseName: "Physics", tutorName: "Prof. Julian Thorne", timings: "04:00 PM - 05:30 PM", days: "Tuesday, Thursday", studentsCount: 12, status: "Active" },
    { id: "B-403", name: "Batch C - Friday Coding", courseName: "Computer Science", tutorName: "Mr. Anand Kumar", timings: "02:00 PM - 05:00 PM", days: "Friday", studentsCount: 18, status: "Active" }
  ]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    { id: "N-501", title: "Term 2 Examination Schedule", message: "Term 2 exams will start from June 15th. Detailed schedule published.", target: "All", date: "2026-05-28" },
    { id: "N-502", title: "Tutor Work Hour Submission", message: "Please submit your monthly work logs by the end of this week.", target: "Tutors", date: "2026-05-30" },
    { id: "N-503", title: "Fee Due Reminder", message: "Reminder: June installment fees are due by June 10th.", target: "Parents", date: "2026-06-01" }
  ]);

  // Filters
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>("All");
  const [courseCategoryFilter, setCourseCategoryFilter] = useState<string>("All");

  // Selection & Detail Panel states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Modals Toggles
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTutor, setShowAddTutor] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showAddFee, setShowAddFee] = useState(false);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [showContactParent, setShowContactParent] = useState<string | null>(null);
  const [showPublishResult, setShowPublishResult] = useState(false);

  // Form Field States
  const [newStudent, setNewStudent] = useState({ name: "", grade: "9th Class", section: "Section A", parentEmail: "" });
  const [newTutor, setNewTutor] = useState({ name: "", specialty: "", email: "" });
  const [newCourse, setNewCourse] = useState({ name: "", tutorName: "", category: "Mathematics", duration: "12 weeks", mode: "Online" as "Online" | "Offline" });
  const [newBatch, setNewBatch] = useState({ name: "", courseName: "", tutorName: "", timings: "09:00 AM - 10:30 AM", days: "Monday, Wednesday" });
  const [newFee, setNewFee] = useState({ studentId: "", title: "", amount: 0, dueDate: "" });
  const [newNotification, setNewNotification] = useState({ title: "", message: "", target: "All" as any });
  const [contactParentMessage, setContactParentMessage] = useState({ subject: "", message: "" });
  const [newResult, setNewResult] = useState({ studentId: "", term: "Current", testTitle: "", subject: "", score: 0, total: 100 });

  // Attendance Sheet States
  const [attendanceGrade, setAttendanceGrade] = useState("9th Class");
  const [attendanceDate, setAttendanceDate] = useState("2026-06-01");
  const [attendanceRoster, setAttendanceRoster] = useState<Record<string, boolean>>({});

  // Settings State
  const [settings, setSettings] = useState({
    schoolName: "Academy Flow International",
    domain: "academyflow.com",
    calendar: "Semester Board 2026",
    twoFactor: true,
    autoInvoice: false,
    theme: "light"
  });

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "tutors", label: "Tutors", icon: BookOpen },
    { id: "parents", label: "Parents", icon: Users },
    { id: "courses", label: "Courses", icon: FileText },
    { id: "batches", label: "Batches", icon: PlusCircle },
    { id: "attendance", label: "Attendance", icon: ClockIcon },
    { id: "results", label: "Results", icon: Award },
    { id: "fees", label: "Fees", icon: DollarSign },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Trigger Toast Notification Helper
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const openFeeReceipt = (fee: FeePayment) => {
    setReceiptData(buildFeeReceiptFromPayment(fee, localStudents));
    setIsReceiptModalOpen(true);
  };

  const paidFeesHistory = localFees
    .filter((f) => f.status === "Paid")
    .map((f) => ({
      fee: f,
      receipt: buildFeeReceiptFromPayment(f, localStudents),
    }));

  // Helper clock icon mapping
  function ClockIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
  }

  // --- FORM HANDLERS ---
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.parentEmail) {
      triggerToast("Please fill all required fields");
      return;
    }
    const created: Student = {
      id: `ST-${100 + localStudents.length + 1}`,
      name: newStudent.name,
      grade: newStudent.grade,
      section: newStudent.section,
      attendanceRate: 100,
      presentCount: 0,
      absentCount: 0,
      learningSubjects: [
        { name: "Mathematics", completedPercentage: 0, completedWeeks: 0 }
      ],
      results: [
        { term: "Current", gpa: 4.0, mathsScore: 100, physicsScore: 100, literatureScore: 100, compSciScore: 100 }
      ],
      classTimings: [
        { subject: "Mathematics", time: "02:00 PM", day: "Monday, Thursday", mode: "Offline" }
      ],
      upcomingEvents: [
        { title: "Induction Diagnostic Exam", time: "Next Monday", description: "Standard orientation test.", badge: "Diagnostic" }
      ],
      videoResources: [],
      parentEmail: newStudent.parentEmail,
      assignedTutorIds: ["T-201"]
    };
    setLocalStudents([...localStudents, created]);
    setShowAddStudent(false);
    setNewStudent({ name: "", grade: "9th Class", section: "Section A", parentEmail: "" });
    triggerToast(`Successfully enrolled student ${created.name} (${created.id})`);
  };

  const handleAddTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutor.name || !newTutor.email) {
      triggerToast("Please fill all required fields");
      return;
    }
    const created: Tutor = {
      id: `T-${200 + localTutors.length + 1}`,
      name: newTutor.name,
      specialty: newTutor.specialty || "General Educator",
      email: newTutor.email,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      assignedStudentIds: ["ST-101"],
      pendingTasksCount: 0
    };
    setLocalTutors([...localTutors, created]);
    setShowAddTutor(false);
    setNewTutor({ name: "", specialty: "", email: "" });
    triggerToast(`Successfully added Tutor ${created.name}`);
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.tutorName) {
      triggerToast("Please fill all required fields");
      return;
    }
    const created: Course = {
      id: `C-${300 + courses.length + 1}`,
      name: newCourse.name,
      tutorName: newCourse.tutorName,
      category: newCourse.category,
      studentsCount: 0,
      duration: newCourse.duration,
      mode: newCourse.mode,
      status: "Active"
    };
    setCourses([...courses, created]);
    setShowAddCourse(false);
    setNewCourse({ name: "", tutorName: "", category: "Mathematics", duration: "12 weeks", mode: "Online" });
    triggerToast(`Course "${created.name}" created successfully`);
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.name || !newBatch.courseName || !newBatch.tutorName) {
      triggerToast("Please fill all required fields");
      return;
    }
    const created: Batch = {
      id: `B-${400 + batches.length + 1}`,
      name: newBatch.name,
      courseName: newBatch.courseName,
      tutorName: newBatch.tutorName,
      timings: newBatch.timings,
      days: newBatch.days,
      studentsCount: 0,
      status: "Active"
    };
    setBatches([...batches, created]);
    setShowAddBatch(false);
    setNewBatch({ name: "", courseName: "", tutorName: "", timings: "09:00 AM - 10:30 AM", days: "Monday, Wednesday" });
    triggerToast(`Batch "${created.name}" allocated successfully`);
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFee.studentId || !newFee.title || newFee.amount <= 0 || !newFee.dueDate) {
      triggerToast("Please fill all fields correctly");
      return;
    }
    const targetSt = localStudents.find(s => s.id === newFee.studentId);
    if (!targetSt) {
      triggerToast("Student ID does not exist in roster");
      return;
    }
    try {
      const created = await apiClient.fees.create({
        studentId: newFee.studentId,
        title: newFee.title,
        amount: Number(newFee.amount),
        dueDate: newFee.dueDate
      });
      const createdFee: FeePayment = {
        id: created.feeId || created.id || `FP-${500 + localFees.length + 1}`,
        studentId: targetSt.id,
        studentName: targetSt.name,
        title: created.title,
        amount: created.amount,
        status: created.status || "Pending",
        dueDate: created.dueDate
      };
      setLocalFees([createdFee, ...localFees]);
      setShowAddFee(false);
      setNewFee({ studentId: "", title: "", amount: 0, dueDate: "" });
      triggerToast(`Created outstanding invoice of $${createdFee.amount} for ${createdFee.studentName}`);
    } catch (error) {
      console.warn("Unable to create fee", error);
      triggerToast("Unable to create fee invoice. Please try again.");
    }
  };

  const handleAddNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.title || !newNotification.message) {
      triggerToast("Please write a title and announcement message");
      return;
    }
    const created: SystemNotification = {
      id: `N-${500 + notifications.length + 1}`,
      title: newNotification.title,
      message: newNotification.message,
      target: newNotification.target,
      date: new Date().toISOString().split('T')[0]
    };
    setNotifications([created, ...notifications]);
    setShowAddNotification(false);
    setNewNotification({ title: "", message: "", target: "All" });
    triggerToast(`Broadcasting message to target group: ${created.target}`);
  };

  const handleSendParentContact = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast(`Simulated message sent to parent (${showContactParent}) successfully!`);
    setShowContactParent(null);
    setContactParentMessage({ subject: "", message: "" });
  };

  const handlePublishResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResult.studentId || !newResult.testTitle || !newResult.subject || newResult.score < 0) {
      triggerToast("Please provide valid exam parameters");
      return;
    }
    const targetStIndex = localStudents.findIndex(s => s.id === newResult.studentId);
    if (targetStIndex === -1) {
      triggerToast("Selected Student ID not found");
      return;
    }
    const updated = [...localStudents];
    const scorePct = Math.round((newResult.score / newResult.total) * 100);
    // Append result record to student's results
    updated[targetStIndex].results = [
      {
        term: newResult.term,
        gpa: Number((scorePct / 25).toFixed(2)), // simple conversion
        mathsScore: newResult.subject === "Mathematics" ? scorePct : 90,
        physicsScore: newResult.subject === "Physics" ? scorePct : 85,
        literatureScore: newResult.subject === "Literature" ? scorePct : 92,
        compSciScore: newResult.subject === "Computer Science" ? scorePct : 88
      },
      ...updated[targetStIndex].results
    ];
    setLocalStudents(updated);
    setShowPublishResult(false);
    setNewResult({ studentId: "", term: "Current", testTitle: "", subject: "", score: 0, total: 100 });
    triggerToast("Academic score report recorded and GPA updated successfully!");
  };

  const toggleInvoiceStatus = (id: string) => {
    const updated = localFees.map(f => {
      if (f.id === id) {
        const nextStatus = f.status === "Paid" ? "Pending" : "Paid";
        return {
          ...f,
          status: nextStatus as "Paid" | "Pending",
          transactionId: nextStatus === "Paid" ? `AF-${Math.floor(10000 + Math.random() * 90000)}` : undefined
        };
      }
      return f;
    });
    setLocalFees(updated);
    triggerToast("Invoice ledger transaction status modified!");
  };

  const deleteStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove student ${name} (${id}) from the database?`)) {
      setLocalStudents(localStudents.filter(s => s.id !== id));
      triggerToast(`Removed student ${name} from institutional rosters`);
    }
  };

  const deleteTutor = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove tutor ${name} (${id}) from faculty rosters?`)) {
      setLocalTutors(localTutors.filter(t => t.id !== id));
      triggerToast(`Tutor ${name} deleted`);
    }
  };

  // Initialize attendance checklist roster for standard grade
  const loadAttendanceRoster = () => {
    const gradeStudents = localStudents.filter(s => s.grade === attendanceGrade);
    const roster: Record<string, boolean> = {};
    gradeStudents.forEach(s => {
      roster[s.id] = true; // default present
    });
    setAttendanceRoster(roster);
    triggerToast(`Loaded attendance sheet for ${attendanceGrade}`);
  };

  const saveAttendanceRoster = () => {
    const updated = localStudents.map(s => {
      if (s.grade === attendanceGrade) {
        const isPresent = attendanceRoster[s.id] !== false;
        const nextPresent = s.presentCount + (isPresent ? 1 : 0);
        const nextAbsent = s.absentCount + (isPresent ? 0 : 1);
        const nextTotal = nextPresent + nextAbsent;
        const nextRate = Math.round((nextPresent / nextTotal) * 100);
        return {
          ...s,
          presentCount: nextPresent,
          absentCount: nextAbsent,
          attendanceRate: nextRate
        };
      }
      return s;
    });
    setLocalStudents(updated);
    triggerToast(`Successfully archived attendance log on ${attendanceDate} for ${attendanceGrade}!`);
  };

  // --- FILTERS & COMPUTATIONS ---
  const filteredStudents = localStudents.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === "All" || s.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const filteredTutors = localTutors.filter((t) => {
    return t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.specialty.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredFees = localFees.filter((f) => {
    const matchesSearch = f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = feeStatusFilter === "All" || f.status === feeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.tutorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = courseCategoryFilter === "All" || c.category === courseCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate finance metrics
  const totalPaid = localFees.filter(f => f.status === "Paid").reduce((sum, current) => sum + current.amount, 0);
  const totalPending = localFees.filter(f => f.status === "Pending").reduce((sum, current) => sum + current.amount, 0);
  const averageAttendanceRate = Math.round(localStudents.reduce((sum, curr) => sum + curr.attendanceRate, 0) / localStudents.length);

  return (
    <div className="h-[calc(100dvh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">

      {/* Sidebar Navigation — fixed height; scrolls only if nav overflows */}
      <aside className="w-full md:w-64 bg-[#0b1329] dark:bg-[#070d1d] text-slate-100 flex flex-col p-5 border-r border-[#15254f] shrink-0 md:h-full overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 text-left">
          {/* Logo Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <span className="p-2 bg-[#2563eb] rounded-xl text-white shadow-lg">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="font-extrabold text-sm tracking-widest text-white uppercase">
              Admin Gateway
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-left">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchTerm(""); // reset search on tab change
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive
                      ? "bg-[#2563eb] text-white shadow-md transform scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card Profile Footer */}
        <div className="pt-4 border-t border-white/10 mt-4 shrink-0 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <img
              src="/indian_teacher.png"
              alt="Admin Director"
              className="h-9 w-9 rounded-full object-cover border border-[#2563eb]/30"
            />
            <div>
              <p className="text-xs font-black text-white leading-tight font-sans">Admin Director</p>
              <p className="text-[10px] text-slate-400">Super User</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-[10px] uppercase font-black tracking-wider text-[#2563eb] hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area — scrollable */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 relative text-left">

        {/* Interactive Floating Toast */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 bg-[#0b1329] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-500/20 flex items-center gap-3 animate-fade-in-down">
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{toast}</span>
          </div>
        )}

        {/* Welcome Greeting Board */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
              {activeTab} Management Panel
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === "dashboard"
                ? "Academic registration indices, financials, and console shortcuts."
                : `Interactive administration module containing verified institution ${activeTab}.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {activeTab === "dashboard" && (
              <button
                onClick={() => {
                  setActiveTab("reports");
                  triggerToast("Opening system report archives...");
                }}
                className="px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Analyze School Analytics
              </button>
            )}
            <button
              onClick={onLogout}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Sign Out Portal
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW: DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {/* Card 1: Total Students */}
              <div
                onClick={() => setActiveTab("students")}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28 cursor-pointer hover:shadow-md hover:border-blue-500/20 group transition-all"
              >
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">Total Students</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#2563eb]">
                    {localStudents.length}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold">
                    Active Roster
                  </span>
                </div>
              </div>

              {/* Card 2: Total Tutors */}
              <div
                onClick={() => setActiveTab("tutors")}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28 cursor-pointer hover:shadow-md hover:border-blue-500/20 group transition-all"
              >
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">Total Tutors</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#2563eb]">
                    {localTutors.length}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold">
                    Faculty List
                  </span>
                </div>
              </div>

              {/* Card 3: Total Parents */}
              <div
                onClick={() => setActiveTab("parents")}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28 cursor-pointer hover:shadow-md hover:border-blue-500/20 group transition-all"
              >
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">Total Parents</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#2563eb]">
                    {new Set(localStudents.map(s => s.parentEmail)).size}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold">
                    Registered Accounts
                  </span>
                </div>
              </div>

              {/* Card 4: Revenue */}
              <div
                onClick={() => setActiveTab("fees")}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28 cursor-pointer hover:shadow-md hover:border-emerald-500/20 group transition-all"
              >
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 group-hover:text-emerald-500 transition-colors">Revenue Collected</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-450">
                    ${totalPaid}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 font-bold">
                    ${totalPending} Pending
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Panels layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              {/* Left Column (Col-7) */}
              <div className="lg:col-span-7 space-y-6">

                {/* Students Overview Graph */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Students Overview</h3>
                      <p className="text-xs text-slate-500">Academic registration growth index</p>
                    </div>
                    <span className="text-xs font-bold text-[#2563eb] bg-[#2563eb]/10 px-3 py-1 rounded-lg">This Year</span>
                  </div>

                  {/* Polished Visual Line Graph Representation */}
                  <div className="h-48 w-full relative flex items-end justify-between pt-6 border-b border-l border-slate-100 dark:border-slate-800 px-4">
                    <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
                      <path
                        d="M0,150 Q100,100 200,120 T400,60 T600,40"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3.5"
                      />
                      <circle cx="200" cy="120" r="5" fill="#2563eb" />
                      <circle cx="400" cy="60" r="5" fill="#2563eb" />
                    </svg>
                    <div className="flex justify-between w-full text-[10px] text-slate-400 font-bold mt-2">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                    </div>
                  </div>
                </div>

                {/* Student Directory table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Student Directory & Academic Tracking</h3>
                      <p className="text-xs text-slate-500">Roster records and attendance statistics</p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by student..."
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-xs text-slate-500">
                      <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-[9px] text-slate-400">
                        <tr>
                          <th className="px-4 py-2.5">ID</th>
                          <th className="px-4 py-2.5">Student</th>
                          <th className="px-4 py-2.5">Grade</th>
                          <th className="px-4 py-2.5">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-350">
                        {filteredStudents.slice(0, 5).map((st) => (
                          <tr
                            key={st.id}
                            onClick={() => {
                              setActiveTab("students");
                              setSelectedStudent(st);
                            }}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 font-mono text-blue-500 font-bold">{st.id}</td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white hover:underline">{st.name}</td>
                            <td className="px-4 py-3">{st.grade}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.attendanceRate > 90 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"}`}>
                                {st.attendanceRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column (Col-5) */}
              <div className="lg:col-span-5 space-y-6">

                {/* Top Courses */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Top Courses</h3>

                  <div className="flex items-center gap-6">
                    {/* Circular Chart Placeholder */}
                    <div className="h-28 w-28 rounded-full border-8 border-indigo-500 border-t-emerald-500 flex items-center justify-center font-black text-xs text-slate-900 dark:text-white shrink-0">
                      {courses.length} Courses
                    </div>
                    <div className="space-y-2 text-xs w-full">
                      {courses.slice(0, 3).map((c, i) => {
                        const bgColors = ["bg-emerald-500", "bg-indigo-500", "bg-amber-500"];
                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              setActiveTab("courses");
                              setSelectedCourse(c);
                            }}
                            className="flex justify-between items-center text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors"
                          >
                            <span className="flex items-center gap-1.5 font-medium">
                              <span className={`h-2.5 w-2.5 rounded-full ${bgColors[i % 3]} block`} />
                              {c.name}
                            </span>
                            <span className="font-bold">{c.studentsCount} Students</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Fee Collection Overview */}
                <div
                  onClick={() => setActiveTab("fees")}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 cursor-pointer hover:shadow-md transition-all"
                >
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Fee Collection Overview</h3>

                  {/* Dynamic bar charts representing invoice collections */}
                  <div className="space-y-3">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-700 dark:text-slate-350">
                        <span>Paid Invoices</span>
                        <span className="font-extrabold text-emerald-600">${totalPaid} collected</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${(totalPaid / (totalPaid + totalPending || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-700 dark:text-slate-350">
                        <span>Pending Outstanding</span>
                        <span className="font-extrabold text-rose-500">${totalPending} outstanding</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${(totalPending / (totalPaid + totalPending || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bypass Panel Console Widget */}
                <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase font-black tracking-widest text-[#2563eb] bg-[#2563eb]/10 px-2 py-0.5 rounded w-max">
                    <Terminal className="h-3 w-3 shrink-0" />
                    <span>Bypass Console</span>
                  </div>
                  <h4 className="text-xs font-black">Sandbox Instant Testing Roster Bypass</h4>
                  <p className="text-[10px] text-slate-400">Quickly bypass authentication fields in local testing sandbox</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-[10px]">
                    <button
                      onClick={() => onBypassLogin("student")}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg border border-slate-700 flex items-center justify-between transition-colors"
                    >
                      <span>Student</span>
                      <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                    </button>
                    <button
                      onClick={() => onBypassLogin("parent")}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg border border-slate-700 flex items-center justify-between transition-colors"
                    >
                      <span>Parent</span>
                      <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                    </button>
                    <button
                      onClick={() => onBypassLogin("tutor")}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg border border-slate-700 flex items-center justify-between transition-colors"
                    >
                      <span>Tutor</span>
                      <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: STUDENTS */}
        {/* ========================================================================= */}
        {activeTab === "students" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by student ID or name..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Grade:</span>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="All">All Grades</option>
                    {STANDARDS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowAddStudent(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
              >
                <Plus className="h-4 w-4" /> Enroll New Student
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-[9px] text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Student ID</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Grade & Section</th>
                    <th className="px-5 py-3">Parent Email</th>
                    <th className="px-5 py-3">Attendance Rate</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-blue-500 font-bold">{st.id}</td>
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                      <td className="px-5 py-3">{st.grade} • {st.section}</td>
                      <td className="px-5 py-3 font-medium text-slate-400">{st.parentEmail}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.attendanceRate > 90 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"}`}>
                            {st.attendanceRate}%
                          </span>
                          <span className="text-[10px] text-slate-400">({st.presentCount} present)</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedStudent(st)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                            title="View Profile Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowContactParent(st.parentEmail)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                            title="Contact Parent"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteStudent(st.id, st.name)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Expel Student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-bold">
                        No students found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: TUTORS */}
        {/* ========================================================================= */}
        {activeTab === "tutors" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by specialty or name..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>

              <button
                onClick={() => setShowAddTutor(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 justify-center"
              >
                <Plus className="h-4 w-4" /> Add Faculty Tutor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTutors.map((tutor) => (
                <div key={tutor.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between gap-5 hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-start">
                    <img
                      src={tutor.image}
                      alt={tutor.name}
                      className="h-14 w-14 rounded-full object-cover border-2 border-blue-500/10 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-extrabold text-blue-600 tracking-wider font-mono">{tutor.id}</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{tutor.name}</h4>
                      <p className="text-xs text-slate-400 font-bold">{tutor.specialty}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{tutor.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl">
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400">Assigned</p>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200">{tutor.assignedStudentIds.length} Students</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400">Tasks Workload</p>
                      <p className="text-sm font-black text-slate-850 dark:text-slate-200">{tutor.pendingTasksCount} Pending</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTutor(tutor)}
                      className="flex-grow py-2 text-center text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-xl transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => deleteTutor(tutor.id, tutor.name)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                      title="Remove Faculty"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: PARENTS */}
        {/* ========================================================================= */}
        {activeTab === "parents" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by parent email..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setActiveTab("notifications");
                  triggerToast("Type a message to broadcast to all parents.");
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
              >
                <Bell className="h-4 w-4" /> Broadcast Announcement to Parents
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-[9px] text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Parent Account Email</th>
                    <th className="px-5 py-3">Ward (Student Name)</th>
                    <th className="px-5 py-3">Academic Grade</th>
                    <th className="px-5 py-3">Outstanding Balances</th>
                    <th className="px-5 py-3">Account Status</th>
                    <th className="px-5 py-3 text-center">Contact Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {Array.from(new Set(localStudents.map(s => s.parentEmail))).map((email) => {
                    const studentList = localStudents.filter(s => s.parentEmail === email);
                    const wardNames = studentList.map(s => s.name).join(", ");
                    const wardGrades = studentList.map(s => s.grade).join(", ");
                    const outstanding = localFees.filter(f => f.studentId === studentList[0]?.id && f.status === "Pending").reduce((sum, curr) => sum + curr.amount, 0);

                    return (
                      <tr key={email} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3 font-mono text-slate-900 dark:text-white font-bold">{email}</td>
                        <td className="px-5 py-3 text-blue-500 font-bold">{wardNames}</td>
                        <td className="px-5 py-3">{wardGrades}</td>
                        <td className="px-5 py-3 font-bold text-rose-500">${outstanding}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold">
                            Active Sync
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() => setShowContactParent(email)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-blue-600 text-slate-700 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                            >
                              <Mail className="h-3.5 w-3.5" /> Send Email
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: COURSES */}
        {/* ========================================================================= */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by course name..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <select
                  value={courseCategoryFilter}
                  onChange={(e) => setCourseCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold outline-none interactive"
                >
                  <option value="All">All Grades / Categories</option>
                  {STANDARDS.map((standard) => (
                    <option key={standard} value={standard}>
                      {standard}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowAddCourse(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 justify-center"
              >
                <Plus className="h-4 w-4" /> Create Course Module
              </button>
            </div>

            <p className="text-xs font-bold text-slate-500 px-1">
              Showing {filteredCourses.length} of {courses.length} institutional course modules
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-1">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-md hover:border-blue-500/20 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 rounded text-[9px] font-black uppercase font-mono">{course.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${course.mode === "Online" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"}`}>{course.mode}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{course.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{course.category}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400">Instructor</p>
                      <p className="font-bold text-slate-700 dark:text-slate-350">{course.tutorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-black text-slate-400">Duration</p>
                      <p className="font-bold text-slate-750 dark:text-slate-350">{course.duration}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    <span>Enrolled Roster Count</span>
                    <span className="text-[#2563eb] text-xs font-black">{course.studentsCount} Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: BATCHES */}
        {/* ========================================================================= */}
        {activeTab === "batches" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Institution Active & Upcoming Batches</h3>
              <button
                onClick={() => setShowAddBatch(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Allocate New Batch
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {batches.map((b) => (
                <div key={b.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-blue-600 font-mono tracking-wider">{b.id} • {b.status}</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{b.name}</h4>
                      <p className="text-xs text-slate-400 font-bold">{b.courseName}</p>
                    </div>
                    <span className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400 border border-slate-200 dark:border-slate-850">
                      <Clock className="h-4.5 w-4.5 text-blue-500" />
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <div className="space-y-0.5">
                      <p className="text-[8px] uppercase font-black text-slate-400">Timings Schedule</p>
                      <p className="font-bold text-slate-700 dark:text-slate-350">{b.timings}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] uppercase font-black text-slate-400">Weekly Days</p>
                      <p className="font-bold text-slate-700 dark:text-slate-350">{b.days}</p>
                    </div>
                    <div className="space-y-0.5 col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] uppercase font-black text-slate-400">Assigned Faculty Instructor</p>
                      <p className="font-bold text-slate-900 dark:text-white">{b.tutorName}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Batch Capacity / strength</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/20 rounded-lg">{b.studentsCount} Active Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: ATTENDANCE */}
        {/* ========================================================================= */}
        {activeTab === "attendance" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 block">Target Grade</label>
                  <select
                    value={attendanceGrade}
                    onChange={(e) => setAttendanceGrade(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 block">Attendance Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={loadAttendanceRoster}
                  className="flex-grow sm:flex-grow-0 px-4 py-2 border border-blue-200 text-[#2563eb] bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-850 font-bold text-xs rounded-xl transition-all"
                >
                  Load Roster List
                </button>
                <button
                  onClick={saveAttendanceRoster}
                  className="flex-grow sm:flex-grow-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Log & Archive Attendance
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-[9px] text-slate-400">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Current Attendance Rate</th>
                    <th className="px-5 py-3 text-center">Status (Mark Present)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-350">
                  {localStudents.filter(s => s.grade === attendanceGrade).map((st) => {
                    const isChecked = attendanceRoster[st.id] !== false;
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3 font-mono">{st.id}</td>
                        <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.attendanceRate > 90 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20"}`}>
                            {st.attendanceRate}%
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-center items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setAttendanceRoster({
                                    ...attendanceRoster,
                                    [st.id]: !isChecked
                                  });
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500" />
                              <span className="ml-3 text-xs font-bold text-slate-500">
                                {isChecked ? "Present" : "Absent"}
                              </span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {localStudents.filter(s => s.grade === attendanceGrade).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-400 font-bold">
                        Please load/select a class grade with active registered students.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: RESULTS */}
        {/* ========================================================================= */}
        {activeTab === "results" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Institutional Examination score ledger</h3>
                <p className="text-xs text-slate-500">Add or inspect academic grade points.</p>
              </div>
              <button
                onClick={() => setShowPublishResult(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Publish Exam Score
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-[9px] text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Grade</th>
                    <th className="px-5 py-3">Latest GPA</th>
                    <th className="px-5 py-3">Maths Score</th>
                    <th className="px-5 py-3">Physics Score</th>
                    <th className="px-5 py-3">CompSci Score</th>
                    <th className="px-5 py-3">Literature Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {localStudents.map((st) => {
                    const latestResult = st.results[0] || { gpa: 0, mathsScore: 0, physicsScore: 0, literatureScore: 0, compSciScore: 0 };
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                            <p className="text-[10px] text-slate-450 font-mono">{st.id}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">{st.grade}</td>
                        <td className="px-5 py-3 font-black text-blue-600 dark:text-blue-400">{latestResult.gpa} GPA</td>
                        <td className="px-5 py-3">{latestResult.mathsScore}%</td>
                        <td className="px-5 py-3">{latestResult.physicsScore || "N/A"}%</td>
                        <td className="px-5 py-3">{latestResult.compSciScore || "N/A"}%</td>
                        <td className="px-5 py-3">{latestResult.literatureScore}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: FEES */}
        {/* ========================================================================= */}
        {activeTab === "fees" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by student or invoice..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <select
                  value={feeStatusFilter}
                  onChange={(e) => setFeeStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="All">All Invoices</option>
                  <option value="Paid">Paid Only</option>
                  <option value="Pending">Pending Only</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddFee(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
              >
                <Plus className="h-4 w-4" /> Record Bill Invoice
              </button>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-[9px] text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Invoice ID</th>
                    <th className="px-5 py-3">Student Ward</th>
                    <th className="px-5 py-3">Description Title</th>
                    <th className="px-5 py-3">Invoice Amount</th>
                    <th className="px-5 py-3">Due Date / Tx ID</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-center">Receipt</th>
                    <th className="px-5 py-3 text-center">Ledger Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-350">
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors interactive">
                      <td className="px-5 py-3 font-mono text-[#2563eb] font-bold">{fee.id}</td>
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{fee.studentName}</td>
                      <td className="px-5 py-3 font-medium">{fee.title}</td>
                      <td className="px-5 py-3 font-extrabold text-slate-900 dark:text-white">${fee.amount}</td>
                      <td className="px-5 py-3">
                        {fee.status === "Paid" ? (
                          <span className="text-[10px] text-slate-400 font-mono block">TX: {fee.transactionId}</span>
                        ) : (
                          <span className="text-[10px] text-rose-500 font-bold block">{fee.dueDate}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${fee.status === "Paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {fee.status === "Paid" ? (
                          <button
                            type="button"
                            onClick={() => openFeeReceipt(fee)}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-350 font-black text-[10px] rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1 mx-auto interactive"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleInvoiceStatus(fee.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all interactive ${fee.status === "Paid" ? "bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:bg-slate-800" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                        >
                          {fee.status === "Paid" ? "Mark Pending" : "Mark Paid"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment history — same receipt layout as parent portal */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Payment History & Receipts</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-extrabold">Transaction ID</th>
                      <th className="py-3 px-4 font-extrabold">Student</th>
                      <th className="py-3 px-4 font-extrabold">Payment Date</th>
                      <th className="py-3 px-4 font-extrabold">Paid Amount</th>
                      <th className="py-3 px-4 font-extrabold">Payment Method</th>
                      <th className="py-3 px-4 font-extrabold">Status</th>
                      <th className="py-3 px-4 font-extrabold">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 font-medium">
                    {paidFeesHistory.map(({ fee, receipt }) => (
                      <tr key={fee.id} className="hover:bg-white/60 dark:hover:bg-slate-900/40 interactive">
                        <td className="py-4 px-4 font-bold text-indigo-650 dark:text-indigo-400">{receipt.transactionId}</td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{receipt.studentName}</td>
                        <td className="py-4 px-4">{receipt.paymentDate}</td>
                        <td className="py-4 px-4 font-black">${receipt.amountPaid}</td>
                        <td className="py-4 px-4">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-655 dark:text-slate-350">
                            {receipt.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450">
                            {receipt.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => openFeeReceipt(fee)}
                            className="px-3 py-1.5 bg-[#2563eb]/10 hover:bg-[#2563eb]/20 text-[#2563eb] font-black text-[10px] rounded-lg transition-all cursor-pointer flex items-center gap-1 interactive"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Download Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paidFeesHistory.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-450 font-bold">
                          No paid invoices yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: REPORTS */}
        {/* ========================================================================= */}
        {activeTab === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Institutional KPIs Overview</h4>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Average Student Attendance Rate</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{averageAttendanceRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${averageAttendanceRate}%` }} />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Fee Payment Collection Rate</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {Math.round((totalPaid / (totalPaid + totalPending || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(totalPaid / (totalPaid + totalPending || 1)) * 100}%` }} />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Average Students Per Tutor Ratio</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {(localStudents.length / localTutors.length).toFixed(1)} : 1
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: "45%" }} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Institutional Database Export</h4>
                <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed">
                  Export complete student registrations, faculty schedules, and account financial balances in generic formats.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => triggerToast("Generating PDF academic roster report summary...")}
                  className="px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-opacity text-center"
                >
                  Generate PDF Summary
                </button>
                <button
                  onClick={() => triggerToast("Compiling full students databases to Excel/CSV...")}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-xs rounded-xl transition-colors text-center"
                >
                  Export CSV Ledger
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: NOTIFICATIONS */}
        {/* ========================================================================= */}
        {activeTab === "notifications" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 h-max">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-850">Broadcast Announcement</h3>

              <form onSubmit={handleAddNotification} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block">Notice Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="e.g. June Holiday Roster"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block">Target Audience</label>
                  <select
                    value={newNotification.target}
                    onChange={(e) => setNewNotification({ ...newNotification, target: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    <option value="All">All Audiences</option>
                    <option value="Students">Students Only</option>
                    <option value="Tutors">Faculty Tutors Only</option>
                    <option value="Parents">Parents Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block">Broadcast Message Content</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    rows={4}
                    placeholder="Provide full description of holiday lists, test details, etc."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Broadcast Announcement
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Archived Broadcast Ledger</h3>

              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 rounded text-[9px] font-black uppercase font-mono">{n.target}</span>
                      <span className="text-[9px] text-slate-400 font-bold">{n.date}</span>
                    </div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{n.title}</h5>
                    <p className="text-[10px] text-slate-500 leading-normal">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl space-y-6">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-850">System Configurations</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block">Institution Display Name</label>
                  <input
                    type="text"
                    value={settings.schoolName}
                    onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block">Official Limit Domain</label>
                  <input
                    type="text"
                    value={settings.domain}
                    onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white font-bold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 block">Academic Calendar Roster</label>
                <input
                  type="text"
                  value={settings.calendar}
                  onChange={(e) => setSettings({ ...settings, calendar: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-850 dark:text-white">Enforce 2-Factor Authentication (2FA)</p>
                    <p className="text-[10px] text-slate-400">Requires tutors to verify phone codes before login.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.twoFactor}
                    onChange={(e) => setSettings({ ...settings, twoFactor: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded border-slate-350 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-50 dark:border-slate-850">
                  <div>
                    <p className="font-bold text-slate-850 dark:text-white">Automated Invoicing</p>
                    <p className="text-[10px] text-slate-400">Generate tuition invoice entries on the first of each month.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoInvoice}
                    onChange={(e) => setSettings({ ...settings, autoInvoice: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded border-slate-350 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => triggerToast("System administration parameters updated successfully!")}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md mt-6"
              >
                Save All configurations
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: VIEW STUDENT DETAILS */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-200 font-mono">{selectedStudent.id}</span>
                <h3 className="text-xl font-black">{selectedStudent.name}</h3>
                <p className="text-xs text-indigo-100 font-medium">{selectedStudent.grade} • {selectedStudent.section}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-grow text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  <span className="text-[9px] uppercase font-black text-slate-400 block">Attendance rate</span>
                  <span className="text-xl font-black text-[#2563eb]">{selectedStudent.attendanceRate}%</span>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">({selectedStudent.presentCount} present, {selectedStudent.absentCount} absent)</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  <span className="text-[9px] uppercase font-black text-slate-400 block">Parent Contact Sync</span>
                  <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 block truncate mt-1">{selectedStudent.parentEmail}</span>
                  <button
                    onClick={() => {
                      setShowContactParent(selectedStudent.parentEmail);
                      setSelectedStudent(null);
                    }}
                    className="text-[10px] text-blue-500 font-bold hover:underline mt-2 block"
                  >
                    Send Email Notification
                  </button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  <span className="text-[9px] uppercase font-black text-slate-400 block">Academic standing</span>
                  <span className="text-xl font-black text-emerald-600">{(selectedStudent.results[0]?.gpa || 4.0)} GPA</span>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Excellent Performance</p>
                </div>
              </div>

              {/* Class timings & Subjects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Class Timings & Enrolled Subjects</h4>
                  <div className="space-y-2">
                    {selectedStudent.classTimings.map((time, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{time.subject}</p>
                          <p className="text-[10px] text-slate-400">{time.day} • {time.time}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 rounded text-[9px] font-bold">{time.mode}</span>
                      </div>
                    ))}
                    {selectedStudent.classTimings.length === 0 && (
                      <p className="text-slate-400 italic">No class timings registered.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Latest Course Learning Progress</h4>
                  <div className="space-y-3">
                    {selectedStudent.learningSubjects.map((sub, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-750 dark:text-slate-300">
                          <span>{sub.name}</span>
                          <span>{sub.completedPercentage}% ({sub.completedWeeks} wks)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${sub.completedPercentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW TUTOR PROFILE DETAILS */}
      {/* ========================================================================= */}
      {selectedTutor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left flex flex-col">
            <div className="p-6 bg-[#0b1329] text-white flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <img
                  src={selectedTutor.image}
                  alt={selectedTutor.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-blue-500"
                />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-blue-400 font-mono">{selectedTutor.id}</span>
                  <h3 className="text-lg font-black">{selectedTutor.name}</h3>
                  <p className="text-xs text-slate-400 font-bold">{selectedTutor.specialty}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTutor(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Faculty Email Contact</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTutor.email}</span>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-850">
                <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Assigned Student Wards Roster</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTutor.assignedStudentIds.map((id) => {
                    const student = localStudents.find(s => s.id === id);
                    return (
                      <div key={id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                          {student?.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{student?.name || id}</p>
                          <p className="text-[9px] text-slate-450">{student?.grade || "Grade Level"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setSelectedTutor(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Dismiss Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW COURSE ENROLLMENTS */}
      {/* ========================================================================= */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 font-mono">{selectedCourse.id} • {selectedCourse.category}</span>
                <h3 className="text-lg font-black">{selectedCourse.name}</h3>
                <p className="text-xs text-slate-400 font-medium">Enrolled: {selectedCourse.studentsCount} Active Students</p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Class Enrolled Roster</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {localStudents.filter(s => s.learningSubjects.some(sub => sub.name.toLowerCase().includes(selectedCourse.name.toLowerCase()))).map((st) => (
                  <div key={st.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{st.name}</p>
                      <p className="text-[9px] text-slate-450 font-mono">{st.id} • {st.grade}</p>
                    </div>
                    <span className="text-slate-500 font-bold">{st.attendanceRate}% Attendance</span>
                  </div>
                ))}
                {localStudents.filter(s => s.learningSubjects.some(sub => sub.name.toLowerCase().includes(selectedCourse.name.toLowerCase()))).length === 0 && (
                  <p className="text-slate-450 italic py-4">No student records enrolled in this course module currently.</p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Close Catalog View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ENROLL NEW STUDENT */}
      {/* ========================================================================= */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddStudent} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-md font-black">Enroll Student to Registry</h3>
              <button type="button" onClick={() => setShowAddStudent(false)} className="text-white hover:opacity-80"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Full Student Name</label>
                <input
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="e.g. Samuel Henderson"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Grade Level</label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Section Stream</label>
                  <input
                    type="text"
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    placeholder="e.g. STEM / Section B"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Parent Link Email</label>
                <input
                  type="email"
                  required
                  value={newStudent.parentEmail}
                  onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                  placeholder="e.g. parent.email@domain.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Complete Enrollment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD TUTOR */}
      {/* ========================================================================= */}
      {showAddTutor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddTutor} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-md font-black">Add Faculty Tutor</h3>
              <button type="button" onClick={() => setShowAddTutor(false)} className="text-white hover:opacity-80"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Full Faculty Name</label>
                <input
                  type="text"
                  required
                  value={newTutor.name}
                  onChange={(e) => setNewTutor({ ...newTutor, name: e.target.value })}
                  placeholder="e.g. Prof. David Miller"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Academic Specialty</label>
                <input
                  type="text"
                  required
                  value={newTutor.specialty}
                  onChange={(e) => setNewTutor({ ...newTutor, specialty: e.target.value })}
                  placeholder="e.g. Inorganic Chemistry Specialist"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Faculty Email Address</label>
                <input
                  type="email"
                  required
                  value={newTutor.email}
                  onChange={(e) => setNewTutor({ ...newTutor, email: e.target.value })}
                  placeholder="e.g. david.miller@academyflow.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddTutor(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Complete Tutor Setup
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE COURSE MODULE */}
      {/* ========================================================================= */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddCourse} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-md font-black">Create Course Catalog Item</h3>
              <button type="button" onClick={() => setShowAddCourse(false)} className="text-white hover:opacity-80"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Course Subject Title</label>
                <input
                  type="text"
                  required
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  placeholder="e.g. Molecular Chemistry 101"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Category Tag</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Science">Science</option>
                    <option value="Literature">Literature</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Class Mode</label>
                  <select
                    value={newCourse.mode}
                    onChange={(e) => setNewCourse({ ...newCourse, mode: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Assigned Instructor Faculty</label>
                <select
                  value={newCourse.tutorName}
                  onChange={(e) => setNewCourse({ ...newCourse, tutorName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                >
                  <option value="">Select Instructor...</option>
                  {localTutors.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Duration Range</label>
                <input
                  type="text"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  placeholder="e.g. 12 weeks"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddCourse(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Create Module
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ALLOCATE BATCH */}
      {/* ========================================================================= */}
      {showAddBatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddBatch} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-md font-black">Allocate New Batch Schedule</h3>
              <button type="button" onClick={() => setShowAddBatch(false)} className="text-white hover:opacity-80"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Batch Code Name</label>
                <input
                  type="text"
                  required
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  placeholder="e.g. Batch D - Science Roster"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Target Course Module</label>
                <select
                  value={newBatch.courseName}
                  onChange={(e) => setNewBatch({ ...newBatch, courseName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                >
                  <option value="">Select Course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Assigned Instructor Faculty</label>
                <select
                  value={newBatch.tutorName}
                  onChange={(e) => setNewBatch({ ...newBatch, tutorName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                >
                  <option value="">Select Instructor...</option>
                  {localTutors.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Weekly Days</label>
                  <input
                    type="text"
                    required
                    value={newBatch.days}
                    onChange={(e) => setNewBatch({ ...newBatch, days: e.target.value })}
                    placeholder="Monday, Wednesday"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Hours Timing</label>
                  <input
                    type="text"
                    required
                    value={newBatch.timings}
                    onChange={(e) => setNewBatch({ ...newBatch, timings: e.target.value })}
                    placeholder="09:00 AM - 10:30 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddBatch(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Allocate Batch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD BILL INVOICE */}
      {/* ========================================================================= */}
      {showAddFee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddFee} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-md font-black">Record Bill Fee Invoice</h3>
              <button type="button" onClick={() => setShowAddFee(false)} className="text-white hover:opacity-80"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Target Student Ward</label>
                <select
                  required
                  value={newFee.studentId}
                  onChange={(e) => setNewFee({ ...newFee, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                >
                  <option value="">Select Student...</option>
                  {localStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Description Title</label>
                <input
                  type="text"
                  required
                  value={newFee.title}
                  onChange={(e) => setNewFee({ ...newFee, title: e.target.value })}
                  placeholder="e.g. Tuition Fee June / Books Fee"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Invoice Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={newFee.amount}
                    onChange={(e) => setNewFee({ ...newFee, amount: Number(e.target.value) })}
                    placeholder="1200"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newFee.dueDate}
                    onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddFee(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Publish Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONTACT PARENT */}
      {/* ========================================================================= */}
      {showContactParent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSendParentContact} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-md font-black">Contact Account Parent</h3>
                <p className="text-[10px] text-slate-400">Sending to: {showContactParent}</p>
              </div>
              <button type="button" onClick={() => setShowContactParent(null)} className="text-white hover:opacity-80"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Mail Subject</label>
                <input
                  type="text"
                  required
                  value={contactParentMessage.subject}
                  onChange={(e) => setContactParentMessage({ ...contactParentMessage, subject: e.target.value })}
                  placeholder="e.g. Warning: Low Attendance Rate / Outstanding balance"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Mail Message Body</label>
                <textarea
                  required
                  value={contactParentMessage.message}
                  onChange={(e) => setContactParentMessage({ ...contactParentMessage, message: e.target.value })}
                  rows={5}
                  placeholder="Type official notification body here..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowContactParent(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Dispatch Mail
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PUBLISH EXAM SCORE */}
      {/* ========================================================================= */}
      {showPublishResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handlePublishResult} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-md font-black">Publish Exam Score Report</h3>
              <button type="button" onClick={() => setShowPublishResult(false)} className="text-white hover:opacity-80"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Target Student</label>
                <select
                  required
                  value={newResult.studentId}
                  onChange={(e) => setNewResult({ ...newResult, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none font-bold"
                >
                  <option value="">Select Student...</option>
                  {localStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Term Period</label>
                  <select
                    value={newResult.term}
                    onChange={(e) => setNewResult({ ...newResult, term: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    <option value="Current">Current Term</option>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Subject Category</label>
                  <select
                    value={newResult.subject}
                    onChange={(e) => setNewResult({ ...newResult, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    <option value="">Select Subject...</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Literature">Literature</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Test / Exam Title</label>
                <input
                  type="text"
                  required
                  value={newResult.testTitle}
                  onChange={(e) => setNewResult({ ...newResult, testTitle: e.target.value })}
                  placeholder="e.g. Calculus Derivatives Unit Test"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Score Obtained</label>
                  <input
                    type="number"
                    required
                    value={newResult.score}
                    onChange={(e) => setNewResult({ ...newResult, score: Number(e.target.value) })}
                    placeholder="85"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={newResult.total}
                    onChange={(e) => setNewResult({ ...newResult, total: Number(e.target.value) })}
                    placeholder="100"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPublishResult(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Publish Result Score
              </button>
            </div>
          </form>
        </div>
      )}

      <FeeReceiptModal
        isOpen={isReceiptModalOpen}
        receiptData={receiptData}
        onClose={() => setIsReceiptModalOpen(false)}
      />

    </div>
  );
}