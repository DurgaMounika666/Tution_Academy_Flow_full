/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GraduationCap, Users, ShieldAlert, Notebook, Shield, Key, Eye, EyeOff, Check, UserPlus } from "lucide-react";

import { Tutor } from "../types";

interface LoginGatewayProps {
  onLoginSuccess: (
    role: "student" | "parent" | "tutor" | "admin",
    userId?: string
  ) => void;
  onOpenRegister: () => void;
  registeredParents: Array<{ email: string; pass: string }>;
  tutors: Tutor[];
}

export function LoginGateway({ onLoginSuccess, onOpenRegister, registeredParents, tutors }: LoginGatewayProps) {
  const [studentId, setStudentId] = useState("ST-101");
  const [parentEmail, setParentEmail] = useState("parent@example.com");
  const [parentPassword, setParentPassword] = useState("password");
  const [tutorEmail, setTutorEmail] = useState("elena.vance@academyflow.com");
  const [tutorPassword, setTutorPassword] = useState("password");
  const [adminEmail, setAdminEmail] = useState("admin@example.com");
  const [adminPassword, setAdminPassword] = useState("password");

  const [activeTab, setActiveTab] = useState<"student" | "parent" | "tutor" | "admin">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setErrorMessage("Please specify a valid Student Identifier ID.");
      return;
    }
    setErrorMessage("");
    onLoginSuccess("student", studentId.trim().toUpperCase());
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEmail.trim() || !parentPassword.trim()) {
      setErrorMessage("Email and Password are required parameters.");
      return;
    }

    // Standard preloaded parent
    if (parentEmail === "parent@example.com" && parentPassword === "password") {
      setErrorMessage("");
      onLoginSuccess("parent", "parent@example.com");
      return;
    }

    // Dynamic registered parents check
    const matched = registeredParents.find(
      (p) => p.email.toLowerCase() === parentEmail.toLowerCase() && p.pass === parentPassword
    );
    if (matched) {
      setErrorMessage("");
      onLoginSuccess("parent", matched.email);
    } else {
      setErrorMessage("Invalid parent credentials. Try registering a new parent member first.");
    }
  };

  const handleTutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorEmail.trim() || !tutorPassword.trim()) {
      setErrorMessage("Email and Password are required parameters.");
      return;
    }

    // Check if the email belongs to our official tutor roster (prevent external source domains/logins)
    const matchedTutor = tutors.find(
      (t) => t.email.toLowerCase() === tutorEmail.trim().toLowerCase()
    );

    if (matchedTutor) {
      setErrorMessage("");
      onLoginSuccess("tutor", matchedTutor.id);
    } else {
      setErrorMessage("Access Denied: Email domain or address is from an unauthorized external source.");
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess("admin");
  };

  return (
    <div className="relative min-h-[60vh] bg-gradient-to-tr from-sky-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-sky-300/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-5xl w-full z-10">
        
        {/* Title */}
        <div className="text-center mb-10 space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/50 px-3.5 py-1.5 rounded-full">
            Authorized Personnel Access Only
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Academic Gateway
          </h1>
          <p className="text-slate-600 dark:text-slate-350 max-w-2xl mx-auto text-xs sm:text-sm">
            Select your professional portal role below to manage coursework, schedules, parent feedback parameters, and grades.
          </p>
        </div>

        {/* Roles Toggles (Grid Layout) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { id: "student", label: "Student Login", desc: "Enter Institute ID", icon: GraduationCap, color: "text-sky-600 dark:text-sky-400" },
            { id: "parent", label: "Parent Login", desc: "Progress & Fees tracker", icon: Users, color: "text-indigo-600 dark:text-indigo-400" },
            { id: "tutor", label: "Tutor Login", desc: "Grades & Attendance", icon: Notebook, color: "text-emerald-500" },
            { id: "admin", label: "Admin Login", desc: "Full Center CRM Control", icon: Shield, color: "text-amber-500" }
          ].map((role) => {
            const Icon = role.icon;
            const isActive = activeTab === role.id;
            return (
              <button
                key={role.id}
                onClick={() => { setActiveTab(role.id as any); setErrorMessage(""); }}
                className={`relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all hover:scale-[1.02] shadow-sm ${
                  isActive
                    ? "bg-white border-sky-400 ring-2 ring-sky-400/20 dark:bg-slate-900 dark:border-sky-500"
                    : "bg-white/60 border-slate-200/60 dark:bg-slate-950/40 dark:border-slate-800"
                }`}
              >
                {isActive && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
                <span className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-900 mb-2 ${role.color}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-none">{role.label}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{role.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Form block */}
        <div className="max-w-md mx-auto bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800">
          
          {errorMessage && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg p-3 text-xs text-rose-600 dark:text-rose-400 font-bold">
              {errorMessage}
            </div>
          )}

          {/* Tab 1: Student Login */}
          {activeTab === "student" && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="text-left space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Student Login</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Use unique student IDs provided directly by your local Center registrar.</p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Institute Student Identifier</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-sans">#</span>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="E.g. ST-101"
                    className="w-full pl-7 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-950 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Demo Pre-fill triggers */}
              <div className="bg-sky-50/50 dark:bg-sky-950/30 rounded-xl p-3 text-left space-y-1.5 border border-sky-100 dark:border-slate-900">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-sky-700 dark:text-sky-300">Demo Instant IDs:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setStudentId("ST-101")}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                  >
                    Alex Johnson (#ST-101)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentId("ST-102")}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                  >
                    Leo Henderson (#ST-102)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                Log In to Student Dashboard
              </button>
            </form>
          )}

          {/* Tab 2: Parent Login */}
          {activeTab === "parent" && (
            <form onSubmit={handleParentSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Parent Portal Login</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage student profiles, results logs, assigned tutors, and check pending fees. Register below if you don't have an account.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Registered Email Address</label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-950 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Account Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={parentPassword}
                    onChange={(e) => setParentPassword(e.target.value)} // keep types safe
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Demo auto logins */}
              <div className="bg-sky-50/50 dark:bg-sky-950/30 rounded-xl p-3 text-left space-y-1 border border-sky-105 dark:border-slate-900">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-sky-700 dark:text-sky-300">Click to Preload Credentials:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setParentEmail("parent@example.com"); setParentPassword("password"); }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                  >
                    Mrs. Henderson Account
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
                >
                  Log In to Parent Centre
                </button>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="w-full border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-800 dark:text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register for a New Member Account</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Tutor Login */}
          {activeTab === "tutor" && (
            <form onSubmit={handleTutorSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Tutor Login</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Expert tutor interface to trace class rosters, enter assessments, and record attendance details.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Instructor Registered Email</label>
                <input
                  type="email"
                  value={tutorEmail}
                  onChange={(e) => setTutorEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-55 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  value={tutorPassword}
                  onChange={(e) => setTutorPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-55 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>

              {/* Demo selector */}
              <div className="bg-sky-50/50 dark:bg-sky-950/30 rounded-xl p-3 border border-sky-100 dark:border-slate-900 space-y-1">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-sky-700 dark:text-sky-300">Demo Instant IDs:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setTutorEmail("elena.vance@academyflow.com"); setTutorPassword("password"); }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-750 dark:text-slate-200 rounded-lg text-[10px] font-bold"
                  >
                    Dr. Elena Vance (Maths)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTutorEmail("julian.thorne@academyflow.com"); setTutorPassword("password"); }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-750 dark:text-slate-200 rounded-lg text-[10px] font-bold"
                  >
                    Prof. Julian Thorne (Physics)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                Log In to Instructors Dashboard
              </button>
            </form>
          )}

          {/* Tab 4: Admin Login */}
          {activeTab === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Admin Management</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Access master center financial dashboards, geolocation geography charts, and assigned class rosters.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Administrator Mail ID</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-55 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Admin Security Key</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-55 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="bg-sky-50/50 dark:bg-sky-950/30 rounded-xl p-3 border border-sky-100 dark:border-slate-900 space-y-1">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-sky-700 dark:text-sky-300">Admin Bypass Account:</span>
                <div>
                  <button
                    type="button"
                    onClick={() => { setAdminEmail("admin@example.com"); setAdminPassword("password"); }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-750 dark:text-slate-200 rounded-lg text-[10px] font-bold"
                  >
                    Load Julian Vance Account (Admin)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                Log In to Administrator Portal
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
