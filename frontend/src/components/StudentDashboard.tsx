/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useRef, useState, useEffect } from "react";
import {
  GraduationCap, Calendar, Clock, BookOpen, Film, HelpCircle,
  CheckCircle, ArrowUpRight, TrendingUp, Sparkles, User, Video,
  MapPin, AlertCircle, FileText, Download, LayoutDashboard, Award,
  DollarSign, MessageSquare, Bell, Settings, Star, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { Student, Tutor, FeePayment, Assignment } from "../types";
import { normalizeFee, normalizeAssignment } from "../utils/normalizers";
import { Footer } from "./Footer";
import { FooterNavigation } from "./FooterNavigation";
import { apiClient } from "../services/apiClient";

interface StudentDashboardProps {
  currentStudent: Student;
  tutors: Tutor[];
  onLogout: () => void;
}

export function StudentDashboard({ currentStudent, tutors, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [syllabusNoticeOpen, setSyllabusNoticeOpen] = useState(false);
  const [tutorReviews, setTutorReviews] = useState<any[]>([]);
  const [reviewTutorId, setReviewTutorId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubject, setReviewSubject] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const mainPanelRef = useRef<HTMLElement | null>(null);

  // Dynamic States for API connections
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceRate, setAttendanceRate] = useState(currentStudent.attendanceRate);
  const [presentCount, setPresentCount] = useState(currentStudent.presentCount);
  const [absentCount, setAbsentCount] = useState(currentStudent.absentCount);
  const [studentFees, setStudentFees] = useState<FeePayment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const assignedTutors = tutors.filter((t) => currentStudent.assignedTutorIds.includes(t.id));
  const latestGpa = currentStudent.results && currentStudent.results.length > 0
    ? currentStudent.results[currentStudent.results.length - 1].gpa
    : 4.0;

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await apiClient.reviews.getByStudent(currentStudent.id);
        setTutorReviews(data);
      } catch {
        setTutorReviews([]);
      }
    };
    loadReviews();
  }, [currentStudent.id]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await apiClient.attendance.getByStudent(currentStudent.id);
        if (response && Array.isArray(response.records)) {
          setAttendanceRecords(response.records);
          setAttendanceRate(response.attendanceRate ?? currentStudent.attendanceRate);
          setPresentCount(response.presentCount ?? currentStudent.presentCount);
          setAbsentCount(response.absentCount ?? currentStudent.absentCount);
        }
      } catch (error) {
        console.warn("Failed to load attendance records", error);
      }
    };
    fetchAttendance();
  }, [currentStudent.id]);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await apiClient.fees.getByStudent(currentStudent.id);
        setStudentFees((response || []).map(normalizeFee));
      } catch (error) {
        console.warn("Failed to load fees for student", error);
      }
    };
    fetchFees();
  }, [currentStudent.id]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const list: Assignment[] = [];
        for (const tutorId of currentStudent.assignedTutorIds) {
          const res = await apiClient.attendance.getAssignmentsByTutor(tutorId);
          if (Array.isArray(res)) {
            list.push(...res.map(normalizeAssignment));
          }
        }
        setAssignments(list);
      } catch (error) {
        console.warn("Failed to fetch student assignments", error);
      }
    };
    if (currentStudent.assignedTutorIds?.length > 0) {
      fetchAssignments();
    }
  }, [currentStudent.assignedTutorIds, currentStudent.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTutorId || !reviewComment.trim()) {
      setReviewMsg("Please select a tutor and write a review.");
      return;
    }
    const tutor = tutors.find((t) => t.id === reviewTutorId);
    try {
      const response = await apiClient.reviews.create({
        type: "student_tutor",
        studentId: currentStudent.id,
        tutorId: reviewTutorId,
        tutorName: tutor?.name || "",
        rating: reviewRating,
        comment: reviewComment,
        subject: reviewSubject || tutor?.specialty || "General",
      });
      setTutorReviews([response.review || response, ...tutorReviews]);
      setReviewComment("");
      setReviewSubject("");
      setReviewMsg("Review submitted successfully!");
      setTimeout(() => setReviewMsg(""), 3000);
    } catch (error: any) {
      setReviewMsg(error.message || "Failed to submit review.");
    }
  };

  const handleSupportClick = () => {
    const textMsg = encodeURIComponent(
      `Hello Admin! I am student: ${currentStudent.name} (ID: ${currentStudent.id}, ${currentStudent.grade}). I need help with my class timings & support. Please guide!`
    );
    const whatsappUrl = `https://wa.me/916300227011?text=${textMsg}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSyllabusDownload = () => {
    setSyllabusNoticeOpen(true);
    setTimeout(() => {
      setSyllabusNoticeOpen(false);
    }, 4000);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (mainPanelRef.current) mainPanelRef.current.scrollTop = 0;
  };

  // Mocked details matching the mockup layout
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-tutor", label: "My Tutor", icon: User },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "results", label: "Results", icon: Award },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "tests", label: "Tests", icon: GraduationCap },
    { id: "fees", label: "Fees", icon: DollarSign },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">

      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? "w-full md:w-64" : "w-0 md:w-0 p-0 overflow-hidden"} bg-[#1d0b3a] dark:bg-[#0e051c] text-indigo-50 flex flex-col ${sidebarOpen ? "p-5" : ""} border-r border-[#2d1257] shrink-0 md:h-full transition-all duration-300`}>
        {sidebarOpen && (<>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 modal-scroll">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-[#7c3aed] rounded-xl text-white shadow-lg">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="font-extrabold text-sm tracking-widest text-white uppercase">
                Student Space
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
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive
                    ? "bg-[#7c3aed] text-white shadow-md transform scale-[1.02]"
                    : "text-indigo-200/70 hover:text-white hover:bg-white/5"
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
            <div className="h-9 w-9 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-bold text-sm border border-[#7c3aed]/30">
              {currentStudent.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-black text-white leading-tight">{currentStudent.name}</p>
              <p className="text-[10px] text-indigo-200/50">Student</p>
            </div>
          </div>
        </div>
        </>)}
      </aside>

      {/* Sidebar open button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-2 z-40 p-2 bg-[#1d0b3a] border border-[#2d1257] rounded-xl text-indigo-200 hover:text-white hover:bg-[#2d1257] transition-colors shadow-lg"
          title="Open panel"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      <main ref={mainPanelRef} data-scroll-container className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 space-y-6 relative">

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

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left mt-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Welcome back, {currentStudent.name.split(" ")[0]} 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeTab === "dashboard" ? "Track your learning progress here." : `You're viewing: ${sidebarItems.find(i => i.id === activeTab)?.label || activeTab}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleSupportClick}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span>WhatsApp Support</span>
            </button>
            <button
              onClick={handleSyllabusDownload}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Syllabus PDF
            </button>
          </div>
        </div>

        {syllabusNoticeOpen && (
          <div className="bg-sky-50 dark:bg-sky-950/45 border border-sky-200 dark:border-sky-900 rounded-2xl p-4 text-left text-xs text-sky-700 dark:text-sky-300 font-bold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-sky-500 animate-bounce" />
            <span>Academic syllabus document download initialized safely! PDF (SYLLABUS_V2) exported.</span>
          </div>
        )}

        {/* ===================== TAB: DASHBOARD ===================== */}
        {activeTab === "dashboard" && (
          <>
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Attendance</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {attendanceRate}%
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${attendanceRate >= 90 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450" : "bg-amber-50 dark:bg-amber-950/30 text-amber-605"}`}>
                    {attendanceRate >= 90 ? "Excellent" : "Average"}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Upcoming Tests</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-650 dark:text-indigo-400">
                    {currentStudent.upcomingEvents.filter(e => e.badge === "Quiz" || e.badge === "Mock Test").length || 2}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 font-bold">
                    Active
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Fee Status</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-rose-500">
                    ${studentFees.filter(f => f.status === "Pending").reduce((acc, curr) => acc + curr.amount, 0)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${studentFees.some(f => f.status === "Pending") ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-455" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600"}`}>
                    {studentFees.some(f => f.status === "Pending") ? "Due" : "Paid"}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Latest Result</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-450">
                    {latestGpa} GPA
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 font-bold">
                    Latest
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard overview grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              <div className="lg:col-span-7 space-y-6">
                {/* My Tutor Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">My Tutor</h3>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtyd2CRb90hNdYfBUMT1G-WThzLZAZF92RO58CqttTvKAeDFYdafu_oYAUYJpgv8OnQXgnlrekQojBmHtmXFFLL-np47rR8OMuEOLo_3RzeFzOve2Rtp1F5j7rEYdgOEmhacGcX4mbh2PLF1mMgDvNlqZpjTE4-jMD8v5Fj4DIWQlm_oPECHD8zCJgwMvBAHsaepCZawoKDTNECjxqnVM2A89IZOQY-G-cF96q40-pAvnLsHMj5qQn7QRRzw8uAuS5dMl2LfSYNcI"
                        alt="John Smith"
                        className="h-16 w-16 rounded-full object-cover border border-slate-100 shadow-sm"
                      />
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Dr. Elena Vance</h4>
                        <p className="text-xs text-slate-550 mt-1">Mathematics & Logic Expert</p>
                        <div className="flex items-center gap-1 mt-1 text-amber-500">
                          <Star className="h-4 w-4 fill-amber-500" />
                          <Star className="h-4 w-4 fill-amber-500" />
                          <Star className="h-4 w-4 fill-amber-500" />
                          <Star className="h-4 w-4 fill-amber-500" />
                          <Star className="h-4 w-4 fill-amber-500" />
                          <span className="text-xs font-black ml-1 text-slate-900 dark:text-white">4.9 / 5.0 Rating</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTabChange("messages")}
                        className="px-4 py-2.5 rounded-xl border border-slate-205 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-800 dark:text-white font-extrabold text-xs tracking-tight transition-colors cursor-pointer"
                      >
                        Message Tutor
                      </button>
                    </div>
                  </div>
                </div>

                {/* My Courses (compact) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">My Courses</h3>
                  <div className="space-y-4">
                    {currentStudent.learningSubjects.slice(0, 3).map((sub, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-800 dark:text-white">{sub.name}</span>
                          <span className="text-indigo-650 dark:text-indigo-400">Week {sub.completedWeeks} ({sub.completedPercentage}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-sky-400 to-[#7c3aed]" style={{ width: `${sub.completedPercentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                {/* Today's Classes (compact) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Today's Classes</h3>
                  <div className="space-y-3">
                    {currentStudent.classTimings.slice(0, 3).map((time, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                        <div className="text-left space-y-0.5">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-white block leading-tight">{time.subject}</span>
                          <span className="text-[10px] text-slate-500">{time.day}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900 dark:text-white block">{time.time}</span>
                          <span className="text-[9px] font-bold text-sky-600 mt-0.5 inline-block">{time.mode} Mode</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Results (compact) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Results</h3>
                  <div className="space-y-3">
                    {currentStudent.results.slice(0, 2).map((res, id) => (
                      <div key={id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                        <div className="text-left space-y-0.5">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-white block leading-tight">{res.term} Grade Evaluation</span>
                          <p className="text-[10px] text-slate-500">GPA Score registered in system ledger</p>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg shrink-0">
                          {res.gpa} GPA
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===================== TAB: MY TUTOR ===================== */}
        {activeTab === "my-tutor" && (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">My Tutor Details</h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtyd2CRb90hNdYfBUMT1G-WThzLZAZF92RO58CqttTvKAeDFYdafu_oYAUYJpgv8OnQXgnlrekQojBmHtmXFFLL-np47rR8OMuEOLo_3RzeFzOve2Rtp1F5j7rEYdgOEmhacGcX4mbh2PLF1mMgDvNlqZpjTE4-jMD8v5Fj4DIWQlm_oPECHD8zCJgwMvBAHsaepCZawoKDTNECjxqnVM2A89IZOQY-G-cF96q40-pAvnLsHMj5qQn7QRRzw8uAuS5dMl2LfSYNcI"
                    alt="Dr. Elena Vance"
                    className="h-24 w-24 rounded-full object-cover border-2 border-[#7c3aed]/30 shadow-lg"
                  />
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Dr. Elena Vance</h4>
                    <p className="text-sm text-slate-500">Mathematics & Logic Expert</p>
                    <div className="flex items-center gap-1 mt-1 text-amber-500">
                      <Star className="h-5 w-5 fill-amber-500" />
                      <Star className="h-5 w-5 fill-amber-500" />
                      <Star className="h-5 w-5 fill-amber-500" />
                      <Star className="h-5 w-5 fill-amber-500" />
                      <Star className="h-5 w-5 fill-amber-500" />
                      <span className="text-sm font-black ml-2 text-slate-900 dark:text-white">4.9 / 5.0 Rating</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Specializes in advanced algebra, calculus, and logical reasoning. Available for one-on-one doubt sessions.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleTabChange("messages")}
                    className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-800 dark:text-white font-extrabold text-xs tracking-tight transition-colors cursor-pointer"
                  >
                    Message Tutor
                  </button>
                  <button
                    onClick={() => handleTabChange("schedule")}
                    className="px-5 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-extrabold text-xs tracking-tight transition-colors cursor-pointer"
                  >
                    Schedule Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: COURSES ===================== */}
        {activeTab === "courses" && (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">My Courses — Syllabus Progress</h3>
              <div className="space-y-5">
                {currentStudent.learningSubjects.map((sub, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-slate-800 dark:text-white">{sub.name}</span>
                      <span className="text-xs font-bold text-[#7c3aed]">Week {sub.completedWeeks} Completed</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-[#7c3aed] rounded-full transition-all duration-500" style={{ width: `${sub.completedPercentage}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>Progress</span>
                      <span>{sub.completedPercentage}% Complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: ATTENDANCE ===================== */}
        {activeTab === "attendance" && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-36">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2">Attendance Rate</span>
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{attendanceRate}%</span>
                <span className={`text-[10px] px-2 py-0.5 mt-2 rounded font-bold ${attendanceRate >= 90 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" : "bg-amber-50 dark:bg-amber-950/30 text-amber-600"}`}>
                  {attendanceRate >= 90 ? "Excellent" : attendanceRate >= 75 ? "Good" : "Needs Improvement"}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-36">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2">Days Present</span>
                <span className="text-4xl font-black text-sky-600 dark:text-sky-400">{presentCount}</span>
                <span className="text-[10px] px-2 py-0.5 mt-2 rounded bg-sky-50 dark:bg-sky-950/30 text-sky-600 font-bold">Present</span>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-36">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2">Days Absent</span>
                <span className="text-4xl font-black text-rose-500 dark:text-rose-400">{absentCount}</span>
                <span className="text-[10px] px-2 py-0.5 mt-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 font-bold">Absent</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-4">Attendance Summary</h3>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${attendanceRate}%` }} />
              </div>
              <p className="text-xs text-slate-505 mt-3">
                You have attended <strong className="text-slate-900 dark:text-white">{presentCount}</strong> out of <strong className="text-slate-900 dark:text-white">{presentCount + absentCount}</strong> total classes this term.
              </p>
            </div>
            {attendanceRecords.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mt-6">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-4">Detailed Records</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                        <th className="text-left px-4 py-2">Date</th>
                        <th className="text-left px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-350">
                      {attendanceRecords.map((r, idx) => (
                        <tr key={r.attendanceId || idx}>
                          <td className="px-4 py-3">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === "Present" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: RESULTS ===================== */}
        {activeTab === "results" && (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">All Results</h3>
              <div className="space-y-4">
                {currentStudent.results.map((res, id) => (
                  <div key={id} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-slate-800 dark:text-white">{res.term} Grade Evaluation</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl">
                        {res.gpa} GPA
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Maths</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{res.mathsScore}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Physics</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{res.physicsScore}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Literature</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{res.literatureScore}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Comp Sci</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{res.compSciScore}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: ASSIGNMENTS ===================== */}
        {activeTab === "assignments" && (
          <div className="space-y-6 text-left">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Total</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {assignments.length}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Active</p>
                <p className="text-2xl font-black text-amber-500">
                  {assignments.filter(a => a.status === "Active").length}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Completed</p>
                <p className="text-2xl font-black text-emerald-600">
                  {assignments.filter(a => a.status === "Completed").length}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">All Assignments</h3>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1">
                      <span className="text-sm font-black text-slate-800 dark:text-white block leading-tight">{assignment.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{assignment.subject}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-xs text-slate-400">Due: {assignment.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-xl shrink-0 ${assignment.status === "Completed"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-600"
                        }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <p className="text-xs text-slate-550 text-center py-6">No homework assignments published yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: TESTS ===================== */}
        {activeTab === "tests" && (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Upcoming Tests & Quizzes</h3>
              <div className="space-y-3">
                {currentStudent.upcomingEvents.map((ev, id) => (
                  <div key={id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                    <div className="text-left space-y-1">
                      <span className="text-sm font-black text-slate-800 dark:text-white block leading-tight">{ev.title}</span>
                      <p className="text-xs text-slate-500">{ev.time}</p>
                      <p className="text-xs text-slate-400">{ev.description}</p>
                    </div>
                    <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 shrink-0">
                      {ev.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: FEES ===================== */}
        {activeTab === "fees" && (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Fee Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl p-5 text-center">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-rose-400 mb-1">Pending Due</p>
                  <p className="text-3xl font-black text-rose-500">
                    ${studentFees.filter(f => f.status === "Pending").reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-rose-400 mt-1">Outstanding Invoices</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-5 text-center">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 mb-1">Total Paid</p>
                  <p className="text-3xl font-black text-emerald-600">
                    ${studentFees.filter(f => f.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">Paid Successfully</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-3 text-xs">
                {studentFees.map((fee) => (
                  <div key={fee.id} className="flex justify-between items-center text-slate-700 dark:text-slate-350 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="text-left space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white block">{fee.title}</span>
                      <span className="text-[10px] text-slate-400 block">Due Date: {fee.dueDate} {fee.transactionId ? `| TxID: ${fee.transactionId}` : ''}</span>
                    </div>
                    <span className={`font-extrabold px-2 py-1 rounded-lg ${fee.status === "Paid" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "text-rose-500 bg-rose-50 dark:bg-rose-950/30"}`}>
                      ${fee.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {studentFees.length === 0 && (
                  <p className="text-xs text-slate-550 text-center py-4">No fee invoices recorded in ledger.</p>
                )}
                {studentFees.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">Receipt status</span>
                    <span className="text-[10px] text-slate-400 font-mono">Student ID: {currentStudent.id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: SCHEDULE ===================== */}
        {activeTab === "schedule" && (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Full Class Schedule</h3>
              <div className="space-y-3">
                {currentStudent.classTimings.map((time, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                    <div className="text-left space-y-1">
                      <span className="text-sm font-black text-slate-800 dark:text-white block leading-tight">{time.subject}</span>
                      <span className="text-xs text-slate-500">{time.day}</span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">{time.time}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${time.mode === "Online" ? "bg-sky-50 dark:bg-sky-950/30 text-sky-600" : "bg-amber-50 dark:bg-amber-950/30 text-amber-600"}`}>
                        {time.mode} Mode
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: REVIEWS ===================== */}
        {activeTab === "reviews" && (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Rate Your Tutor</h3>
              {reviewMsg && <p className="text-xs font-bold text-emerald-600">{reviewMsg}</p>}
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Select Tutor</label>
                  <select
                    value={reviewTutorId}
                    onChange={(e) => setReviewTutorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 text-sm"
                    required
                  >
                    <option value="">Choose tutor...</option>
                    {assignedTutors.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} — {t.specialty}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Subject (optional)</label>
                  <input
                    value={reviewSubject}
                    onChange={(e) => setReviewSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Star Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setReviewRating(s)} className="cursor-pointer">
                        <Star className={`h-6 w-6 ${s <= reviewRating ? "fill-amber-500 text-amber-500" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Your Review</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this tutor..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 text-sm"
                    required
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs rounded-xl cursor-pointer">
                  Submit Review
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Your Submitted Reviews</h3>
              <div className="space-y-4">
                {tutorReviews.length === 0 ? (
                  <p className="text-xs text-slate-500">No reviews yet. Rate your tutor above.</p>
                ) : tutorReviews.map((review: any) => (
                  <div key={review.reviewId || review._id} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-slate-800 dark:text-white block">{review.tutorName}</span>
                        <span className="text-xs text-slate-500">{review.subject} • {new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-amber-500 text-amber-500" : "text-slate-300"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: MESSAGES ===================== */}
        {activeTab === "messages" && (
          <StudentMessagesTab currentStudent={currentStudent} tutors={tutors.filter(t => currentStudent.assignedTutorIds.includes(t.id))} />
        )}

        {/* ===================== TAB: PROFILE ===================== */}
        {activeTab === "profile" && (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Student Profile</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-black text-2xl border-2 border-[#7c3aed]/30">
                  {currentStudent.name.charAt(0)}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{currentStudent.name}</h4>
                  <p className="text-sm text-slate-500">Student ID: {currentStudent.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Grade</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{currentStudent.grade}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Section</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{currentStudent.section}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Parent Email</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{currentStudent.parentEmail}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Attendance</p>
                  <p className="text-sm font-black text-emerald-600">{currentStudent.attendanceRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: SETTINGS ===================== */}
        {activeTab === "settings" && (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Settings</h3>
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Settings className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Settings coming soon.</p>
                <p className="text-xs text-slate-400">Account and notification preferences will be available here.</p>
              </div>
            </div>
          </div>
        )}

        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mb-24 mt-8">
          <Footer />
        </div>

      </main>

    </div>
  );
}

function StudentMessagesTab({ currentStudent, tutors }: { currentStudent: Student; tutors: Tutor[] }) {
  const [selectedTutorId, setSelectedTutorId] = useState(tutors[0]?.id || "");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedTutor = tutors.find(t => t.id === selectedTutorId);

  useEffect(() => {
    if (!selectedTutorId) return;
    const loadConversation = async () => {
      try {
        const data = await apiClient.chat.getConversation(currentStudent.id, selectedTutorId);
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      }
    };
    loadConversation();
    const interval = setInterval(loadConversation, 5000);
    return () => clearInterval(interval);
  }, [selectedTutorId, currentStudent.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedTutor) return;
    setSending(true);
    try {
      const sent = await apiClient.chat.send({
        senderId: currentStudent.id,
        senderName: currentStudent.name,
        senderRole: "student",
        receiverId: selectedTutorId,
        receiverName: selectedTutor.name,
        receiverRole: "tutor",
        text: newMsg.trim(),
      });
      setMessages([...messages, sent]);
      setNewMsg("");
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden h-[550px] flex flex-col">
        {/* Tutor selector */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-500">Chat with:</span>
          {tutors.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTutorId(t.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedTutorId === t.id
                ? "bg-[#7c3aed] text-white shadow-sm"
                : "bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 hover:bg-[#7c3aed]/20"
                }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Messages list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 modal-scroll">
          {messages.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">No messages yet. Start a conversation!</p>
          )}
          {messages.map((msg: any, idx: number) => {
            const isMe = msg.senderId === currentStudent.id;
            return (
              <div key={msg._id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] p-3 rounded-2xl text-xs font-bold ${isMe
                  ? "bg-[#7c3aed] text-white rounded-tr-none"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                  }`}>
                  <p>{msg.text}</p>
                  <span className="block text-[9px] mt-1 text-right opacity-70">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Now"}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Send input */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
          <input
            type="text"
            placeholder={`Message ${selectedTutor?.name || "tutor"}...`}
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="flex-grow p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-[#7c3aed]"
          />
          <button
            type="submit"
            disabled={sending || !newMsg.trim()}
            className="px-4 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
