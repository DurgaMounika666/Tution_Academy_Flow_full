/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ShieldCheck, Search, Users, ShieldAlert, DollarSign, MapPin,
  BookOpen, Mail, Terminal, Lock, CheckCircle2, ChevronRight, BarChart3, TrendingUp
} from "lucide-react";
import { Student, Tutor, FeePayment } from "../types";

interface AdminDashboardProps {
  students: Student[];
  tutors: Tutor[];
  fees: FeePayment[];
  onBypassLogin: (role: "student" | "parent" | "tutor") => void;
  onLogout: () => void;
}

interface Course {
  id: string;
  name: string;
  tutorName: string;
  category: string;
  studentsCount: number;
  duration: string;
  mode: "Online" | "Offline";
  status: "Active" | "Upcoming";
}

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

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-6 text-left">

        {/* Top welcome banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="h-14 w-14 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
              <ShieldCheck className="h-7 w-7 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-950/45 px-2.5 py-1 rounded-md">
                Master Administration Centre
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Welcome, Director Julian Vance!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Flow Campus Registrar & Financial Controller
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onLogout}
              className="rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:text-slate-355 dark:hover:bg-slate-850 font-bold px-4 py-3 text-xs tracking-tight transition-colors"
            >
              Sign Out Portal
            </button>
          </div>
        </div>

        {/* CRM Statistics row cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Enrolled Pupils</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">1,284 students</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                +14% Month-on-Month
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-500">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Active Certified Instructors</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">86 Faculities</p>
              <span className="text-[10px] text-indigo-500 font-bold">1:15 average ratio</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-500">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Outstanding Monthly Receipts</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">$84,320 USD</p>
              <span className="text-[10px] text-emerald-600 font-bold">96.8% Collection Index</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-990 flex items-center justify-center text-emerald-555">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* CORE FEATURE: Bypass login testing helper */}
        <div className="bg-gradient-to-r from-sky-550 to-indigo-600 rounded-3xl p-6 text-white border border-white/10 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md hover:shadow-xl transition-shadow cursor-default relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[70px] pointer-events-none" />

          <div className="text-left space-y-1.5 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-yellow-400/25 text-yellow-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              <Terminal className="h-3.5 w-3.5" />
              <span>Sandbox Instant Testing</span>
            </div>
            <h3 className="text-lg font-extrabold">Administrator Dashboard Role Bypass Panel</h3>
            <p className="text-xs text-sky-100 leading-normal">
              Quickly bypass login fields to test any specific user panel. Simulated data mutations will survive and populate beautifully in matching tables.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 z-10 shrink-0">
            <button
              onClick={() => onBypassLogin("student")}
              className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
            >
              <span>Student (ST-101)</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onBypassLogin("parent")}
              className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
            >
              <span>Parent (Leo Parent)</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onBypassLogin("tutor")}
              className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
            >
              <span>Tutor Desk</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Geographic distributions & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Geographics Distribution Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Location Enrollment statistics</h3>
            <div className="space-y-4">

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    <span>Hyderabad Center</span>
                  </span>
                  <span>48% (616 students)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full w-[48%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    <span>Warangal Center</span>
                  </span>
                  <span>32% (411 students)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[32%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    <span>Karimnagar Center</span>
                  </span>
                  <span>20% (257 students)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[20%]" />
                </div>
              </div>

            </div>
          </div>

          {/* Classes standard distribution (1st to 10th Class) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Class Standard Distribution</h3>
            <div className="space-y-3">
              {[
                { tag: "Primary Grades (1st-5th)", width: "35%", count: "449 kids", color: "bg-amber-400" },
                { tag: "Middle School (6th-8th)", width: "40%", count: "513 kids", color: "bg-sky-500" },
                { tag: "Secondary Grades (9th-10th)", width: "25%", count: "322 kids", color: "bg-indigo-600" }
              ].map((group, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-none">
                  <div className="flex-1 text-left space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-350">{group.tag}</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className={`${group.color} h-full`} style={{ width: group.width }} />
                    </div>
                  </div>
                  <div className="pl-6 text-right font-black text-xs text-slate-900 dark:text-white">
                    {group.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live dynamic student directory with Search & Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Student Directory & Academic Tracking</h3>
              <p className="text-xs text-slate-505">Search and view roster records with present rates</p>
            </div>

            {/* Selector Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student... (e.g. Alex)"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-205 dark:bg-slate-950 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-150 dark:border-slate-850">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-[9px] text-slate-400">
                <tr>
                  <th className="px-5 py-3 border-r border-slate-100">ID</th>
                  <th className="px-5 py-3 border-r border-slate-100">Student</th>
                  <th className="px-5 py-3 border-r border-slate-100">Class Grade</th>
                  <th className="px-5 py-3 border-r border-slate-100">Subjects Assigned Count</th>
                  <th className="px-5 py-3">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-mono border-r border-slate-100 dark:border-slate-850">{st.id}</td>
                    <td className="px-5 py-3 border-r border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white font-bold">{st.name}</td>
                    <td className="px-5 py-3 border-r border-slate-100 dark:border-slate-850">{st.grade} • {st.section}</td>
                    <td className="px-5 py-3 border-r border-slate-100 dark:border-slate-850 font-medium">
                      {st.learningSubjects.length} subjects ({st.learningSubjects.map(s => s.name.split(" ")[0]).join(", ")})
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${st.attendanceRate > 90 ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span>{st.attendanceRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial collection statuses ledgers */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Institutional Billing & Collection records</h3>
            <p className="text-xs text-slate-505 font-medium">Tracking outstanding invoice statuses across centers</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-150">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-[9px] text-slate-450 text-slate-400">
                <tr>
                  <th className="px-5 py-3 border-r border-slate-100">Invoice ID</th>
                  <th className="px-5 py-3 border-r border-slate-100">Student Name</th>
                  <th className="px-5 py-3 border-r border-slate-100">Program description</th>
                  <th className="px-5 py-3 border-r border-slate-100">Cost</th>
                  <th className="px-5 py-3">Billing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-705 dark:text-slate-300">
                {fees.map((fee) => (
                  <tr key={fee.id}>
                    <td className="px-5 py-3 font-mono border-r border-slate-100 dark:border-slate-850">{fee.id}</td>
                    <td className="px-5 py-3 border-r border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white font-bold">{fee.studentName}</td>
                    <td className="px-5 py-3 border-r border-slate-100 dark:border-slate-850">{fee.title}</td>
                    <td className="px-5 py-3 border-r border-slate-100 dark:border-slate-850 font-black">${fee.amount}.00</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-black rounded-lg ${fee.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
