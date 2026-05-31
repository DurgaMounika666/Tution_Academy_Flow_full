/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, CheckSquare, Bookmark, CalendarPlus, HelpCircle, UserCheck, 
  TrendingUp, Award, Clock, ArrowRight, BookOpen, AlertCircle, Sparkles, Check 
} from "lucide-react";
import { Student, Tutor, Assignment } from "../types";

interface TutorDashboardProps {
  students: Student[];
  assignments: Assignment[];
  onUpdateStudents: (updated: Student[]) => void;
  onUpdateAssignments: (updated: Assignment[]) => void;
  onLogout: () => void;
}

export function TutorDashboard({ 
  students, assignments, onUpdateStudents, onUpdateAssignments, onLogout 
}: TutorDashboardProps) {
  
  const [selectedStudentId, setSelectedStudentId] = useState("ST-101"); // Alex Johnson by default
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Form states
  const [targetSubject, setTargetSubject] = useState("Advanced Mathematics");
  const [mathsVal, setMathsVal] = useState(85);
  const [physicsVal, setPhysicsVal] = useState(80);
  const [litVal, setLitVal] = useState(90);

  // Assignment states
  const [newTitle, setNewTitle] = useState("");
  const [newSubj, setNewSubj] = useState("Algebraic Systems");
  const [newDue, setNewDue] = useState("2026-06-15");

  const [notif, setNotif] = useState("");

  const handleToggleAttendance = () => {
    const updated = students.map((s) => {
      if (s.id === selectedStudentId) {
        const isPresentIncrease = s.attendanceRate < 98;
        const presentDiff = isPresentIncrease ? 1 : 0;
        const absentDiff = isPresentIncrease ? 0 : 1;
        const nextPresent = s.presentCount + presentDiff;
        const nextAbsent = s.absentCount + absentDiff;
        const total = nextPresent + nextAbsent;
        const rate = total > 0 ? Math.round((nextPresent / total) * 100) : 100;
        return {
          ...s,
          presentCount: nextPresent,
          absentCount: nextAbsent,
          attendanceRate: rate
        };
      }
      return s;
    });
    onUpdateStudents(updated);
    setNotif("Attendance stats calibrated successfully in database!");
    setTimeout(() => setNotif(""), 3000);
  };

  const handleUpdateScores = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = students.map((s) => {
      if (s.id === selectedStudentId) {
        
        // Calculate new GPA based on scores
        const avg = (mathsVal + physicsVal + litVal) / 3;
        const calcGPA = Number((avg / 25).toFixed(2)); // approximate GPA (4.0 max scale)

        // Find current results term or append a new Term update
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
        } else {
          nextResults.push({
            term: "Current",
            gpa: calcGPA,
            mathsScore: mathsVal,
            physicsScore: physicsVal,
            literatureScore: litVal,
            compSciScore: 80
          });
        }

        return {
          ...s,
          results: nextResults
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setNotif(`Grades updated safely for ${activeStudent.name}! Core GPA updated to ${((mathsVal + physicsVal + litVal)/3/25).toFixed(2)}`);
    setTimeout(() => setNotif(""), 4000);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAsst: Assignment = {
      id: `A-${Math.floor(920 + Math.random() * 80)}`,
      title: newTitle.trim(),
      subject: newSubj,
      dueDate: newDue,
      submissionsPending: activeStudent.presentCount > 50 ? 15 : 8,
      status: "Active"
    };

    onUpdateAssignments([newAsst, ...assignments]);
    setNewTitle("");
    setNotif(`New academic assignment '${newTitle}' created and pushed to rosters!`);
    setTimeout(() => setNotif(""), 3000);
  };

  const handleWhatsAppManager = () => {
    const textMsg = encodeURIComponent(
      `Hello Admin Desk! This is registered instructor requesting academic coordination regarding student: ${activeStudent.name} (ID: ${activeStudent.id}) scores.`
    );
    // Redirect WhatsApp to Admin: [6300227011]
    window.open(`https://wa.me/916300227011?text=${textMsg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-6 text-left">
        
        {/* Top welcome banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="h-14 w-14 rounded-2xl bg-emerald-650 flex items-center justify-center text-white shadow-md">
              <Award className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/45 px-2.5 py-1 rounded-md">
                Certified Faculty Portal
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Welcome back, Faculty Member!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Dr. Elena Vance & Prof. Julian Thorne Integrated CRM
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleWhatsAppManager}
              className="rounded-xl bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 font-extrabold px-4.5 py-3 text-xs tracking-tight shadow-sm hover:opacity-90 inline-flex items-center gap-1.5"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Contact Admin Hotline (6300227011)</span>
            </button>
            <button
              onClick={onLogout}
              className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850 font-bold px-4 py-3 text-xs tracking-tight transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {notif && (
          <div className="bg-sky-50 dark:bg-sky-955/30 border border-sky-200 dark:border-sky-900 p-4 rounded-xl text-xs text-sky-700 dark:text-sky-305 font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-500 animate-spin" />
            <span>{notif}</span>
          </div>
        )}

        {/* Picker bar of student children */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <span className="text-xs font-black uppercase text-slate-500">Pick Student to Evaluate:</span>
          <div className="flex flex-wrap gap-2">
            {students.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStudentId(st.id);
                  const lastRes = st.results?.[st.results.length - 1];
                  if (lastRes) {
                    setMathsVal(lastRes.mathsScore || 85);
                    setPhysicsVal(lastRes.physicsScore || 80);
                    setLitVal(lastRes.literatureScore || 82);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedStudentId === st.id 
                    ? "bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow" 
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {st.name} ({st.grade})
              </button>
            ))}
          </div>
        </div>

        {/* Core Layout forms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Roll-out grades scores & attendance logs (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Form: Enter marks & scores and calculate GPA */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Record Assessment Scores — {activeStudent.name}</h3>
                <p className="text-xs text-slate-500">Enter percentage grades to calculate GPA metrics in CRM database</p>
              </div>

              <form onSubmit={handleUpdateScores} className="space-y-4 text-xs font-semibold">
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600">Mathematics Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={mathsVal}
                      onChange={(e) => setMathsVal(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-205 dark:bg-slate-950"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-600">Physics Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={physicsVal}
                      onChange={(e) => setPhysicsVal(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-205 dark:bg-slate-950"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-600">Literature score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={litVal}
                      onChange={(e) => setLitVal(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-205 dark:bg-slate-950"
                      required
                    />
                  </div>
                </div>

                {/* Compute and display GPA feedback before saving */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl flex justify-between items-center text-xs border border-slate-100">
                  <span className="text-slate-500 font-bold">Computed New Student GPA:</span>
                  <strong className="text-sky-650 dark:text-sky-400 text-sm">
                    {((mathsVal + physicsVal + litVal) / 3 / 25).toFixed(2)} GPA out of 4.0
                  </strong>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3 rounded-xl text-xs transition-all active:scale-95"
                >
                  Save assessment entries & update GPA Card
                </button>
              </form>
            </div>

            {/* Attendance modification toggler */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Class Attendance Log Registry</h3>
                <p className="text-xs text-slate-500">Log present/absent ratios quickly below for selected pupil.</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 gap-3">
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Roster Tracking: {activeStudent.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Current Log Rate: <strong className="text-sky-600">{activeStudent.attendanceRate}%</strong> ({activeStudent.presentCount} present logs)</p>
                </div>

                {/* Simulated checkbox/button toggle */}
                <button
                  onClick={handleToggleAttendance}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-400 rounded-xl text-[10px] font-bold hover:bg-emerald-100 flex items-center gap-1"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Mark Lesson Day Present (+1 Score)</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Create homework, active assignments table (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Form: Create new homework */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Assign Course Homework</h3>
                <p className="text-xs text-slate-505">Push immediate student dashboard assignment notifications</p>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs font-semibold">
                
                <div className="space-y-1.5">
                  <label className="text-slate-600">Homework title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g. Calculus Quiz 3: Integrals"
                    className="w-full p-2.5 rounded-xl border border-slate-205 dark:bg-slate-950"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600">Category Specialty</label>
                    <select
                      value={newSubj}
                      onChange={(e) => setNewSubj(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-205 dark:bg-slate-950"
                    >
                      <option value="Algebraic Systems">Algebraic Systems</option>
                      <option value="Advanced Calculus">Advanced Calculus</option>
                      <option value="Physics Thermodynamics">Physics Thermodynamics</option>
                      <option value="Computer Science Principles">Computer Science Principles</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600">Due calendar</label>
                    <input
                      type="date"
                      value={newDue}
                      onChange={(e) => setNewDue(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-205 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span>Assign Homework Module</span>
                </button>
              </form>
            </div>

            {/* List of active homework entries */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Active Course assignments</h3>
              
              <div className="space-y-2.5">
                {assignments.map((asst) => (
                  <div key={asst.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white leading-tight">{asst.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{asst.subject} • Due: {asst.dueDate}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        {asst.submissionsPending} pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
