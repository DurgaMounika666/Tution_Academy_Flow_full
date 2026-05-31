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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive 
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
        
        {/* Welcome Greeting Board */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Welcome back, {currentStudent.name.split(" ")[0]} 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Track your learning progress here.
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

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Card 1: Attendance */}
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

          {/* Card 2: Upcoming Tests */}
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

          {/* Card 3: Fee Status */}
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

          {/* Card 4: Latest Result */}
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

        {/* Dynamic Panels layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Left Column (Col-7) */}
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

            {/* My Courses Syllabus progress sliders */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">My Courses</h3>
              
              <div className="space-y-4">
                {currentStudent.learningSubjects.map((sub, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-800 dark:text-white">{sub.name}</span>
                      <span className="text-indigo-650 dark:text-indigo-400">Week {sub.completedWeeks} Completed ({sub.completedPercentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-[#7c3aed]" style={{ width: `${sub.completedPercentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tests Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Upcoming Tests</h3>
              
              <div className="space-y-3">
                {currentStudent.upcomingEvents.map((ev, id) => (
                  <div key={id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white block leading-tight">{ev.title}</span>
                      <p className="text-[10px] text-slate-500">{ev.time} — {ev.description.slice(0, 45)}...</p>
                    </div>
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-tight rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 shrink-0">
                      {ev.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Col-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Today's Classes timetable list */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Today's Classes</h3>
              
              <div className="space-y-3">
                {currentStudent.classTimings.map((time, idx) => (
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

            {/* Recent Results Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Results</h3>
              
              <div className="space-y-3">
                {currentStudent.results.slice(0, 3).map((res, id) => (
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

            {/* Fee Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Fee Overview</h3>
              
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-105 p-4 rounded-2xl space-y-3 text-xs">
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

        </div>

      </main>

    </div>
  );
}
