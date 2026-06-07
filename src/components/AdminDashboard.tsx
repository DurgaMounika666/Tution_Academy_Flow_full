/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import {
  ShieldCheck, Search, Users, ShieldAlert, DollarSign, MapPin,
  BookOpen, Mail, Terminal, Lock, CheckCircle2, ChevronRight, BarChart3, TrendingUp,
  LayoutDashboard, FileText, Bell, Settings, Award, PlusCircle, ArrowUpRight,
  Plus, Trash2, Edit3, Filter, Check, X, Send, Volume2, UserCheck, Calendar,
  Clock, CheckCircle, AlertCircle, Eye, CreditCard, School, PanelLeftClose, PanelLeftOpen, CalendarCheck
} from "lucide-react";
import { apiClient } from "../services/apiClient";
import { normalizeStudent, normalizeTutor, normalizeFee } from "../utils/normalizers";
import { Student, Tutor, FeePayment, RegistrationNotification } from "../types";
import { STANDARDS } from "../data";
import { buildAllCoursesFromCatalog, CatalogCourse } from "../utils/courseCatalog";
import { buildFeeReceiptFromPayment, FeeReceiptData } from "../utils/feeReceipt";
import { FeeReceiptModal } from "./FeeReceiptModal";
import { Footer } from "./Footer";
import { FooterNavigation } from "./FooterNavigation";

interface AdminDashboardProps {
  students: Student[];
  tutors: Tutor[];
  fees: FeePayment[];
  registrationNotifications: RegistrationNotification[];
  onRegistrationDecision: (id: string, status: "Accepted" | "Rejected") => void;
  onRefreshStudents: () => Promise<void>;
  onRefreshTutors: () => Promise<void>;
  onRefreshFees: () => Promise<void>;
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
  students, tutors, fees, registrationNotifications, onRegistrationDecision, onRefreshStudents, onRefreshTutors, onRefreshFees, onBypassLogin, onLogout
}: AdminDashboardProps) {

  // Main Tabs Configuration
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const mainPanelRef = useRef<HTMLElement | null>(null);

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
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [demoBookings, setDemoBookings] = useState<any[]>([]);
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

  // Registrations State
  const [backendRegistrations, setBackendRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [regStatusFilter, setRegStatusFilter] = useState<"Pending Approval" | "Approved" | "Rejected" | "All">("Pending Approval");

  // Timetable State
  const [timetableSummary, setTimetableSummary] = useState<any[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);

  // New Schedule fields
  const [newSchedule, setNewSchedule] = useState({
    tutorId: "",
    subject: "",
    grade: "9th Class",
    day: "Monday",
    startTime: "09:00 AM",
    endTime: "10:30 AM",
    mode: "Offline" as "Online" | "Offline",
    room: "Room 101",
    assignedStudentIds: [] as string[]
  });

  useEffect(() => {
    setLocalStudents(students);
    setCourses(buildAllCoursesFromCatalog(students));
  }, [students]);

  useEffect(() => {
    setLocalTutors(tutors);
  }, [tutors]);

  useEffect(() => {
    setLocalFees(fees);
  }, [fees]);

  useEffect(() => {
    if (activeTab === "timetable") {
      fetchTimetableData();
    }
    if (activeTab === "fees") {
      fetchPendingApprovals();
    }
    if (activeTab === "registrations") {
      fetchBackendRegistrations();
    }
    if (activeTab === "demo-bookings") {
      fetchDemoBookings();
    }
  }, [activeTab]);

  const fetchDemoBookings = async () => {
    try {
      const data = await apiClient.bookings.getAllDemoBookings();
      setDemoBookings(Array.isArray(data) ? data : []);
    } catch {
      setDemoBookings([]);
    }
  };

  const fetchBackendRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      const data = await apiClient.registrations.getAll();
      setBackendRegistrations(Array.isArray(data) ? data : []);
    } catch {
      setBackendRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleBackendRegistrationDecision = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await apiClient.registrations.updateStatus(id, status);
      triggerToast(`Registration ${status.toLowerCase()} successfully`);
      await fetchBackendRegistrations();
    } catch (error: any) {
      triggerToast(error.message || `Failed to ${status.toLowerCase()} registration`);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const data = await apiClient.fees.getPendingApprovals();
      setPendingApprovals(data);
    } catch {
      setPendingApprovals([]);
    }
  };

  const handleApproval = async (feeId: string, status: "Approved" | "Rejected") => {
    try {
      await apiClient.fees.updateApproval(feeId, status);
      triggerToast(`Registration request ${status.toLowerCase()}`);
      await fetchPendingApprovals();
      await onRefreshFees();
    } catch (error: any) {
      triggerToast(error.message || "Failed to update approval");
    }
  };

  const handleRegistrationDecision = (id: string, status: "Accepted" | "Rejected") => {
    onRegistrationDecision(id, status);
    triggerToast(`Registration request ${status.toLowerCase()}`);
  };

  const handleSaveTutorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTutor) return;
    try {
      await apiClient.tutors.update(editingTutor.id, {
        name: editingTutor.name,
        specialty: editingTutor.specialty,
        email: editingTutor.email,
      });
      setLocalTutors(localTutors.map((t) => (t.id === editingTutor.id ? editingTutor : t)));
      await onRefreshTutors();
      setEditingTutor(null);
      setSelectedTutor(null);
      triggerToast("Tutor details updated successfully");
    } catch (error: any) {
      triggerToast(error.message || "Failed to update tutor");
    }
  };

  const fetchTimetableData = async () => {
    setLoadingTimetable(true);
    try {
      const data = await apiClient.timetable.getSummary();
      setTimetableSummary(data);
    } catch (err) {
      console.error("Failed to load timetable summary", err);
      triggerToast("Failed to retrieve timetable data.");
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.tutorId || !newSchedule.subject || !newSchedule.day || !newSchedule.startTime || !newSchedule.endTime) {
      triggerToast("Please fill all required fields");
      return;
    }
    try {
      await apiClient.timetable.create(newSchedule);
      setShowAddSchedule(false);
      setNewSchedule({
        tutorId: "",
        subject: "",
        grade: "9th Class",
        day: "Monday",
        startTime: "09:00 AM",
        endTime: "10:30 AM",
        mode: "Offline",
        room: "Room 101",
        assignedStudentIds: []
      });
      triggerToast("Schedule created successfully!");
      await fetchTimetableData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to create schedule.");
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;
    try {
      await apiClient.timetable.update(editingSchedule.scheduleId, editingSchedule);
      setShowEditSchedule(false);
      setEditingSchedule(null);
      triggerToast("Schedule updated successfully!");
      await fetchTimetableData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to update schedule.");
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm("Are you sure you want to deactivate/delete this class schedule?")) {
      try {
        await apiClient.timetable.delete(scheduleId);
        triggerToast("Schedule deleted successfully!");
        await fetchTimetableData();
      } catch (err: any) {
        triggerToast(err.message || "Failed to delete schedule.");
      }
    }
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "registrations", label: "Registrations", icon: UserCheck },
    { id: "demo-bookings", label: "Demo Bookings", icon: CalendarCheck },
    { id: "students", label: "Students", icon: Users },
    { id: "tutors", label: "Tutors", icon: BookOpen },
    { id: "parents", label: "Parents", icon: Users },
    { id: "courses", label: "Courses", icon: FileText },
    { id: "batches", label: "Batches", icon: PlusCircle },
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "attendance", label: "Attendance", icon: ClockIcon },
    { id: "results", label: "Results", icon: Award },
    { id: "fees", label: "Fees", icon: DollarSign },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchTerm("");
    if (mainPanelRef.current) mainPanelRef.current.scrollTop = 0;
  };

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
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.parentEmail) {
      triggerToast("Please fill all required fields");
      return;
    }
    try {
      const response = await apiClient.students.create({
        name: newStudent.name,
        grade: newStudent.grade,
        section: newStudent.section,
        parentEmail: newStudent.parentEmail.toLowerCase(),
        assignedTutorIds: localTutors[0] ? [localTutors[0].id] : [],
        learningSubjects: ["Mathematics"],
      });
      const created = response.student ? normalizeStudent(response.student) : null;
      if (created) {
        setLocalStudents([...localStudents, created]);
      }
      await onRefreshStudents();
      setShowAddStudent(false);
      setNewStudent({ name: "", grade: "9th Class", section: "Section A", parentEmail: "" });
      triggerToast(`Successfully enrolled student ${newStudent.name}`);
    } catch (error: any) {
      triggerToast(error.message || "Failed to create student");
    }
  };

  const handleAddTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutor.name || !newTutor.email) {
      triggerToast("Please fill all required fields");
      return;
    }
    try {
      const response = await apiClient.tutors.create({
        name: newTutor.name,
        specialty: newTutor.specialty || "General Educator",
        email: newTutor.email.toLowerCase(),
      });
      const created = response.tutor ? normalizeTutor(response.tutor) : null;
      if (created) {
        setLocalTutors([...localTutors, created]);
      }
      await onRefreshTutors();
      setShowAddTutor(false);
      setNewTutor({ name: "", specialty: "", email: "" });
      triggerToast(`Successfully added Tutor ${newTutor.name}`);
    } catch (error: any) {
      triggerToast(error.message || "Failed to create tutor");
    }
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
      const response = await apiClient.fees.create({
        studentId: newFee.studentId,
        title: newFee.title,
        amount: Number(newFee.amount),
        dueDate: newFee.dueDate
      });
      const feeData = response.fee || response;
      const createdFee: FeePayment = normalizeFee(feeData);
      setLocalFees([createdFee, ...localFees]);
      await onRefreshFees();
      setShowAddFee(false);
      setNewFee({ studentId: "", title: "", amount: 0, dueDate: "" });
      triggerToast(`Created outstanding invoice of $${createdFee.amount} for ${targetSt.name}`);
    } catch (error: any) {
      console.warn("Unable to create fee", error);
      triggerToast(error.message || "Unable to create fee invoice. Please try again.");
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

  const toggleInvoiceStatus = async (id: string) => {
    const target = localFees.find(f => f.id === id);
    if (!target) return;
    try {
      if (target.status === "Pending") {
        const response = await apiClient.fees.markAsPaid(id);
        const updatedFee = normalizeFee(response.fee || response);
        setLocalFees(localFees.map(f => f.id === id ? updatedFee : f));
      } else {
        triggerToast("Cannot revert a paid invoice via API");
        return;
      }
      await onRefreshFees();
      triggerToast("Invoice ledger transaction status modified!");
    } catch (error: any) {
      triggerToast(error.message || "Failed to update invoice status");
    }
  };

  const deleteStudent = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove student ${name} (${id}) from the database?`)) {
      try {
        await apiClient.students.delete(id);
        setLocalStudents(localStudents.filter(s => s.id !== id));
        await onRefreshStudents();
        triggerToast(`Removed student ${name} from institutional rosters`);
      } catch (error: any) {
        triggerToast(error.message || "Failed to delete student");
      }
    }
  };

  const deleteTutor = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove tutor ${name} (${id}) from faculty rosters?`)) {
      try {
        await apiClient.tutors.delete(id);
        setLocalTutors(localTutors.filter(t => t.id !== id));
        await onRefreshTutors();
        triggerToast(`Tutor ${name} deleted`);
      } catch (error: any) {
        triggerToast(error.message || "Failed to delete tutor");
      }
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

  const saveAttendanceRoster = async () => {
    try {
      for (const s of localStudents.filter(st => st.grade === attendanceGrade)) {
        const isPresent = attendanceRoster[s.id] !== false;
        const nextPresent = s.presentCount + (isPresent ? 1 : 0);
        const nextAbsent = s.absentCount + (isPresent ? 0 : 1);
        await apiClient.students.update(s.id, {
          presentCount: nextPresent,
          absentCount: nextAbsent,
          attendanceRate: Math.round((nextPresent / (nextPresent + nextAbsent)) * 100),
        });
        await apiClient.attendance.mark(s.id, attendanceDate, isPresent ? "Present" : "Absent");
      }
      await onRefreshStudents();
      triggerToast(`Successfully archived attendance log on ${attendanceDate} for ${attendanceGrade}!`);
    } catch (error: any) {
      triggerToast(error.message || "Failed to save attendance");
    }
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
    <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">

      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? "w-full md:w-64" : "w-0 md:w-0 p-0 overflow-hidden"} bg-[#0b1329] dark:bg-[#070d1d] text-slate-100 flex flex-col ${sidebarOpen ? "p-5" : ""} border-r border-[#15254f] shrink-0 md:h-full transition-all duration-300`}>
        {sidebarOpen && (<>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 text-left modal-scroll">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-[#2563eb] rounded-xl text-white shadow-lg">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="font-extrabold text-sm tracking-widest text-white uppercase">
                Admin Gateway
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Close panel"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-left">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const pendingCount = item.id === "registrations"
                ? (backendRegistrations.filter(r => r.registrationStatus === "Pending Approval").length ||
                   registrationNotifications.filter(n => n.status === "Pending").length)
                : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive
                      ? "bg-[#2563eb] text-white shadow-md transform scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {pendingCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {pendingCount > 9 ? "9+" : pendingCount}
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
              src="/indian_teacher.png"
              alt="Admin Director"
              className="h-9 w-9 rounded-full object-cover border border-[#2563eb]/30"
            />
            <div>
              <p className="text-xs font-black text-white leading-tight font-sans">Admin Director</p>
              <p className="text-[10px] text-slate-400">Super User</p>
            </div>
          </div>
        </div>
        </>)}
      </aside>

      {/* Sidebar open button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-2 z-40 p-2 bg-[#0b1329] border border-[#15254f] rounded-xl text-slate-300 hover:text-white hover:bg-[#15254f] transition-colors shadow-lg"
          title="Open panel"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      <main ref={mainPanelRef} data-scroll-container className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 space-y-6 relative text-left">

        <FooterNavigation
          onBack={() => {
            const currentIdx = sidebarItems.findIndex((item) => item.id === activeTab);
            if (currentIdx > 0) {
              handleTabChange(sidebarItems[currentIdx - 1].id);
            } else {
              window.history.back();
            }
          }}
          onContinue={() => {
            const currentIdx = sidebarItems.findIndex((item) => item.id === activeTab);
            if (currentIdx < sidebarItems.length - 1) {
              handleTabChange(sidebarItems[currentIdx + 1].id);
            }
          }}
          backDisabled={activeTab === sidebarItems[0].id && window.history.length <= 1}
          continueDisabled={activeTab === sidebarItems[sidebarItems.length - 1].id}
        />

        {/* Interactive Floating Toast */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 bg-[#0b1329] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-500/20 flex items-center gap-3 animate-fade-in-down">
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{toast}</span>
          </div>
        )}

        {/* Welcome Greeting Board */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left mt-8">
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

            {registrationNotifications.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-amber-200 dark:border-amber-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-300">Registration Notifications</h3>
                    <p className="text-xs text-slate-500">New parent/student registration requests awaiting admin review.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notifications")}
                    className="px-3 py-2 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 text-[10px] font-black"
                  >
                    View All Requests
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {registrationNotifications.slice(0, 4).map((request) => (
                    <div key={request.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{request.name}</p>
                          <p className="text-[10px] text-slate-500">{request.role} - {request.studentClass}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${request.status === "Pending" ? "bg-amber-100 text-amber-700" : request.status === "Accepted" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                        <span>Email: {request.email}</span>
                        <span>Mobile: {request.mobileNumber}</span>
                        <span>Class: {request.studentClass}</span>
                        <span>{request.registrationDateTime}</span>
                      </div>
                      {request.status === "Pending" && (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleRegistrationDecision(request.id, "Accepted")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg">Accept</button>
                          <button type="button" onClick={() => handleRegistrationDecision(request.id, "Rejected")} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg">Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

                  <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
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

                  {(() => {
                    const topCourses = [...courses].sort((a, b) => b.studentsCount - a.studentsCount).filter(c => c.studentsCount > 0).slice(0, 3);
                    const totalEnrolled = topCourses.reduce((sum, c) => sum + c.studentsCount, 0);
                    const chartColors = ["#10b981", "#6366f1", "#f59e0b"];
                    
                    // Build conic gradient segments
                    let gradientParts: string[] = [];
                    let currentAngle = 0;
                    topCourses.forEach((c, i) => {
                      const percentage = totalEnrolled > 0 ? (c.studentsCount / totalEnrolled) * 360 : 0;
                      gradientParts.push(`${chartColors[i]} ${currentAngle}deg ${currentAngle + percentage}deg`);
                      currentAngle += percentage;
                    });
                    if (currentAngle < 360) {
                      gradientParts.push(`#e2e8f0 ${currentAngle}deg 360deg`);
                    }
                    const gradient = totalEnrolled > 0 
                      ? `conic-gradient(${gradientParts.join(", ")})`
                      : "conic-gradient(#e2e8f0 0deg 360deg)";

                    return (
                      <div className="flex items-center gap-6">
                        <div
                          className="h-28 w-28 rounded-full flex items-center justify-center shrink-0 relative"
                          style={{ background: gradient }}
                        >
                          <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                            <span className="font-black text-[10px] text-slate-900 dark:text-white text-center leading-tight">
                              {totalEnrolled}<br/><span className="text-[8px] text-slate-400 font-bold">Students</span>
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs w-full">
                          {topCourses.length === 0 ? (
                            <p className="text-slate-400 text-[10px]">No student enrollments yet</p>
                          ) : (
                            topCourses.map((c, i) => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setActiveTab("courses");
                                  setSelectedCourse(c);
                                }}
                                className="flex justify-between items-center text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors"
                              >
                                <span className="flex items-center gap-1.5 font-medium">
                                  <span className="h-2.5 w-2.5 rounded-full block" style={{ backgroundColor: chartColors[i] }} />
                                  {c.name}
                                </span>
                                <span className="font-bold">{c.studentsCount} Students</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}
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
        {/* VIEW: DEMO BOOKINGS */}
        {/* ========================================================================= */}
        {activeTab === "demo-bookings" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Demo Booking Requests</h3>
                <p className="text-[10px] text-slate-500 mt-1">All demo sessions booked by prospective parents/students</p>
              </div>
              <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-black">
                {demoBookings.length} Bookings
              </span>
            </div>

            {demoBookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <CalendarCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">No demo bookings yet</p>
                <p className="text-xs text-slate-400 mt-1">When users book a demo from the landing page, they will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoBookings.map((booking: any, idx: number) => (
                  <div key={booking._id || idx} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{booking.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{booking.email}</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-[9px] font-black uppercase">
                        Booked
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[8px] uppercase font-black text-slate-400">Phone</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{booking.whatsappNumber}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase font-black text-slate-400">Class</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{booking.studentClass || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase font-black text-slate-400">Course</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{booking.course}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase font-black text-slate-400">Preferred Date</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : "N/A"}</p>
                      </div>
                      {booking.location && (
                        <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[8px] uppercase font-black text-slate-400">Center</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300">{booking.location}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Booked on: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "Unknown"}
                    </p>
                  </div>
                ))}
              </div>
            )}
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

            <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
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

            <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[70vh] overflow-hidden pr-1">
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
        {/* VIEW: TIMETABLE */}
        {/* ========================================================================= */}
        {activeTab === "timetable" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Class Timetable & Faculty Schedules</h3>
                <p className="text-xs text-slate-500">Manage time slots, assign rooms, and link students to class sessions.</p>
              </div>
              <button
                onClick={() => {
                  const firstTutorId = localTutors[0]?.id || "";
                  setNewSchedule(prev => ({ ...prev, tutorId: firstTutorId }));
                  setShowAddSchedule(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Create Timetable Slot
              </button>
            </div>

            {loadingTimetable ? (
              <div className="text-center py-12 text-slate-400 font-bold">
                Loading timetable summary data...
              </div>
            ) : (
              <div className="space-y-6">
                {timetableSummary.map((summary) => (
                  <div key={summary.tutorId} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {summary.tutorName[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{summary.tutorName}</h4>
                          <p className="text-[10px] text-slate-450 font-mono">{summary.tutorId} • {summary.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2.5 py-1 rounded-lg font-bold">
                          {summary.totalSchedules} active classes
                        </span>
                      </div>
                    </div>

                    {summary.schedules.length === 0 ? (
                      <p className="text-slate-400 text-xs italic">No class schedules assigned to this tutor yet.</p>
                    ) : (
                      <div className="overflow-hidden font-sans">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-450 border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-[9px]">
                              <th className="py-2 px-2">Subject</th>
                              <th className="py-2 px-2">Grade</th>
                              <th className="py-2 px-2">Day & Time</th>
                              <th className="py-2 px-2">Mode & Room</th>
                              <th className="py-2 px-2">Enrolled Wards</th>
                              <th className="py-2 px-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 font-semibold text-slate-700 dark:text-slate-350">
                            {summary.schedules.map((sch: any) => (
                              <tr key={sch.scheduleId} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                                <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{sch.subject}</td>
                                <td className="py-3 px-2">{sch.grade}</td>
                                <td className="py-3 px-2 font-bold text-indigo-650 dark:text-indigo-400">
                                  {sch.day} <span className="text-[10px] text-slate-450 block font-normal">{sch.startTime} - {sch.endTime}</span>
                                </td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sch.mode === 'Online' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'}`}>
                                    {sch.mode}
                                  </span>
                                  <span className="text-[10px] text-slate-450 block font-mono mt-0.5">{sch.room || "N/A"}</span>
                                </td>
                                <td className="py-3 px-2">
                                  <div className="flex flex-wrap gap-1">
                                    {(sch.assignedStudentIds || []).map((sid: string) => {
                                      const st = localStudents.find(s => s.id === sid);
                                      return (
                                        <span key={sid} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[9px]" title={st?.name || sid}>
                                          {st?.name || sid}
                                        </span>
                                      );
                                    })}
                                    {(!sch.assignedStudentIds || sch.assignedStudentIds.length === 0) && (
                                      <span className="text-slate-400 italic">None</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingSchedule({ ...sch });
                                        setShowEditSchedule(true);
                                      }}
                                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg"
                                      title="Edit Slot"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSchedule(sch.scheduleId)}
                                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                                      title="Delete Slot"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
                {timetableSummary.length === 0 && (
                  <div className="text-center py-8 text-slate-400 font-bold">
                    No faculty timetable records found.
                  </div>
                )}
              </div>
            )}
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

            <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
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

            <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
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
            {pendingApprovals.length > 0 && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-5 space-y-3">
                <h3 className="text-sm font-black text-amber-800 dark:text-amber-300">Registration Advance Fee — Pending Approval</h3>
                {pendingApprovals.map((fee: any) => (
                  <div key={fee.feeId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-100 dark:border-amber-900">
                    <div className="text-xs">
                      <p className="font-bold text-slate-800 dark:text-white">{fee.studentName} — {fee.title}</p>
                      <p className="text-slate-500">${fee.amount} • TX: {fee.transactionId}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleApproval(fee.feeId, "Approved")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer">Accept</button>
                      <button type="button" onClick={() => handleApproval(fee.feeId, "Rejected")} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg cursor-pointer">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
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
              <div className="overflow-hidden">
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
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-300">Registration Request Inbox</h3>
                {registrationNotifications.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 text-xs text-slate-500">
                    No registration requests have arrived yet.
                  </p>
                ) : (
                  registrationNotifications.map((request) => (
                    <div key={request.id} className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{request.name}</p>
                          <p className="text-[10px] text-slate-500">{request.role} - {request.studentClass}</p>
                        </div>
                        <span className={`w-max px-2 py-0.5 rounded text-[9px] font-black uppercase ${request.status === "Pending" ? "bg-amber-200 text-amber-800" : request.status === "Accepted" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        <span>Name: {request.name}</span>
                        <span>Role: {request.role}</span>
                        <span>Email: {request.email}</span>
                        <span>Mobile Number: {request.mobileNumber}</span>
                        <span>Class: {request.studentClass}</span>
                        <span>Registration: {request.registrationDateTime}</span>
                      </div>
                      {request.status === "Pending" && (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleRegistrationDecision(request.id, "Accepted")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg">Accept</button>
                          <button type="button" onClick={() => handleRegistrationDecision(request.id, "Rejected")} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg">Reject</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

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

        {/* ========================================================================= */}
        {/* VIEW: REGISTRATIONS */}
        {/* ========================================================================= */}
        {activeTab === "registrations" && (
          <div className="space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Pending", value: backendRegistrations.filter(r => r.registrationStatus === "Pending Approval").length || registrationNotifications.filter(n => n.status === "Pending").length, color: "amber" },
                { label: "Approved", value: backendRegistrations.filter(r => r.registrationStatus === "Approved").length || registrationNotifications.filter(n => n.status === "Accepted").length, color: "emerald" },
                { label: "Rejected", value: backendRegistrations.filter(r => r.registrationStatus === "Rejected").length || registrationNotifications.filter(n => n.status === "Rejected").length, color: "rose" },
              ].map(card => (
                <div key={card.label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm text-left">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{card.label}</p>
                  <p className={`text-3xl font-black mt-1 ${card.color === "amber" ? "text-amber-500" : card.color === "emerald" ? "text-emerald-500" : "text-rose-500"}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {(["Pending Approval", "Approved", "Rejected", "All"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setRegStatusFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    regStatusFilter === f
                      ? "bg-[#2563eb] text-white border-[#2563eb]"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400"
                  }`}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={fetchBackendRegistrations}
                className="ml-auto px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 transition-all flex items-center gap-1.5"
              >
                <ArrowUpRight className="h-3 w-3" /> Refresh
              </button>
            </div>

            {/* Registrations List from Backend */}
            {loadingRegistrations ? (
              <div className="text-center py-12 text-slate-400 text-sm font-bold">Loading registration requests...</div>
            ) : (() => {
              const regs = backendRegistrations.length > 0 ? backendRegistrations : [];
              const filtered = regStatusFilter === "All" ? regs : regs.filter(r => r.registrationStatus === regStatusFilter);

              // Fallback to localStorage-based notifications if backend returns nothing
              const notifFiltered = backendRegistrations.length === 0
                ? registrationNotifications.filter(n => {
                    if (regStatusFilter === "All") return true;
                    if (regStatusFilter === "Pending Approval") return n.status === "Pending";
                    if (regStatusFilter === "Approved") return n.status === "Accepted";
                    if (regStatusFilter === "Rejected") return n.status === "Rejected";
                    return true;
                  })
                : [];

              const showNotifFallback = backendRegistrations.length === 0;

              if (!showNotifFallback && filtered.length === 0) {
                return (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
                    <UserCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">No {regStatusFilter} registrations found</p>
                  </div>
                );
              }

              if (showNotifFallback && notifFiltered.length === 0) {
                return (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
                    <UserCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">No {regStatusFilter} registration requests</p>
                    <p className="text-xs text-slate-400 mt-1">New parent registrations will appear here for review</p>
                  </div>
                );
              }

              const items = showNotifFallback ? notifFiltered : filtered;

              return (
                <div className="space-y-3">
                  {items.map((reg: any) => {
                    const isBackend = !showNotifFallback;
                    const isPending = isBackend
                      ? reg.registrationStatus === "Pending Approval"
                      : reg.status === "Pending";
                    const isApproved = isBackend
                      ? reg.registrationStatus === "Approved"
                      : reg.status === "Accepted";

                    return (
                      <div
                        key={reg._id || reg.id}
                        className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm transition-all text-left ${
                          isPending
                            ? "border-amber-200 dark:border-amber-800/40"
                            : isApproved
                            ? "border-emerald-200 dark:border-emerald-800/40"
                            : "border-rose-200 dark:border-rose-800/40"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                isPending
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                  : isApproved
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                              }`}>
                                {isBackend ? reg.registrationStatus : reg.status}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {reg._id ? reg._id.slice(-8).toUpperCase() : reg.id}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                              <div>
                                <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Parent Name</p>
                                <p className="font-bold text-slate-800 dark:text-white">{isBackend ? reg.parentName : reg.name}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Email</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{reg.email}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Mobile</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{isBackend ? reg.phone : reg.mobileNumber}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Student Name</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{isBackend ? reg.studentName : "—"}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Class / Grade</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{isBackend ? reg.classGrade : reg.studentClass}</p>
                              </div>
                              {isBackend && (
                                <div>
                                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Location</p>
                                  <p className="font-bold text-slate-700 dark:text-slate-200">{reg.location}</p>
                                </div>
                              )}
                              {isBackend && (
                                <div>
                                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Mode</p>
                                  <p className="font-bold text-slate-700 dark:text-slate-200">{reg.classMode}</p>
                                </div>
                              )}
                              {isBackend && (
                                <div>
                                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Advance Fee Paid</p>
                                  <p className="font-bold text-emerald-600">₹{reg.advanceFeeAmount} ({reg.paymentStatus})</p>
                                </div>
                              )}
                              {isBackend && reg.transactionId && (
                                <div className="col-span-2">
                                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Transaction ID</p>
                                  <p className="font-mono font-bold text-slate-700 dark:text-slate-200">{reg.transactionId}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[9px] uppercase font-black text-slate-400 tracking-wide">Submitted On</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">
                                  {new Date(reg.createdAt || reg.registrationDateTime).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {isPending && (
                            <div className="flex sm:flex-col gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  if (isBackend) {
                                    handleBackendRegistrationDecision(reg._id, "Approved");
                                  } else {
                                    handleRegistrationDecision(reg.id, "Accepted");
                                  }
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-xl transition-all active:scale-95"
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  if (isBackend) {
                                    handleBackendRegistrationDecision(reg._id, "Rejected");
                                  } else {
                                    handleRegistrationDecision(reg.id, "Rejected");
                                  }
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] rounded-xl transition-all active:scale-95"
                              >
                                <X className="h-3.5 w-3.5" /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mb-24 mt-8">
          <Footer />
        </div>

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

            <div className="p-6 overflow-hidden space-y-6 flex-grow text-xs">
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
      {editingTutor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveTutorEdit} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-amber-500 text-white flex justify-between items-center">
              <h3 className="text-md font-black">Edit Tutor Details</h3>
              <button type="button" onClick={() => setEditingTutor(null)} className="text-white hover:opacity-80"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Name</label>
                <input type="text" value={editingTutor.name} onChange={(e) => setEditingTutor({ ...editingTutor, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Specialty</label>
                <input type="text" value={editingTutor.specialty} onChange={(e) => setEditingTutor({ ...editingTutor, specialty: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Email</label>
                <input type="email" value={editingTutor.email} onChange={(e) => setEditingTutor({ ...editingTutor, email: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none" required />
              </div>
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl">Save Changes</button>
            </div>
          </form>
        </div>
      )}

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

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => { setEditingTutor({ ...selectedTutor }); setSelectedTutor(null); }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Tutor
              </button>
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

      {/* ========================================================================= */}
      {/* MODAL: ADD TIMETABLE SLOT */}
      {/* ========================================================================= */}
      {showAddSchedule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSchedule} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-md font-black">Create Timetable Slot</h3>
              <button type="button" onClick={() => setShowAddSchedule(false)} className="text-white hover:opacity-80"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Faculty Instructor</label>
                <select
                  required
                  value={newSchedule.tutorId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, tutorId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                >
                  <option value="" disabled>Select Faculty...</option>
                  {localTutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newSchedule.subject}
                    onChange={(e) => setNewSchedule({ ...newSchedule, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Grade Level</label>
                  <select
                    value={newSchedule.grade}
                    onChange={(e) => setNewSchedule({ ...newSchedule, grade: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Day</label>
                  <select
                    value={newSchedule.day}
                    onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Start Time</label>
                  <input
                    type="text"
                    required
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">End Time</label>
                  <input
                    type="text"
                    required
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Class Mode</label>
                  <select
                    value={newSchedule.mode}
                    onChange={(e) => setNewSchedule({ ...newSchedule, mode: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Room / link</label>
                  <input
                    type="text"
                    required
                    value={newSchedule.room}
                    onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                    placeholder="e.g. Room 101"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Assign Student Wards (Check to assign)</label>
                <div className="max-h-32 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2 dark:bg-slate-950">
                  {localStudents.map(s => {
                    const isChecked = newSchedule.assignedStudentIds.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-350 font-semibold">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? newSchedule.assignedStudentIds.filter(id => id !== s.id)
                              : [...newSchedule.assignedStudentIds, s.id];
                            setNewSchedule({ ...newSchedule, assignedStudentIds: updated });
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{s.name} ({s.id})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSchedule(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Save Schedule Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT TIMETABLE SLOT */}
      {/* ========================================================================= */}
      {showEditSchedule && editingSchedule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUpdateSchedule} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-md font-black">Edit Timetable Slot</h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditSchedule(false);
                  setEditingSchedule(null);
                }}
                className="text-white hover:opacity-80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Faculty Instructor</label>
                <select
                  required
                  value={editingSchedule.tutorId}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, tutorId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                >
                  {localTutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={editingSchedule.subject}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Grade Level</label>
                  <select
                    value={editingSchedule.grade}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, grade: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Day</label>
                  <select
                    value={editingSchedule.day}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, day: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Start Time</label>
                  <input
                    type="text"
                    required
                    value={editingSchedule.startTime}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">End Time</label>
                  <input
                    type="text"
                    required
                    value={editingSchedule.endTime}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Class Mode</label>
                  <select
                    value={editingSchedule.mode}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, mode: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Room / link</label>
                  <input
                    type="text"
                    required
                    value={editingSchedule.room}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, room: e.target.value })}
                    placeholder="e.g. Room 101"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400">Assign Student Wards (Check to assign)</label>
                <div className="max-h-32 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2 dark:bg-slate-950">
                  {localStudents.map(s => {
                    const isChecked = (editingSchedule.assignedStudentIds || []).includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-355 font-semibold">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const currentList = editingSchedule.assignedStudentIds || [];
                            const updated = isChecked
                              ? currentList.filter((id: string) => id !== s.id)
                              : [...currentList, s.id];
                            setEditingSchedule({ ...editingSchedule, assignedStudentIds: updated });
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{s.name} ({s.id})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditSchedule(false);
                  setEditingSchedule(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Save Changes
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
