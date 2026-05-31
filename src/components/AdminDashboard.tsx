/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldCheck, Search, Users, ShieldAlert, DollarSign, MapPin, 
  BookOpen, Mail, Terminal, Lock, CheckCircle2, ChevronRight, BarChart3, TrendingUp,
  LayoutDashboard, FileText, Bell, Settings, Award, PlusCircle, ArrowUpRight
} from "lucide-react";
import { Student, Tutor, FeePayment } from "../types";

interface AdminDashboardProps {
  students: Student[];
  tutors: Tutor[];
  fees: FeePayment[];
  onBypassLogin: (role: "student" | "parent" | "tutor") => void;
  onLogout: () => void;
}

export function AdminDashboard({ 
  students, tutors, fees, onBypassLogin, onLogout 
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter((s) => {
    return s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Helper clock icon mapping
  function ClockIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0b1329] dark:bg-[#070d1d] text-slate-100 flex flex-col justify-between p-5 border-r border-[#15254f] shrink-0">
        <div className="space-y-6">
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
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? "bg-[#2563eb] text-white shadow-md transform scale-[1.02]" 
                      : "text-slate-350 hover:text-white hover:bg-white/5"
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
            <div className="h-9 w-9 rounded-full bg-[#2563eb]/20 text-[#2563eb] flex items-center justify-center font-bold text-sm border border-[#2563eb]/30">
              AD
            </div>
            <div>
              <p className="text-xs font-black text-white leading-tight">Admin Director</p>
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

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Welcome Greeting Board */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Welcome back, Admin 👋
            </h2>
            <p className="text-xs text-slate-505 dark:text-slate-400">
              Here's what's happening in your institution today.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button 
              onClick={onLogout}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Sign Out Portal
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Card 1: Total Students */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Students</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2563eb]">
                1,248
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold">
                +12.5% vs last month
              </span>
            </div>
          </div>

          {/* Card 2: Total Tutors */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Tutors</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2563eb]">
                86
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold">
                +8.2% vs last month
              </span>
            </div>
          </div>

          {/* Card 3: Total Parents */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Parents</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2563eb]">
                1,102
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold">
                +11.3% vs last month
              </span>
            </div>
          </div>

          {/* Card 4: Revenue (This Month) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Revenue (This Month)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-450">
                $48,750
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold">
                +15.3% vs last month
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
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:bg-slate-950 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-105">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-[9px] text-slate-400">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Student</th>
                      <th className="px-4 py-2">Grade</th>
                      <th className="px-4 py-2">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-350">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono">{st.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                        <td className="px-4 py-3">{st.grade}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.attendanceRate > 90 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
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
                  42 Courses
                </div>
                <div className="space-y-2 text-xs w-full">
                  <div className="flex justify-between items-center text-slate-705 dark:text-slate-300">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 block" /> Web Development</span>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-705 dark:text-slate-300">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500 block" /> Data Science</span>
                    <span className="font-bold">28%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-705 dark:text-slate-300">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 block" /> UI/UX Design</span>
                    <span className="font-bold">20%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Collection Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Fee Collection Overview</h3>
              
              {/* Dynamic bar charts representing invoice collections */}
              <div className="space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 dark:text-slate-350">
                    <span>Paid Invoices</span>
                    <span className="font-extrabold text-emerald-600">${fees.filter(f => f.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0)} collected</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "70%" }} />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 dark:text-slate-350">
                    <span>Pending Outstanding</span>
                    <span className="font-extrabold text-rose-500">${fees.filter(f => f.status === "Pending").reduce((acc, curr) => acc + curr.amount, 0)} outstanding</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: "30%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bypass Panel Console Widget */}
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-[9px] uppercase font-black tracking-widest text-[#2563eb] bg-[#2563eb]/10 px-2 py-0.5 rounded">
                <Terminal className="h-3 w-3 shrink-0" />
                <span>Bypass Console</span>
              </div>
              <h4 className="text-xs font-black">Sandbox Instant Testing Roster Bypass</h4>
              <p className="text-[10px] text-slate-400">Quickly bypass authentication fields in local testing sandbox</p>
              
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px]">
                <button
                  onClick={() => onBypassLogin("student")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 font-bold rounded-lg border border-slate-700 flex items-center justify-between"
                >
                  <span>Student</span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                </button>
                <button
                  onClick={() => onBypassLogin("parent")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 font-bold rounded-lg border border-slate-700 flex items-center justify-between"
                >
                  <span>Parent</span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                </button>
                <button
                  onClick={() => onBypassLogin("tutor")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 font-bold rounded-lg border border-slate-700 flex items-center justify-between"
                >
                  <span>Tutor</span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
