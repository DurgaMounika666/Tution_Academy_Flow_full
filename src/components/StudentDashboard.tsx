/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import {
  GraduationCap, Calendar, Clock, BookOpen, Film, HelpCircle,
  CheckCircle, ArrowUpRight, TrendingUp, Sparkles, User, Video,
  MapPin, AlertCircle, FileText, Download, LayoutDashboard, Award,
  DollarSign, MessageSquare, Bell, Settings, Star
} from "lucide-react";
import { Student } from "../types";

interface StudentDashboardProps {
  currentStudent: Student;
  onLogout: () => void;
}

export function StudentDashboard({ currentStudent, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [syllabusNoticeOpen, setSyllabusNoticeOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#1d0b3a] dark:bg-[#0e051c] text-indigo-50 flex flex-col justify-between p-5 border-r border-[#2d1257] shrink-0">
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <span className="p-2 bg-[#7c3aed] rounded-xl text-white shadow-lg">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-extrabold text-sm tracking-widest text-white uppercase">
              Student Space
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
                  onClick={() => setActiveTab(item.id)}
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
        <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-bold text-sm border border-[#7c3aed]/30">
              {currentStudent.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-black text-white leading-tight">{currentStudent.name}</p>
              <p className="text-[10px] text-indigo-200/50">Student</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-[10px] uppercase font-black tracking-wider text-indigo-200/60 hover:text-[#7c3aed] transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

        {/* Welcome Greeting Board — Always visible */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
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
                    {currentStudent.attendanceRate}%
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 font-bold">
                    Excellent
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
                    $150
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-455 font-bold">
                    Due
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Latest Result</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-650 dark:text-emerald-450">
                    A+
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 font-bold">
                    Top GPA
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
                        onClick={() => window.open("https://wa.me/916300227011", "_blank")}
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
                    onClick={() => window.open("https://wa.me/916300227011", "_blank")}
                    className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-800 dark:text-white font-extrabold text-xs tracking-tight transition-colors cursor-pointer"
                  >
                    Message Tutor
                  </button>
                  <button
                    onClick={() => window.open("https://wa.me/916300227011", "_blank")}
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
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{currentStudent.attendanceRate}%</span>
                <span className="text-[10px] px-2 py-0.5 mt-2 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold">
                  {currentStudent.attendanceRate >= 90 ? "Excellent" : currentStudent.attendanceRate >= 75 ? "Good" : "Needs Improvement"}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-36">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2">Days Present</span>
                <span className="text-4xl font-black text-sky-600 dark:text-sky-400">{currentStudent.presentCount}</span>
                <span className="text-[10px] px-2 py-0.5 mt-2 rounded bg-sky-50 dark:bg-sky-950/30 text-sky-600 font-bold">Present</span>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-36">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2">Days Absent</span>
                <span className="text-4xl font-black text-rose-500 dark:text-rose-400">{currentStudent.absentCount}</span>
                <span className="text-[10px] px-2 py-0.5 mt-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 font-bold">Absent</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-4">Attendance Summary</h3>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${currentStudent.attendanceRate}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                You have attended <strong className="text-slate-900 dark:text-white">{currentStudent.presentCount}</strong> out of <strong className="text-slate-900 dark:text-white">{currentStudent.presentCount + currentStudent.absentCount}</strong> total classes this term.
              </p>
            </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Total</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">4</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Submitted</p>
                <p className="text-2xl font-black text-emerald-600">2</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Pending</p>
                <p className="text-2xl font-black text-amber-500">1</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Overdue</p>
                <p className="text-2xl font-black text-rose-500">1</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">All Assignments</h3>
              <div className="space-y-3">
                {[
                  { title: "Quadratic Equations — Problem Set 5", subject: "Mathematics", dueDate: "Jun 05, 2026", status: "Submitted", grade: "A" },
                  { title: "Newton's Laws Lab Report", subject: "Physics", dueDate: "Jun 03, 2026", status: "Submitted", grade: "B+" },
                  { title: "Shakespeare Essay — Hamlet Analysis", subject: "Literature", dueDate: "Jun 10, 2026", status: "Pending", grade: null },
                  { title: "Data Structures — Binary Tree Implementation", subject: "Computer Science", dueDate: "May 28, 2026", status: "Overdue", grade: null },
                ].map((assignment, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1">
                      <span className="text-sm font-black text-slate-800 dark:text-white block leading-tight">{assignment.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{assignment.subject}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-xs text-slate-400">Due: {assignment.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {assignment.grade && (
                        <span className="text-xs font-black text-[#7c3aed] bg-[#7c3aed]/10 px-2.5 py-1 rounded-lg">
                          Grade: {assignment.grade}
                        </span>
                      )}
                      <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-xl shrink-0 ${assignment.status === "Submitted"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                        : assignment.status === "Pending"
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-500"
                        }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
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
                  <p className="text-3xl font-black text-rose-500">$150.00</p>
                  <p className="text-xs text-rose-400 mt-1">Outstanding Invoice</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-5 text-center">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 mb-1">Last Payment</p>
                  <p className="text-3xl font-black text-emerald-600">$300.00</p>
                  <p className="text-xs text-emerald-400 mt-1">Paid Successfully</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-350">
                  <span>Pending Outstanding Invoice</span>
                  <span className="font-extrabold text-rose-500">$150.00 Due</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-350">
                  <span>Last Term Payment</span>
                  <span className="font-extrabold text-emerald-600">$300.00 Paid</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">Receipt status</span>
                  <span className="text-[10px] text-slate-400 font-mono">Ledger ID: #AF-ST-101</span>
                </div>
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
            {/* Average rating header */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-black text-slate-900 dark:text-white">4.8</p>
                <div className="flex items-center gap-0.5 mt-2 justify-center">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-5 w-5 ${s <= 4 ? "fill-amber-500 text-amber-500" : "fill-amber-500/50 text-amber-500/50"}`} />)}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-bold">Based on 4 reviews</p>
              </div>
              <div className="flex-grow space-y-2 w-full sm:w-auto">
                {[{ stars: 5, count: 2 }, { stars: 4, count: 1 }, { stars: 3, count: 1 }, { stars: 2, count: 0 }, { stars: 1, count: 0 }].map(row => (
                  <div key={row.stars} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-bold w-4">{row.stars}</span>
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <div className="h-2 flex-grow bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(row.count / 4) * 100}%` }} />
                    </div>
                    <span className="text-slate-400 font-bold w-4 text-right">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Tutor Feedback</h3>
              <div className="space-y-4">
                {[
                  { tutor: "Dr. Elena Vance", subject: "Mathematics", rating: 5, comment: "Excellent problem-solving skills! Consistently completes assignments on time and shows deep understanding of algebraic concepts. Keep up the great work!", date: "May 28, 2026" },
                  { tutor: "Prof. Marcus Chen", subject: "Physics", rating: 5, comment: "Outstanding lab performance this term. Your Newton's Laws report was one of the best in the class. Very thorough experimentation and analysis.", date: "May 22, 2026" },
                  { tutor: "Ms. Sarah Williams", subject: "Literature", rating: 4, comment: "Good critical thinking in essay writing. Could improve on citing sources more consistently. Your Hamlet analysis showed promising depth of insight.", date: "May 15, 2026" },
                  { tutor: "Dr. Raj Patel", subject: "Computer Science", rating: 3, comment: "Solid understanding of fundamentals but needs to work on implementing complex data structures. Recommend practicing binary trees and graph algorithms more.", date: "May 10, 2026" },
                ].map((review, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-slate-800 dark:text-white block">{review.tutor}</span>
                        <span className="text-xs text-slate-500">{review.subject} • {review.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-600"}`} />
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
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Messages</h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed]">2 Unread</span>
              </div>
              <div className="space-y-3">
                {[
                  { from: "Dr. Elena Vance", role: "Tutor", preview: "Great job on the last assignment! I've added some feedback on your quadratic equations problem set. Please review it before our next session.", time: "10:30 AM", unread: true },
                  { from: "Academy Admin", role: "Admin", preview: "Reminder: Your fee payment of $150.00 is due by June 15, 2026. Please complete the payment to avoid any late charges.", time: "9:15 AM", unread: true },
                  { from: "Prof. Marcus Chen", role: "Tutor", preview: "The physics lab schedule has been updated for next week. We'll be covering electromagnetic induction. Please bring your lab manual.", time: "Yesterday", unread: false },
                  { from: "Ms. Sarah Williams", role: "Tutor", preview: "Your Hamlet essay draft has been reviewed. I've attached some notes for revision. The final submission is due June 10th.", time: "Yesterday", unread: false },
                  { from: "Academy Admin", role: "Admin", preview: "Annual sports day registration is now open! Sign up for your preferred events before June 8th. Limited spots available for track events.", time: "May 30", unread: false },
                ].map((msg, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl flex items-start gap-4 transition-colors ${msg.unread
                    ? "bg-[#7c3aed]/5 dark:bg-[#7c3aed]/10 border border-[#7c3aed]/20"
                    : "bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850"
                    }`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${msg.role === "Admin"
                      ? "bg-amber-100 dark:bg-amber-950/30 text-amber-600"
                      : "bg-[#7c3aed]/15 text-[#7c3aed]"
                      }`}>
                      {msg.from.charAt(0)}
                    </div>
                    <div className="flex-grow min-w-0 space-y-1">
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800 dark:text-white">{msg.from}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${msg.role === "Admin" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600" : "bg-sky-50 dark:bg-sky-950/30 text-sky-600"
                            }`}>{msg.role}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold">{msg.time}</span>
                          {msg.unread && <span className="h-2 w-2 rounded-full bg-[#7c3aed] shrink-0" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed truncate">{msg.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

      </main>

    </div>
  );
}
